
import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate } from '@xyo-network/sdk-base-nodejs'
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

  public async initialize(deps: { [key: string]: any; }, config: any, graphql?: IXyoGraphQlDelegate | undefined): Promise<boolean> {
    const blockRepositoryGet = deps.BLOCK_REPOSITORY_GET as IXyoOriginBlockGetter

    if (!graphql) {
      throw new Error('XyoGraphQlBlockGetPlugin is expecting graphql')
    }

    const resolverHash = new XyoGetBlockByHashResolver(blockRepositoryGet)
    graphql.addQuery(XyoGetBlockByHashResolver.query)
    graphql.addResolver(XyoGetBlockByHashResolver.queryName, resolverHash)

    const resolverAll = new XyoGetBlockList(blockRepositoryGet)
    graphql.addQuery(XyoGetBlockList.query)
    graphql.addResolver(XyoGetBlockList.queryName, resolverAll)

    return true
  }

}

module.exports = new XyoGraphQlBlockGetPlugin()
