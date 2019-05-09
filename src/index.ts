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

import { XyoNode } from './base-node'
import { IXyoPlugin, IXyoBoundWitnessMutexDelegate, IXyoGraphQlDelegate } from '@xyo-network/sdk-base-nodejs'
import { IXyoArchivistConfig } from './base-node/@types'
import { XyoOriginState } from '@xyo-network/sdk-core-nodejs'
import { IXyoArchivistRepository } from './repository'
import { XyoGetBlockByHashResolver } from './endpoints/blockByHash'
import { XyoGetBlockList } from './endpoints/blockList'
import { XyoGetBlocksByPublicKeyResolver } from './endpoints/blocksByPublicKey'
import _ from 'lodash'

export * from './base-node'
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

    if (!graphql) {
      throw new Error('Expecting graphql')
    }

    if (!mutex) {
      throw new Error('Expecting mutex')
    }

    const blockByHash = new XyoGetBlockByHashResolver(blockRepository)
    const blockList = new XyoGetBlockList(blockRepository)
    const blockByPublicKey = new XyoGetBlocksByPublicKeyResolver(blockRepository)

    graphql.addQuery(XyoGetBlockByHashResolver.query)
    graphql.addQuery(XyoGetBlockList.query)
    graphql.addQuery(XyoGetBlocksByPublicKeyResolver.query)

    graphql.addResolver(XyoGetBlockByHashResolver.queryName, blockByHash)
    graphql.addResolver(XyoGetBlockList.queryName, blockList)
    graphql.addResolver(XyoGetBlocksByPublicKeyResolver.queryName, blockByPublicKey)

    const node = new XyoNode(archivistConfig.port || 11000, originState, blockRepository, mutex)
    await node.start()

    return true
  }

}

module.exports = new XyoArchivistPlugin()
