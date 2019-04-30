/*
 * File: query.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Wednesday, 24th April 2019 9:26:23 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlService } from '../sql-service'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class SqlQuery extends XyoBase {

  protected sql: SqlService
  protected query: string

  constructor(sql: SqlService, query: string) {
    super()
    this.sql = sql
    this.query = query
  }

  public async send(params: any): Promise<any> {
    return false
  }
}
