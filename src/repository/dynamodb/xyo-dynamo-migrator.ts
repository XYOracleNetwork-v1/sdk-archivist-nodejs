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
    let offset: Buffer | undefined = undefined

    while (true) {
      this.logInfo(`Migrating 500 blocks starting at offset hash: ${offset && bs58.encode(offset)}`)
      const blocks = (await this.db.getOriginBlocks(500, offset)).items as Buffer[]

      for (const block of blocks) {
        const bw = new XyoBoundWitness(block)
        const hash = bw.getHash(hasher).getAll().getContentsCopy()
        offset = hash
        await this.db.addOriginBlockPublicKeys(hash, block)
      }

      if (blocks.length < 499) {
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
