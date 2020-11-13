/* eslint-disable require-await */
/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:59:38 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { DynamoDB } from 'aws-sdk'

import { Table } from './table'

export class GeohashTable extends Table {
  constructor(tableName = 'xyo-archivist-geohash', region = 'us-east-1') {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'Geohash2',
          AttributeType: 'S',
        },
        {
          AttributeName: 'BlockHash',
          AttributeType: 'B',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'Geohash2',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'BlockHash',
          KeyType: 'RANGE',
        },
      ],
      LocalSecondaryIndexes: [
        {
          IndexName: 'Geohash2',
          KeySchema: [
            {
              AttributeName: 'Geohash2',
              KeyType: 'HASH',
            },
            {
              AttributeName: 'Geohash',
              KeyType: 'RANGE',
            },
          ],
          Projection: {
            ProjectionType: 'ALL',
          },
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5,
      },
      TableName: tableName,
    }
  }

  public async putItem(geohash: string, hash: Buffer): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            BlockHash: {
              B: hash,
            },
            Geohash: {
              S: geohash,
            },
            Geohash2: {
              S: `${geohash[0]}${geohash[1]}`,
            },
          },
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

  public async getByGeohash(geohash: string, limit: number): Promise<Buffer[]> {
    return new Promise<Buffer[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          ExpressionAttributeValues: {
            ':geohash': { S: geohash },
            ':geohash2': { S: `${geohash[0]}${geohash[1]}` },
          },
          IndexName: 'Geohash2',
          KeyConditionExpression:
            'Geohash2 = :geohash2 and begins_with(Geohash, :geohash)',
          Limit: limit,
          TableName: this.tableName,
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
                if (item.BlockHash && item.BlockHash.B) {
                  result.push(item.BlockHash.B)
                } else {
                  this.logError(`Result with Missing BlockHash: ${item}`)
                }
              }
            }
            resolve(result)
          }
        )
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }
}
