/* eslint-disable require-await */
import {
  IXyoPlugin,
  IXyoPluginDelegate,
  XyoPluginProviders,
} from '@xyo-network/sdk-base-nodejs'
import { XyoOriginBlockGetter } from '@xyo-network/sdk-core-nodejs'

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
      XyoPluginProviders.BLOCK_REPOSITORY_GET, // for getting the blocks
    ]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const blockRepositoryGet = delegate.deps
      .BLOCK_REPOSITORY_GET as XyoOriginBlockGetter

    const resolverHash = new XyoGetBlockByHashResolver(blockRepositoryGet)
    delegate.graphql.addQuery(XyoGetBlockByHashResolver.query)
    delegate.graphql.addResolver(
      XyoGetBlockByHashResolver.queryName,
      resolverHash
    )

    const resolverAll = new XyoGetBlockList(blockRepositoryGet)
    delegate.graphql.addQuery(XyoGetBlockList.query)
    delegate.graphql.addResolver(XyoGetBlockList.queryName, resolverAll)

    return true
  }
}

module.exports = new XyoGraphQlBlockGetPlugin()
