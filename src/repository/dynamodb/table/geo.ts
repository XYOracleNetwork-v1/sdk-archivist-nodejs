/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 3:24:48 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { Table } from './table'
import { DynamoDB } from 'aws-sdk'

export class GeohashTable extends Table {

  constructor(
    tableName: string = 'xyo-archivist-geohash',
    region: string = 'us-east-1'
  ) {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'Geohash2',
          AttributeType: 'S'
        },
        {
          AttributeName: 'BlockHash',
          AttributeType: 'B'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'Geohash2',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'BlockHash',
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

  public async putItem(geohash: string, hash: Buffer): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            Geohash2: {
              S: `${geohash[0]}${geohash[1]}`
            },
            Geohash: {
              S: geohash
            },
            BlockHash: {
              B: hash
            }
          },
          TableName: this.tableName
        }
        this.dynamodb.putItem(params, (err: any, data: DynamoDB.Types.PutItemOutput) => {
          if (err) {
            reject(err)
          }
          resolve()
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async getByGeohash(geohash: string, limit: number): Promise <Buffer[]> {
    return new Promise<Buffer[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          Limit: limit,
          IndexName: 'Geohash2',
          KeyConditionExpression: 'Geohash2 = :geohash2 and begins_with(Geohash, :geohash)',
          ExpressionAttributeValues: {
            ':geohash2': { S: `${geohash[0]}${geohash[1]}` },
            ':geohash': { S: geohash }
          },
          TableName: this.tableName,
        }

        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
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
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }
}
