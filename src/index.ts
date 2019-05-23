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

import { XyoNode } from './archivist-collecter'
import { IXyoPlugin, IXyoBoundWitnessMutexDelegate, IXyoGraphQlDelegate, IXyoPluginDelegate, XyoPluginProviders } from '@xyo-network/sdk-base-nodejs'
import { IXyoArchivistConfig } from './archivist-collecter/@types'
import { XyoOriginState, IXyoOriginBlockRepository, IXyoOriginBlockGetter, IXyoBlockByPublicKeyRepository, XyoBoundWitnessInserter } from '@xyo-network/sdk-core-nodejs'
import { XyoArchivistInfoResolver } from './endpoints/archivist-info'

class XyoArchivistPlugin implements IXyoPlugin {
  public BOUND_WITNESS_INSERTER: XyoBoundWitnessInserter | undefined

  public getName(): string {
    return 'archivist'
  }

  public getProvides(): string[] {
    return [
      XyoPluginProviders.BOUND_WITNESS_INSERTER
    ]
  }

  public getPluginDependencies(): string[] {
    return [
      'ORIGIN_STATE', // for creating an origin chain
      XyoPluginProviders.BLOCK_REPOSITORY_ADD
    ]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const archivistConfig = delegate.config as IXyoArchivistConfig
    const port = archivistConfig.port || 11000

    const originState = delegate.deps.ORIGIN_STATE as XyoOriginState
    const blockRepositoryAdd = delegate.deps.BLOCK_REPOSITORY_ADD as IXyoOriginBlockRepository

    const archivistQuery = new XyoArchivistInfoResolver(port)

    delegate.graphql.addQuery(XyoArchivistInfoResolver.query)
    delegate.graphql.addResolver(XyoArchivistInfoResolver.queryName, archivistQuery)
    delegate.graphql.addType(XyoArchivistInfoResolver.type)

    const node = new XyoNode(port, originState, blockRepositoryAdd, delegate.mutex)
    await node.start()

    this.BOUND_WITNESS_INSERTER = node.inserter

    return true
  }

}

module.exports = new XyoArchivistPlugin()
