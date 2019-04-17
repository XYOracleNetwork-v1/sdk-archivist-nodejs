/*
 * File: selectbykey.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:09:53 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from "../query"
import { SqlService } from "../../sql-service"
import { IXyoSerializationService } from "@xyo-network/serialization"
import _ from 'lodash'

// tslint:disable:prefer-array-literal

export class SelectPublicKeyGroupsByKeyQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      SELECT id, publicKeyGroupId FROM PublicKeys WHERE \`key\` = ? LIMIT 1
    `,
    serialization)
  }

  public async send({ hexKey }: {hexKey: string}): Promise<Array<{id: number, publicKeyGroupId: number}>> {
    return this.sql.query<Array<{id: number, publicKeyGroupId: number}>>(
      this.query, [hexKey])
  }
}
