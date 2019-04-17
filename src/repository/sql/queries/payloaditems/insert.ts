/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:09:36 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService, IXyoSerializableObject } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class InsertPayloadItemsQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO PayloadItems(
        originBlockPartyId,
        isSigned,
        schemaObjectId,
        bytes,
        positionalIndex
      )
      VALUES(?, ?, ?, ?, ?)
    `,
    serialization)
  }

  public async send(
    { originBlockPartyId, isSigned, payloadItem, currentIndex }:
    { originBlockPartyId: number, isSigned: boolean, payloadItem: IXyoSerializableObject, currentIndex: number }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query, [
        originBlockPartyId,
        isSigned,
        payloadItem.schemaObjectId,
        payloadItem.serializeHex(),
        currentIndex
      ])).insertId
  }
}
