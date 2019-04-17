/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:08:52 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class InsertOriginBlockPartiesQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO OriginBlockParties (
        originBlockId,
        positionalIndex,
        blockIndex,
        bridgeHashSet,
        payloadBytes,
        nextPublicKeyId,
        previousOriginBlockHash,
        previousOriginBlockPartyId
      )
      VALUES
        (?, ?, ?, ?, ?, ?, ?, ?);
    `,
    serialization)
  }

  public async send(
    { originBlockId,
      positionalIndex,
      blockIndex,
      bridgeHashSet,
      payloadBytes,
      nextPublicKeyId,
      previousOriginBlockHash,
      previousOriginBlockPartyId }:
      { originBlockId: number,
        positionalIndex: number,
        blockIndex: number,
        bridgeHashSet: string | undefined,
        payloadBytes: Buffer,
        nextPublicKeyId: number | undefined,
        previousOriginBlockHash: string | undefined,
        previousOriginBlockPartyId: number | undefined }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query,
      [originBlockId,
        positionalIndex,
        blockIndex,
        bridgeHashSet,
        payloadBytes,
        nextPublicKeyId,
        previousOriginBlockHash,
        previousOriginBlockPartyId]
    )).insertId
  }
}
