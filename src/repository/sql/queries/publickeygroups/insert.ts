/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:09:50 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'
import { IXyoSignature, IXyoPublicKey } from "@xyo-network/signing"

// tslint:disable:prefer-array-literal

export class InsertPublicKeyGroupQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO PublicKeyGroups() VALUES()
    `,
    serialization)
  }

  public async send(
  ) {
    return (await this.sql.query<{insertId: number}>(this.query)).insertId
  }
}
