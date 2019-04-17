/*
 * File: count.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:09:11 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class CountOriginBlocksQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT
        COUNT(ob.id) as totalSize
      FROM OriginBlocks ob;
    `,
    serialization)
  }

  public async send(): Promise<number> {
    return _.chain(
      await this.sql.query<Array<{totalSize: number}>>(this.query)
    ).first().get('totalSize').value() as number
  }
}
