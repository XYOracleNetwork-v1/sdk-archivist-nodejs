import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import bs58 from 'bs58'
import { ArchivistAbsorber } from '../../absorb/archivist-absorber'

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
      // this.logInfo(`Migrating 50 blocks starting at offset hash: ${offset && bs58.encode(offset)}`)
      const blocks = await absorber.readBlocks(50)

      await Promise.all(blocks.map(async(block) => {
        try {
          const bw = new XyoBoundWitness(block)
          const hash = bw.getHash(hasher).getAll().getContentsCopy()
          await this.db.addGeoIndex(hash, block)
        } catch (e) {
          this.logError(`Error adding block ${e}`)
        }
      }))

      if (blocks.length < 49) {
        this.logInfo(`Finished migration ${blocks.length}`)
        break
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

main()
