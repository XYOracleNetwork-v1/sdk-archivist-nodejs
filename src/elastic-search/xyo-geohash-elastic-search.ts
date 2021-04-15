/* eslint-disable require-await */
import {
  IXyoPlugin,
  IXyoPluginDelegate,
  XyoBase,
  XyoPluginProviders,
} from '@xyo-network/sdk-base-nodejs'
import {
  gpsResolver,
  XyoBoundWitness,
  XyoBoundWitnessInserter,
  XyoIterableStructure,
  XyoObjectSchema,
  XyoSchema,
  XyoSha256,
  XyoStructure,
} from '@xyo-network/sdk-core-nodejs'
import bs58 from 'bs58'
import { Client } from 'elasticsearch'
import ngeohash from 'ngeohash'

class XyoElasticGeohash extends XyoBase implements IXyoPlugin {
  private blockQueue: any[] = []
  private client: Client | undefined

  public getName(): string {
    return 'elastic-geohash'
  }

  public getProvides(): string[] {
    return []
  }
  public getPluginDependencies(): string[] {
    return [XyoPluginProviders.BOUND_WITNESS_INSERTER]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const inserter = delegate.deps
      .BOUND_WITNESS_INSERTER as XyoBoundWitnessInserter
    this.client = new Client({
      host: delegate.config.host,
    })

    inserter.addBlockListener('elastic-geohash', async (boundWitness) => {
      const bridgeBlocks = this.getNestedObjectType(
        new XyoBoundWitness(boundWitness),
        XyoObjectSchema.WITNESS,
        XyoObjectSchema.BRIDGE_BLOCK_SET
      )

      this.addToQueue(new XyoBoundWitness(boundWitness))

      if (bridgeBlocks) {
        const it = (bridgeBlocks as XyoIterableStructure).newIterator()

        while (it.hasNext()) {
          this.addToQueue(new XyoBoundWitness(it.next().value.getAll()))
        }
      }

      await this.checkQueue()
    })

    return true
  }

  private async checkQueue() {
    this.logInfo(`Elastic queue size: ${this.blockQueue.length / 2}`)
    if (this.blockQueue.length > 500) {
      this.logInfo(`Elastic inserting records: ${this.blockQueue.length / 2}`)
      await new Promise((resolve, reject) => {
        this.client?.bulk(
          {
            body: this.blockQueue,
            index: 'geohash',
          },
          (error) => {
            if (error) {
              this.logError(`Elastic inserting records error: ${error}`)

              reject(error)
            }

            this.logInfo('Elastic inserting records success')

            resolve(true)
          }
        )
      })

      this.blockQueue = []
    }
  }

  private async addToQueue(block: XyoBoundWitness) {
    const geohash = this.getGeohash(block)

    if (geohash) {
      const hash = bs58.encode(
        block.getHash(new XyoSha256()).getAll().getContentsCopy()
      )
      this.blockQueue.push({
        index: { _id: hash, _index: 'geohash', _type: 'bound_witness' },
      })
      this.blockQueue.push({
        g1: geohash[0],
        g2: geohash[0] + geohash[1],
        g3: geohash[0] + geohash[1] + geohash[2],
        g4: geohash[0] + geohash[1] + geohash[2] + geohash[3],
        g5: geohash[0] + geohash[1] + geohash[2] + geohash[3] + geohash[4],
        g6:
          geohash[0] +
          geohash[1] +
          geohash[2] +
          geohash[3] +
          geohash[4] +
          geohash[5],
        geohash,
      })
    }
  }

  private getNestedObjectType(
    boundWitness: XyoBoundWitness,
    rootSchema: XyoSchema,
    subSchema: XyoSchema
  ): XyoStructure | undefined {
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (
        bwItem.getSchema().id === rootSchema.id &&
        bwItem instanceof XyoIterableStructure
      ) {
        const fetterIt = bwItem.newIterator()

        while (fetterIt.hasNext()) {
          const fetterItem = fetterIt.next().value

          if (fetterItem.getSchema().id === subSchema.id) {
            return fetterItem
          }
        }
      }
    }

    return
  }

  private getGeohash(boundWitness: XyoBoundWitness): string | undefined {
    for (const party of boundWitness.getHeuristics()) {
      for (const huerestic of party) {
        if (huerestic.getSchema().id === XyoObjectSchema.GPS.id) {
          const point = gpsResolver.resolve(
            huerestic.getAll().getContentsCopy()
          ).value
          const geohash = ngeohash.encode(point.lat, point.lng)
          // this.logInfo(`Adding geohash: ${geohash} at ${point.lat}, ${point.lng}`)
          return geohash
        }
      }
    }
  }
}

module.exports = new XyoElasticGeohash()
