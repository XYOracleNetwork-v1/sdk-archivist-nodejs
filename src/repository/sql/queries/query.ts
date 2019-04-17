/*
 * File: query.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:10:38 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlService } from "../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import { XyoBase } from "@xyo-network/base"

export class SqlQuery extends XyoBase {

  protected sql: SqlService
  protected query: string
  protected serialization: IXyoSerializationService

  constructor(sql: SqlService, query: string, serialization: IXyoSerializationService) {
    super()
    this.sql = sql
    this.query = query
    this.serialization = serialization
  }

  public async send(params: any): Promise<any> {
    return false
  }
}
