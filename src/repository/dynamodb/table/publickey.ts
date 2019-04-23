/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 10:09:33 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { Table } from './table'
import { DynamoDB } from 'aws-sdk'
import chalk from 'chalk'

export class PublicKeyTable extends Table {

  constructor(
    tableName: string = 'xyo-archivist-publickey',
    region: string = 'us-east-1'
  ) {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'Key',
          AttributeType: 'B'
        },
        {
          AttributeName: 'Hash',
          AttributeType: 'B'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'Key',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'Hash',
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

  public async putItem(
    key: Buffer,
    hash: Buffer
  ): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            Key: {
              B: this.sha1(key)
            },
            Hash: {
              B: this.sha1(hash)
            }
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }
        this.dynamodb.putItem(params, (err: any, data: DynamoDB.Types.PutItemOutput) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } catch (ex) {
        console.log(chalk.red(ex))
        reject(ex)
      }
    })
  }
}
