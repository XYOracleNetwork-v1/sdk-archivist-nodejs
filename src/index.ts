/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 3:01:57 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import {
  IXyoPlugin,
  IXyoPluginDelegate,
  XyoPluginProviders,
} from '@xyo-network/sdk-base-nodejs'
import {
  XyoBoundWitnessInserter,
  XyoOriginBlockRepository,
  XyoOriginState,
} from '@xyo-network/sdk-core-nodejs'

import { XyoNode } from './archivist-collecter'
import { IXyoArchivistConfig } from './archivist-collecter/@types'
import { XyoArchivistInfoResolver } from './endpoints/archivist-info'

class XyoArchivistPlugin implements IXyoPlugin {
  public BOUND_WITNESS_INSERTER: XyoBoundWitnessInserter | undefined

  public getName(): string {
    return 'archivist'
  }

  public getProvides(): string[] {
    return [XyoPluginProviders.BOUND_WITNESS_INSERTER]
  }

  public getPluginDependencies(): string[] {
    return [
      'ORIGIN_STATE', // for creating an origin chain
      XyoPluginProviders.BLOCK_REPOSITORY_ADD,
    ]
  }

  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const archivistConfig = delegate.config as IXyoArchivistConfig
    const port = archivistConfig.port || 11000

    const originState = delegate.deps.ORIGIN_STATE as XyoOriginState
    const blockRepositoryAdd = delegate.deps
      .BLOCK_REPOSITORY_ADD as XyoOriginBlockRepository

    const archivistQuery = new XyoArchivistInfoResolver(port)

    delegate.graphql.addQuery(XyoArchivistInfoResolver.query)
    delegate.graphql.addResolver(
      XyoArchivistInfoResolver.queryName,
      archivistQuery
    )
    delegate.graphql.addType(XyoArchivistInfoResolver.type)

    const node = new XyoNode(
      port,
      originState,
      blockRepositoryAdd,
      delegate.mutex
    )
    await node.start()

    this.BOUND_WITNESS_INSERTER = node.inserter

    return true
  }
}

module.exports = new XyoArchivistPlugin()
