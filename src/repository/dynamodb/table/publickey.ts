/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable require-await */
/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:58:50 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { DynamoDB } from 'aws-sdk'

import { Table } from './table'

export class PublicKeyTable extends Table {
  constructor(tableName = 'xyo-archivist-chains', region = 'us-east-1') {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'PublicKey',
          AttributeType: 'B',
        },
        {
          AttributeName: 'Index',
          AttributeType: 'N',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'PublicKey',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'Index',
          KeyType: 'RANGE',
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      TableName: tableName,
    }
  }

  public async putItem(
    key: Buffer,
    hash: Buffer,
    index: number
  ): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            BlockHash: {
              B: hash,
            },
            Index: {
              N: index.toString(),
            },
            PublicKey: {
              B: key,
            },
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName,
        }
        this.dynamodb.putItem(
          params,
          (err: any, _data: DynamoDB.Types.PutItemOutput) => {
            if (err) {
              reject(err)
            }
            resolve()
          }
        )
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async scanByKey(
    key: Buffer,
    limit: number,
    index: number | undefined,
    up: boolean
  ): Promise<{ items: any[]; total: number }> {
    return new Promise<{ items: any[]; total: number }>(
      (resolve: any, reject: any) => {
        try {
          const params: DynamoDB.Types.QueryInput = {
            ExpressionAttributeNames: {
              '#index': 'Index',
            },
            ExpressionAttributeValues: {
              ':key': { B: key },
            },
            KeyConditionExpression: 'PublicKey = :key',
            Limit: limit,
            ScanIndexForward: index !== -1,
            TableName: this.tableName,
          }

          if (index !== undefined) {
            if (up) {
              params.ExpressionAttributeValues![':low'] = {
                N: (index - 1).toString(),
              }
              params.ExpressionAttributeValues![':high'] = {
                N: (index + limit).toString(),
              }
              params.KeyConditionExpression =
                '(PublicKey = :key) and #index BETWEEN :low and :high'
            } else if (!up && index === -1) {
              params.ExpressionAttributeValues![':high'] = {
                N: (Number.MAX_SAFE_INTEGER - 1).toString(),
              }
              params.KeyConditionExpression =
                '(PublicKey = :key) and #index < :high'
            } else {
              params.ExpressionAttributeValues![':low'] = {
                N: index.toString(),
              }
              params.ExpressionAttributeValues![':high'] = {
                N: (index - limit - 1).toString(),
              }
              params.KeyConditionExpression =
                '(PublicKey = :key) and #index BETWEEN :high and :low'
            }

            if (index !== -1) {
              params.ExclusiveStartKey = {
                Index: {
                  N: up
                    ? (index - 1).toString()
                    : (index - limit - 1).toString(),
                },
                PublicKey: {
                  B: key,
                },
              }
            }
          }

          this.dynamodb.query(
            params,
            async (err: any, data: DynamoDB.Types.ScanOutput) => {
              if (err) {
                this.logError(err)
                reject(err)
              }
              const result = []
              if (data && data.Items) {
                for (const item of data.Items) {
                  if (
                    item.PublicKey &&
                    item.PublicKey.B &&
                    item.BlockHash &&
                    item.BlockHash.B
                  ) {
                    result.push(item.BlockHash.B)
                  } else {
                    this.logError(
                      `Result with Missing PublicKey or BlockHash: ${item}`
                    )
                  }
                }
              }
              resolve({ items: result, total: await this.getRecordCount() })
            }
          )
        } catch (ex) {
          this.logError(ex)
          reject(ex)
        }
      }
    )
  }
}
