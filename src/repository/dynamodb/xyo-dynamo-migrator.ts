import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import bs58 from 'bs58'

const hasher = new XyoSha256()
class Migrator extends XyoBase {
  private db: XyoArchivistDynamoRepository

  constructor(db: XyoArchivistDynamoRepository)  {
    super()
    this.db = db
  }

  public async migrate() {
    let offset: Buffer | undefined = bs58.decode(process.argv[2])

    while (true) {
      this.logInfo(`Migrating 50 blocks starting at offset hash: ${offset && bs58.encode(offset)}`)
      const blocks = (await this.db.getOriginBlocks(50, offset)).items as Buffer[]

      await Promise.all(blocks.map(async(block) => {
        try {
          const bw = new XyoBoundWitness(block)
          const hash = bw.getHash(hasher).getAll().getContentsCopy()
          offset = hash
          await this.db.addOriginBlockPublicKeys(hash, block)
        } catch (e) {
          this.logError(`Error adding block ${e}`)
        }
      }))

      if (blocks.length < 99) {
        this.logInfo(`Finished migration ${blocks.length}`)
        break
      }

      const bw = new XyoBoundWitness(blocks[blocks.length - 1])
      offset = bw.getHash(hasher).getAll().getContentsCopy()

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
