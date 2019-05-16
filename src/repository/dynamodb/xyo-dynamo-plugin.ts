import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate } from '@xyo-network/sdk-base-nodejs'
import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IXyoOriginBlockGetter, IXyoOriginBlockRepository, IXyoBlockByPublicKeyRepository } from '@xyo-network/sdk-core-nodejs'

interface IXyoDynamoRepositoryConfig {
  tablePrefix?: string,
  region?: string
}

export class XyoArchivistDynamoRepositoryPlugin implements IXyoPlugin {
  public BLOCK_REPOSITORY_GET: IXyoOriginBlockGetter | undefined
  public BLOCK_REPOSITORY_ADD: IXyoOriginBlockRepository | undefined
  public BLOCK_REPOSITORY_PUBLIC_KEY: IXyoBlockByPublicKeyRepository | undefined

  public getName(): string {
    return 'archivist-dynamo-repository'
  }

  public getProvides(): string[] {
    return [
      'BLOCK_REPOSITORY_GET',
      'BLOCK_REPOSITORY_ADD',
      'BLOCK_REPOSITORY_PUBLIC_KEY',
    ]
  }
  public getPluginDependencies(): string[] {
    return []
  }

  public async initialize(deps: { [key: string]: any; }, config: any): Promise<boolean> {
    const dbConfig = config as IXyoDynamoRepositoryConfig
    const db = new XyoArchivistDynamoRepository(dbConfig.tablePrefix, dbConfig.region)

    this.BLOCK_REPOSITORY_GET = db
    this.BLOCK_REPOSITORY_ADD = db
    this.BLOCK_REPOSITORY_PUBLIC_KEY = db

    const r = await db.geoTable.getByGeohash('9yu', 100)

    console.log(r.length)

    await db.initialize()

    return true
  }

}

module.exports = new XyoArchivistDynamoRepositoryPlugin()
