/*
 * File: selectbykey.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:00 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Wednesday, 24th April 2019 10:52:40 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { SqlQuery } from '../query'
import { SqlService } from '../../sql-service'
import _ from 'lodash'

export class SelectOriginBlocksByKeyQuery extends SqlQuery {

  constructor(sql: SqlService) {
    super(sql, `
      SELECT
        CONCAT(pk2.key) as publicKeysForBlock,
        ob.bytes as originBlockBytes
      FROM PublicKeys pk
        JOIN PublicKeys pk2 on pk.publicKeyGroupId = pk2.publicKeyGroupId
        JOIN KeySignatures k on k.publicKeyId = pk2.id
        JOIN OriginBlockParties obp on obp.id = k.originBlockPartyId
        JOIN OriginBlocks ob on ob.id = obp.originBlockId
      WHERE pk.key = ?
      GROUP BY ob.id
      ORDER BY obp.blockIndex;
    `)
  }

  public async send(publicKey: Buffer): Promise<{items: Buffer[], total: number}> {

    const results = await this.sql.query<Array<{publicKeysForBlock: string, originBlockBytes: Buffer}>>(
        this.query, [publicKey.toString('base64')]
    )

    const blockBytes = results.map((block) => { 
      return block.originBlockBytes
    })

    return {
      items: blockBytes,
      total: blockBytes.length
    }
  }
}
