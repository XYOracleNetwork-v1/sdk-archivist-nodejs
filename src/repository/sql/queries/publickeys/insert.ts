/*
 * File: insert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:28 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { IXyoSerializationService } from '@xyo-network/serialization'
import _ from 'lodash'

export class InsertPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      INSERT INTO PublicKeys(\`key\`, publicKeyGroupId)
      VALUES(?, ?)
    `,
          serialization)
  }

  public async send(
    { hexKey, publicKeyGroupId }: { hexKey: string, publicKeyGroupId: number }
  ) {
    return (await this.sql.query<{insertId: number}>(
      this.query,
      [hexKey, publicKeyGroupId]
    )).insertId
  }
}
