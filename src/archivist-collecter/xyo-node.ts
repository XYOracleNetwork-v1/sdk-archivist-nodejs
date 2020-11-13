/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts

 * @Last modified time: Wednesday, 13th March 2019 4:07:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  IXyoBoundWitnessMutexDelegate,
  XyoBase,
} from '@xyo-network/sdk-base-nodejs'
import {
  addAllDefaults,
  XyoBoundWitnessInserter,
  XyoGenesisBlockCreator,
  XyoNetworkHandler,
  XyoNetworkPipe,
  XyoOriginBlockRepository,
  XyoOriginPayloadConstructor,
  XyoOriginState,
  XyoServerTcpNetwork,
  XyoSha256,
  XyoZigZagBoundWitnessHander,
} from '@xyo-network/sdk-core-nodejs'
import bs58 from 'bs58'

import { receiveProcedureCatalog } from './xyo-recive-catalog'

export class XyoNode extends XyoBase {
  public network: XyoServerTcpNetwork
  public blockRepository: XyoOriginBlockRepository
  public state: XyoOriginState
  public hasher: XyoSha256
  public inserter: XyoBoundWitnessInserter
  public payloadProvider: XyoOriginPayloadConstructor
  public handler: XyoZigZagBoundWitnessHander
  public mutexHandler: IXyoBoundWitnessMutexDelegate

  constructor(
    port: number,
    state: XyoOriginState,
    blockRepository: XyoOriginBlockRepository,
    mutexHandler: IXyoBoundWitnessMutexDelegate
  ) {
    super()
    this.blockRepository = blockRepository
    this.state = state
    this.mutexHandler = mutexHandler

    this.network = new XyoServerTcpNetwork(port)
    this.hasher = new XyoSha256()
    this.inserter = new XyoBoundWitnessInserter(
      this.hasher,
      this.state,
      this.blockRepository
    )
    this.payloadProvider = new XyoOriginPayloadConstructor(this.state)
    this.handler = new XyoZigZagBoundWitnessHander(this.payloadProvider)

    addAllDefaults()
  }

  private handlePipe = async (pipe: XyoNetworkPipe) => {
    this.network.stopListening()
    this.logInfo('New archivist request!')

    if (!this.mutexHandler.acquireMutex()) {
      await pipe.close()
      this.network.startListening()
      return
    }

    try {
      const networkHandle = new XyoNetworkHandler(pipe)
      const boundWitness = await this.handler.boundWitness(
        networkHandle,
        receiveProcedureCatalog,
        this.state.getSigners()
      )

      if (boundWitness) {
        await this.inserter.insert(boundWitness)
      }
    } catch (error) {
      this.logWarning(`Error creating bound witness: ${error}`)
    }

    await pipe.close()
    this.mutexHandler.releaseMutex()
    this.network.startListening()
  }

  public async start() {
    if (this.state.getIndexAsNumber() === 0) {
      const genesisBlock = await XyoGenesisBlockCreator.create(
        this.state.getSigners(),
        this.payloadProvider
      )
      this.logInfo(
        `Created genesis block with hash: ${bs58.encode(
          genesisBlock.getHash(this.hasher).getAll().getContentsCopy()
        )}`
      )
      await this.inserter.insert(genesisBlock)
    }

    this.network.onPipeCreated = (pipe) => {
      this.handlePipe(pipe)
      return true
    }

    this.network.startListening()
  }

  // eslint-disable-next-line require-await
  public async stop() {
    this.network.stopListening()
  }
}
