import {
  IXyoPlugin,
  IXyoPluginDelegate,
  XyoPluginProviders,
} from '@xyo-network/sdk-base-nodejs'
import {
  XyoBlockByPublicKeyRepository,
  XyoBlocksByGeohashRepository,
  XyoBlocksByTime,
  XyoOriginBlockGetter,
  XyoOriginBlockRepository,
} from '@xyo-network/sdk-core-nodejs'

import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'

interface IXyoDynamoRepositoryConfig {
  region?: string
  tablePrefix?: string
}

export class XyoArchivistDynamoRepositoryPlugin implements IXyoPlugin {
  public BLOCK_REPOSITORY_GET: XyoOriginBlockGetter | undefined
  public BLOCK_REPOSITORY_ADD: XyoOriginBlockRepository | undefined
  public BLOCK_REPOSITORY_PUBLIC_KEY: XyoBlockByPublicKeyRepository | undefined
  public BLOCK_REPOSITORY_PUBLIC_GEOHASH:
    | XyoBlocksByGeohashRepository
    | undefined
  public BLOCK_REPOSITORY_TIME: XyoBlocksByTime | undefined

  public getName(): string {
    return 'archivist-dynamo-repository'
  }

  public getProvides(): string[] {
    return [
      XyoPluginProviders.BLOCK_REPOSITORY_GET,
      XyoPluginProviders.BLOCK_REPOSITORY_ADD,
      XyoPluginProviders.BLOCK_REPOSITORY_PUBLIC_KEY,
      XyoPluginProviders.BLOCK_REPOSITORY_PUBLIC_GEOHASH,
      'BLOCK_REPOSITORY_TIME',
    ]
  }
  public getPluginDependencies(): string[] {
    return []
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const dbConfig = delegate.config as IXyoDynamoRepositoryConfig
    const db = new XyoArchivistDynamoRepository(
      dbConfig.tablePrefix,
      dbConfig.region
    )

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
