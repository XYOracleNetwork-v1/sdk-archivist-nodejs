/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 8:38:58 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { Table } from './table'

export class PublicKeyTable extends Table {

  constructor(
    tableName: string = 'xyo-archivist-publickey',
    region: string = 'us-east-1'
  ) {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'PublicKey',
          AttributeType: 'B'
        },
        {
          AttributeName: 'Block',
          AttributeType: 'B'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'PublicKey',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'Block',
          KeyType: 'RANGE'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    }
  }
}
