/*
 * File: upsert.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 18th April 2019 9:49:40 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'
import { RelinkPublicKeysQuery } from './relinkall'
import { InsertPublicKeysQuery } from './insert'
import { SelectPublicKeyGroupsByKeyQuery, DeletePublicKeyGroupQuery } from '../publickeygroups'

export class UpsertPublicKeysQuery extends SqlQuery {

  constructor(sql: SqlService) {
    // this is a meta query, so no sql
    super(sql, '')
  }

  public async send(
    { key,
      publicKeyGroupId }: {
        key: string,
        publicKeyGroupId: number}
  ) {
    const hexKey = key

    const publicKeyMatches = await new SelectPublicKeyGroupsByKeyQuery(this.sql).send(
      { hexKey }
    )

    const publicKey = _.chain(publicKeyMatches).first().value()
    if (publicKey) {
      if (publicKey.publicKeyGroupId === publicKeyGroupId) {
        return publicKey.id
      }

      // Self heal out of turn blocks
      await new RelinkPublicKeysQuery(this.sql).send(
        { publicKeyGroupIdNew: publicKeyGroupId,
          publicKeyGroupIdOld: publicKey.publicKeyGroupId
        }
      )

      await new DeletePublicKeyGroupQuery(this.sql).send(
        { publicKeyGroupId: publicKey.publicKeyGroupId }
      )

      return publicKey.id
    }

    return new InsertPublicKeysQuery(this.sq).send(
      { hexKey, publicKeyGroupId }
    )
  }
}
