import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { XyoStatSnap } from './xyo-stat-snapshoter'

export class XyoSnapResolver extends XyoBase  {

  public static query = 'collectorStatsSummaryHistorical: JSON!'
  public static queryName = 'collectorStatsSummaryHistorical'

  constructor(
      private readonly stats: XyoStatSnap
    ) {
    super()
  }

  public async resolve(): Promise<any> {
    return this.stats.getPastWeek()
  }
}
