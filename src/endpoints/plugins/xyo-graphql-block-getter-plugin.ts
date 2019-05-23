
import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate, IXyoPluginDelegate } from '@xyo-network/sdk-base-nodejs'
import { IXyoOriginBlockGetter } from '@xyo-network/sdk-core-nodejs'
import { XyoGetBlockByHashResolver } from '../block-by-hash'
import { XyoGetBlockList } from '../block-list'

export class XyoGraphQlBlockGetPlugin implements IXyoPlugin {

  public getName(): string {
    return 'graphql-block-getter'
  }

  public getProvides(): string[] {
    return []
  }

  public getPluginDependencies(): string[] {
    return [
      'BLOCK_REPOSITORY_GET', // for getting the blocks
      'BASE_GRAPHQL_TYPES', // for base graphql types
    ]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const blockRepositoryGet = delegate.deps.BLOCK_REPOSITORY_GET as IXyoOriginBlockGetter

    const resolverHash = new XyoGetBlockByHashResolver(blockRepositoryGet)
    delegate.graphql.addQuery(XyoGetBlockByHashResolver.query)
    delegate.graphql.addResolver(XyoGetBlockByHashResolver.queryName, resolverHash)

    const resolverAll = new XyoGetBlockList(blockRepositoryGet)
    delegate.graphql.addQuery(XyoGetBlockList.query)
    delegate.graphql.addResolver(XyoGetBlockList.queryName, resolverAll)

    return true
  }

}

module.exports = new XyoGraphQlBlockGetPlugin()
