import { IXyoPlugin, IXyoGraphQlDelegate, IXyoPluginDelegate, XyoPluginProviders, XyoBase } from '@xyo-network/sdk-base-nodejs'
import { XyoBoundWitnessInserter, XyoObjectSchema, XyoBoundWitness, XyoIterableStructure, XyoStructure, XyoSchema, gpsResolver, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import ngeohash from 'ngeohash'
import bs58 from 'bs58'
import ws from 'ws'
import http from 'http'
import fs from 'fs'

class XyoWebsocketNotify extends XyoBase implements IXyoPlugin {
  private clients : {[key: string]: ws} = {}
  private client: ws.Server | undefined

  public getName(): string {
    return 'notify-on-location'
  }

  public getProvides(): string[] {
    return []
  }
  public getPluginDependencies(): string[] {
    return [
      XyoPluginProviders.BOUND_WITNESS_INSERTER
    ]
  }

  private onConnection = (connection : ws) => {
    const key = Math.random().toString()

    this.clients[key] = connection

    connection.on('close', () => {
      delete this.clients[key]
      connection.close()
    })

    connection.on('error', () => {
      delete this.clients[key]
      connection.close()
    })

    connection.on('unexpected-response', () => {
      delete this.clients[key]
      connection.close()
    })
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const inserter = delegate.deps.BOUND_WITNESS_INSERTER as XyoBoundWitnessInserter

    const server = http.createServer()
    this.client = new ws.Server({ server })
    this.client.on('connection', this.onConnection)

    server.listen(11002)

    inserter.addBlockListener('notify-on-location', async(boundWitness) => {
      const bridgeBlocks = this.getNestedObjectType(new XyoBoundWitness(boundWitness), XyoObjectSchema.WITNESS, XyoObjectSchema.BRIDGE_BLOCK_SET)

      await this.sendBlock(new XyoBoundWitness(boundWitness), false)

      if (bridgeBlocks) {
        const it = (bridgeBlocks as XyoIterableStructure).newIterator()

        while (it.hasNext()) {
          await this.sendBlock(new XyoBoundWitness(it.next().value.getAll()), true)
        }
      }

    })

    return true
  }

  private async sendBlock(block: XyoBoundWitness, isBridge: boolean) {
    const geohash = this.getGeohash(block)

    if (geohash) {
      const hash = bs58.encode(block.getHash(new XyoSha256()).getAll().getContentsCopy())
      console.log(hash)

      for (const key of Object.keys(this.clients)) {
        const socket = this.clients[key]

        socket.send(JSON.stringify({
          hash,
          geohash,
          isBridge
        }))
      }
    }
  }

  private getNestedObjectType(boundWitness: XyoBoundWitness, rootSchema: XyoSchema, subSchema: XyoSchema): XyoStructure | undefined {
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (bwItem.getSchema().id === rootSchema.id && bwItem instanceof XyoIterableStructure) {
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
          const point = gpsResolver.resolve(huerestic.getAll().getContentsCopy()).value
          const geohash = ngeohash.encode(point.lat, point.lng)
        // this.logInfo(`Adding geohash: ${geohash} at ${point.lat}, ${point.lng}`)
          return geohash
        }
      }
    }
  }
}

module.exports = new XyoWebsocketNotify()
