import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { XyoBoundWitness, XyoSha256, XyoObjectSchema, gpsResolver } from '@xyo-network/sdk-core-nodejs'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import bs58 from 'bs58'
import ngeohash from 'ngeohash'
import { ArchivistAbsorber } from '../../absorb/archivist-absorber'
import { Client, BulkIndexDocumentsParams } from 'elasticsearch'

const hasher = new XyoSha256()
class Migrator extends XyoBase {
  private db: XyoArchivistDynamoRepository

  constructor(db: XyoArchivistDynamoRepository)  {
    super()
    this.db = db
  }

  public async migrate() {
    const absorber = new ArchivistAbsorber(process.argv[2])

    while (true) {
      const blocks = await absorber.readBlocks(1000)

      const client = new Client({
        host: 'https://search-xyo-archivist-geohash-dswz22xbqpqxte3fls5fzpuf5u.us-east-1.es.amazonaws.com'
      })

      const bulks: any[] = []

      blocks.forEach((block) => {
        const bw = new XyoBoundWitness(block)
        const geohash = getGeohash(bw)

        if (geohash) {
          const hash = bs58.encode(bw.getHash(hasher).getAll().getContentsCopy())
          bulks.push({ index:  { _index: 'geohash', _type: 'bound_witness', _id: hash } })
          bulks.push({
            geohash,
            g1: geohash[0],
            g2: geohash[0] + geohash[1],
            g3: geohash[0] + geohash[1] + geohash[2],
            g4: geohash[0] + geohash[1] + geohash[2] + geohash[3],
            g5: geohash[0] + geohash[1] + geohash[2] + geohash[3] + geohash[4],
            g6: geohash[0] + geohash[1] + geohash[2] + geohash[3] + geohash[4]  + geohash[5],
          })
        }
      })

      const insert: BulkIndexDocumentsParams = {
        index: 'geohash',
        body: bulks
      }

      await new Promise((resolve, reject) => {
        client.bulk(insert, (e, r) => {
          if (e) {
            reject(e)
          }

          resolve(r)
        })
      })
    }

    // while (true) {
    //   // this.logInfo(`Migrating 50 blocks starting at offset hash: ${offset && bs58.encode(offset)}`)
    //   const blocks = await absorber.readBlocks(50)

    //   await Promise.all(blocks.map(async(block) => {
    //     try {
    //       const bw = new XyoBoundWitness(block)
    //       const hash = bw.getHash(hasher).getAll().getContentsCopy()
    //       await this.db.addOriginBlock(hash, block)
    //     } catch (e) {
    //       this.logError(`Error adding block ${e}`)
    //     }
    //   }))

    //   if (blocks.length < 49) {
    //     this.logInfo(`Finished migration ${blocks.length}`)
    //     break
    //   }
    // }

  }
}

const getGeohash = (boundWitness: XyoBoundWitness): string | undefined => {
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

async function main() {
  const db = new XyoArchivistDynamoRepository()
  await db.initialize()
  const migrator = new Migrator(db)
  migrator.migrate()

}

// main()
