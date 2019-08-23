import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { XyoCollectorStats } from './xyo-collecter-stats'

export class XyoCollecterStatsResolver extends XyoBase  {

  public static query = 'collectorStatsSummary: CollectorStatsSummary!'
  public static type = `
      type CollectorStatsSummary {
        allTimeBoundWitnesses: Int!
        allTimeCollectedBoundWitnesses: Int!
        allTimeCollectedPerBoundWitness: Float!
        runTimeBoundWitnesses: Int!
        runTimeCollectedBoundWitnesses: Int!
        runTimeCollectedPerBoundWitness: Float!
        runTimeBoundWitnessMinute: Float!
        runTimeCollectedPerBoundWitnessMinute: Float!
        lastBoundWitnessTime: String!
      }
    `
  public static queryName = 'collectorStatsSummary'

  constructor(
      private readonly stats: XyoCollectorStats
    ) {
    super()
  }

  public async resolve(): Promise<any> {
    return {
      allTimeBoundWitnesses: this.stats.geAllTimeBoundWitnesses(),
      allTimeCollectedBoundWitnesses: this.stats.getAllTimeCollectedBoundWitnesses(),
      allTimeCollectedPerBoundWitness: this.stats.getMeanBridgeBlockAllTime(),
      runTimeBoundWitnesses: this.stats.getRunTimeBoundWitnesses(),
      runTimeCollectedBoundWitnesses: this.stats.getRunTimeCollectedBoundWitnesses(),
      runTimeCollectedPerBoundWitness: this.stats.getMeanBridgeBlockRuntime(),
      lastBoundWitnessTime: this.stats.getLastBoundWitnessTime().toString(), // a string because graphql only supports 32bit
      runTimeBoundWitnessMinute: this.stats.getMeanBoundWitnessPerMinuteRuntime(),
      runTimeCollectedPerBoundWitnessMinute: this.stats.getMeanCollectedBoundWitnessPerMinuteRuntime(),
    }
  }
}
