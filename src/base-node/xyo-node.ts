/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 8th February 2019 3:47:53 pm
 * @Email:  developer@xyfindables.com
 * @Filename: xyo-node.ts

 * @Last modified time: Wednesday, 13th March 2019 4:07:06 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { receiveProcedureCatalog } from './xyo-recive-catalog'
import {
    XyoServerTcpNetwork,
    XyoFileOriginStateRepository,
    XyoMemoryBlockRepository,
    XyoOriginState,
    XyoSha256,
    XyoOriginPayloadConstructor,
    XyoZigZagBoundWitnessHander,
    XyoSecp2556k1,
    XyoGenesisBlockCreator,
    XyoNetworkHandler,
    XyoBoundWitnessInserter,
    IXyoOriginBlockRepository} from '@xyo-network/sdk-core-nodejs'
import _ from 'lodash'
import bs58 from 'bs58'

export class XyoNode extends XyoBase {

  public network: XyoServerTcpNetwork
  public stateRepo: XyoFileOriginStateRepository
  public blockRepo: IXyoOriginBlockRepository
  public state: XyoOriginState
  public hasher: XyoSha256
  public inserter: XyoBoundWitnessInserter
  public payloadProvider: XyoOriginPayloadConstructor
  public handler: XyoZigZagBoundWitnessHander

  constructor(port: number, statePath: string, blockRepository: IXyoOriginBlockRepository) {
    super()
    this.blockRepo = blockRepository
    this.network = new XyoServerTcpNetwork(port)
    this.stateRepo = new XyoFileOriginStateRepository(statePath)

    this.state = new XyoOriginState(this.stateRepo)
    this.hasher = new XyoSha256()
    this.inserter = new XyoBoundWitnessInserter(this.hasher, this.state, this.blockRepo)
    this.payloadProvider = new XyoOriginPayloadConstructor(this.state)
    this.handler = new XyoZigZagBoundWitnessHander(this.payloadProvider)
  }

  public async start() {
    await this.stateRepo.restore((privateKey: Buffer) => {
      return new XyoSecp2556k1(privateKey)
    })

    if (this.state.getIndexAsNumber() === 0) {
      this.state.addSigner(new XyoSecp2556k1())
      const genesisBlock =  await XyoGenesisBlockCreator.create(this.state.getSigners(), this.payloadProvider)
      this.logInfo(`Created genesis block with hash: ${bs58.encode(genesisBlock.getHash(this.hasher).getAll().getContentsCopy())}`)
      await this.inserter.insert(genesisBlock)
    }

    this.logInfo(`Using public key: ${bs58.encode(this.state.getSigners()[0].getPublicKey().getAll().getContentsCopy())}`)

    this.network.onPipeCreated = async(pipe) => {
      this.network.stopListening()
      this.logInfo('New request!')
      try {
        const networkHandle = new XyoNetworkHandler(pipe)
        const boundWitness = await this.handler.boundWitness(networkHandle, receiveProcedureCatalog, this.state.getSigners())

        if (boundWitness) {
          await this.inserter.insert(boundWitness)
        }

        pipe.close()
      } catch (error) {
        this.logWarning(`Error creating bound witness: ${error}`)
      }

      this.network.startListening()
    }

    this.network.startListening()
  }

  public async stop() {
    this.network.stopListening()
  }
}
