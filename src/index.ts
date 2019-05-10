/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 9:34:32 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoNode } from './archivist-plugin'
import { IXyoPlugin, IXyoBoundWitnessMutexDelegate, IXyoGraphQlDelegate } from '@xyo-network/sdk-base-nodejs'
import { IXyoArchivistConfig } from './archivist-plugin/@types'
import { XyoOriginState } from '@xyo-network/sdk-core-nodejs'
import { IXyoArchivistRepository } from './repository'
import { XyoGetBlockByHashResolver } from './endpoints/block-by-hash'
import { XyoGetBlockList } from './endpoints/block-list'
import { XyoGetBlocksByPublicKeyResolver } from './endpoints/blocks-by-public-key'
import { XyoArchivistInfoResolver } from './endpoints/archivist-info'

export * from './archivist-plugin'
export * from './repository'
export * from './@types'

class XyoArchivistPlugin implements IXyoPlugin {
  public getName(): string {
    return 'archivist'
  }

  public getProvides(): string[] {
    return ['archivist']
  }

  public getPluginDependencies(): string[] {
    return ['ORIGIN_STATE', 'BLOCK_REPOSITORY', 'BASE_GRAPHQL_TYPES']
  }

  public async initialize(
    deps: { [key: string]: any; },
    config: any,
    graphql?: IXyoGraphQlDelegate | undefined,
    mutex?: IXyoBoundWitnessMutexDelegate | undefined
  ): Promise<boolean> {
    const archivistConfig = config as IXyoArchivistConfig
    const originState = deps.ORIGIN_STATE as XyoOriginState
    const blockRepository = deps.BLOCK_REPOSITORY as IXyoArchivistRepository
    const port = archivistConfig.port || 11000

    if (!graphql) {
      throw new Error('Expecting graphql')
    }

    if (!mutex) {
      throw new Error('Expecting mutex')
    }

    const blockByHash = new XyoGetBlockByHashResolver(blockRepository)
    const blockList = new XyoGetBlockList(blockRepository)
    const blockByPublicKey = new XyoGetBlocksByPublicKeyResolver(blockRepository)
    const archivistQuery = new XyoArchivistInfoResolver(port)

    graphql.addQuery(XyoGetBlockByHashResolver.query)
    graphql.addQuery(XyoGetBlockList.query)
    graphql.addQuery(XyoGetBlocksByPublicKeyResolver.query)
    graphql.addQuery(XyoArchivistInfoResolver.query)

    graphql.addResolver(XyoGetBlockByHashResolver.queryName, blockByHash)
    graphql.addResolver(XyoGetBlockList.queryName, blockList)
    graphql.addResolver(XyoGetBlocksByPublicKeyResolver.queryName, blockByPublicKey)
    graphql.addResolver(XyoArchivistInfoResolver.queryName, archivistQuery)

    graphql.addType(XyoArchivistInfoResolver.type)

    const node = new XyoNode(port, originState, blockRepository, mutex)
    await node.start()

    return true
  }

}

module.exports = new XyoArchivistPlugin()
