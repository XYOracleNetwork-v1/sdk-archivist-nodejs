import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate, IXyoPluginDelegate, XyoPluginProviders } from '@xyo-network/sdk-base-nodejs'
import { IXyoBlockByPublicKeyRepository } from '@xyo-network/sdk-core-nodejs'
import { XyoGetBlocksByPublicKeyResolver } from '../blocks-by-public-key'

export class XyoGraphQlBlockGetPlugin implements IXyoPlugin {

  public getName(): string {
    return 'graphql-public-key-block-getter'
  }

  public getProvides(): string[] {
    return []
  }

  public getPluginDependencies(): string[] {
    return [
      XyoPluginProviders.BLOCK_REPOSITORY_PUBLIC_KEY
    ]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const blockRepositoryPublicKey = delegate.deps.BLOCK_REPOSITORY_PUBLIC_KEY as IXyoBlockByPublicKeyRepository

    const resolverPublicKey = new XyoGetBlocksByPublicKeyResolver(blockRepositoryPublicKey)
    delegate.graphql.addQuery(XyoGetBlocksByPublicKeyResolver.query)
    delegate.graphql.addResolver(XyoGetBlocksByPublicKeyResolver.queryName, resolverPublicKey)

    return true
  }

}

module.exports = new XyoGraphQlBlockGetPlugin()
