import { IXyoPlugin, IXyoPluginDelegate, XyoPluginProviders } from '@xyo-network/sdk-base-nodejs'
import { IXyoOriginBlockGetter, IXyoOriginBlockRepository, IXyoBlockByPublicKeyRepository, IXyoBlocksByGeohashRepository } from '@xyo-network/sdk-core-nodejs'
import { XyoArchivistLevelRepository } from '../xyo-level-archivist-repository'

class XyoArchivistLevelRepositoryPlugin implements IXyoPlugin {
  public BLOCK_REPOSITORY_GET: IXyoOriginBlockGetter | undefined
  public BLOCK_REPOSITORY_ADD: IXyoOriginBlockRepository | undefined

  public getName(): string {
    return 'archivist-level-repository'
  }

  public getProvides(): string[] {
    return [
      XyoPluginProviders.BLOCK_REPOSITORY_GET,
      XyoPluginProviders.BLOCK_REPOSITORY_ADD
    ]
  }
  public getPluginDependencies(): string[] {
    return []
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const db = new XyoArchivistLevelRepository(delegate.config.path)

    this.BLOCK_REPOSITORY_GET = db
    this.BLOCK_REPOSITORY_ADD = db

    await db.initialize()

    return true
  }

}

module.exports = new XyoArchivistLevelRepositoryPlugin()
