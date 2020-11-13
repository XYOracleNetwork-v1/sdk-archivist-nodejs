import {
  IXyoPlugin,
  IXyoPluginDelegate,
  XyoPluginProviders,
} from '@xyo-network/sdk-base-nodejs'
import {
  XyoBoundWitness,
  XyoBoundWitnessInserter,
  XyoIterableStructure,
  XyoObjectSchema,
  XyoSchema,
  XyoStructure,
} from '@xyo-network/sdk-core-nodejs'

import { XyoSnapResolver } from './snapshot/xyo-snapshot-resolver'
import { XyoStatSnap } from './snapshot/xyo-stat-snapshoter'
import { XyoCollectorStats } from './xyo-collecter-stats'
import { XyoCollecterStatsResolver } from './xyo-collecter-stats-resolver'

class XyoCollectorStatsPlugin implements IXyoPlugin {
  public BOUND_WITNESS_COLLECTOR_STATS: XyoCollectorStats | undefined

  public getName(): string {
    return 'collector-stats'
  }

  public getProvides(): string[] {
    return [XyoPluginProviders.BOUND_WITNESS_COLLECTOR_STATS]
  }
  public getPluginDependencies(): string[] {
    return [XyoPluginProviders.BOUND_WITNESS_INSERTER]
  }

  // eslint-disable-next-line require-await
  public async initialize(delegate: IXyoPluginDelegate): Promise<boolean> {
    const inserter = delegate.deps
      .BOUND_WITNESS_INSERTER as XyoBoundWitnessInserter
    const stats = new XyoCollectorStats()
    const resolver = new XyoCollecterStatsResolver(stats)
    const snapSaver = new XyoStatSnap(stats)
    const snapResolver = new XyoSnapResolver(snapSaver)

    delegate.graphql.addQuery(XyoCollecterStatsResolver.query)
    delegate.graphql.addResolver(XyoCollecterStatsResolver.queryName, resolver)
    delegate.graphql.addType(XyoCollecterStatsResolver.type)

    delegate.graphql.addQuery(XyoSnapResolver.query)
    delegate.graphql.addResolver(XyoSnapResolver.queryName, snapResolver)

    inserter.addBlockListener('collector-stats', (boundWitness) => {
      let nestedBlockCount = 0
      const hashSet = this.getNestedObjectType(
        new XyoBoundWitness(boundWitness),
        XyoObjectSchema.FETTER,
        XyoObjectSchema.BRIDGE_HASH_SET
      )

      if (hashSet) {
        nestedBlockCount = (hashSet as XyoIterableStructure).getCount()
      }

      stats.didBoundWitness(nestedBlockCount)
      stats.commit()
    })

    this.BOUND_WITNESS_COLLECTOR_STATS = stats

    stats.restore()
    snapSaver.restore()

    return true
  }

  private getNestedObjectType(
    boundWitness: XyoBoundWitness,
    rootSchema: XyoSchema,
    subSchema: XyoSchema
  ): XyoStructure | undefined {
    const it = boundWitness.newIterator()

    while (it.hasNext()) {
      const bwItem = it.next().value

      if (
        bwItem.getSchema().id === rootSchema.id &&
        bwItem instanceof XyoIterableStructure
      ) {
        const fetterIt = bwItem.newIterator()

        while (fetterIt.hasNext()) {
          const fetterItem = fetterIt.next().value

          if (fetterItem.getSchema().id === subSchema.id) {
            return fetterItem
          }
        }
      }
    }

    return
  }
}

module.exports = new XyoCollectorStatsPlugin()
