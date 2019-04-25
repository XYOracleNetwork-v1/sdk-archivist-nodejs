/*
 * File: selectbykeys.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:34 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class SelectPublicKeysByKeysQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      SELECT
        pk.id as id,
        pk.key as \`key\`,
        pk.publicKeyGroupId as publicKeyGroupId
      FROM PublicKeys pk
      WHERE pk.key in (?)
    `)
  }

  public async send(pks: string[]): Promise<Array<{id: number, key: string, publicKeyGroupId: number}>> {
    return this.sql.query<Array<{id: number, key: string, publicKeyGroupId: number}>>(
      this.query, [pks])
  }
}
