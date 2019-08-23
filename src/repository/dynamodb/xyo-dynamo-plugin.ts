import { IXyoPlugin, IXyoPluginDelegate, XyoPluginProviders } from '@xyo-network/sdk-base-nodejs'
import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IXyoOriginBlockGetter, IXyoOriginBlockRepository, IXyoBlockByPublicKeyRepository, IXyoBlocksByGeohashRepository, IXyoBlocksByTime } from '@xyo-network/sdk-core-nodejs'

interface IXyoDynamoRepositoryConfig {
  tablePrefix?: string,
  region?: string
}

export class XyoArchivistDynamoRepositoryPlugin implements IXyoPlugin {
  public BLOCK_REPOSITORY_GET: IXyoOriginBlockGetter | undefined
  public BLOCK_REPOSITORY_ADD: IXyoOriginBlockRepository | undefined
  public BLOCK_REPOSITORY_PUBLIC_KEY: IXyoBlockByPublicKeyRepository | undefined
  public BLOCK_REPOSITORY_PUBLIC_GEOHASH: IXyoBlocksByGeohashRepository | undefined
  public BLOCK_REPOSITORY_TIME: IXyoBlocksByTime | undefined

  public getName(): string {
    return 'archivist-dynamo-repository'
  }

  public getProvides(): string[] {
    return [
      XyoPluginProviders.BLOCK_REPOSITORY_GET,
      XyoPluginProviders.BLOCK_REPOSITORY_ADD,
      XyoPluginProviders.BLOCK_REPOSITORY_PUBLIC_KEY,
      XyoPluginProviders.BLOCK_REPOSITORY_PUBLIC_GEOHASH,
      'BLOCK_REPOSITORY_TIME'
    ]
  }
  public getPluginDependencies(): string[] {
    return []
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const dbConfig = delegate.config as IXyoDynamoRepositoryConfig
    const db = new XyoArchivistDynamoRepository(dbConfig.tablePrefix, dbConfig.region)

    this.BLOCK_REPOSITORY_GET = db
    this.BLOCK_REPOSITORY_ADD = db
    this.BLOCK_REPOSITORY_PUBLIC_KEY = db
    this.BLOCK_REPOSITORY_PUBLIC_GEOHASH = db
    this.BLOCK_REPOSITORY_TIME = db

    await db.initialize()

    return true
  }

}

module.exports = new XyoArchivistDynamoRepositoryPlugin()
