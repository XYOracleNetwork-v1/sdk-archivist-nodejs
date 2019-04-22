/*
 * File: relinkall.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Sunday, 21st April 2019 1:53:38 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import { IXyoSerializationService } from '@xyo-network/serialization'
import _ from 'lodash'

// This seems to update the GroupId, which is the earliest known public key for
// a PoO chain

export class RelinkPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService, serialization: IXyoSerializationService) {
    super(sql, `
      UPDATE PublicKeys SET publicKeyGroupId = ? WHERE publicKeyGroupId = ?
    `,
          serialization)
  }

  public async send(
    { publicKeyGroupIdNew,
      publicKeyGroupIdOld }: {
        publicKeyGroupIdNew: number,
        publicKeyGroupIdOld: number
      }
  ) {
    return this.sql.query(
      this.query,
      [publicKeyGroupIdNew, publicKeyGroupIdOld]
    )
  }
}
