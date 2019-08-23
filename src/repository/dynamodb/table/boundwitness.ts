/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 12:24:05 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { Table } from './table'
import { DynamoDB } from 'aws-sdk'
import lruCache from 'lru-cache'

export class BoundWitnessTable extends Table {

  private cache: lruCache<string, Buffer>

  constructor(
    tableName: string = 'xyo-archivist-boundwitness',
    region: string = 'us-east-1'
  ) {
    super(tableName, region)

    this.cache = new lruCache({
      max: 5000,
      maxAge: 1000 * 60 * 60 // one hour
    })

    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'BlockHash',
          AttributeType: 'B'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'BlockHash',
          KeyType: 'HASH'
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    }
  }

  public async getItem(hash: Buffer): Promise<any> {
    return new Promise<boolean>((resolve: any, reject: any) => {
      try {
        const value = this.cache.get(hash.toString())
        if (value) {
          resolve(value)
          return
        }
        const params: DynamoDB.Types.GetItemInput = {
          Key: {
            BlockHash: {
              B: hash
            }
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }
        this.dynamodb.getItem(params, (err: any, data: DynamoDB.Types.GetItemOutput) => {
          if (err) {
            reject(err)
          }
          if (data.Item) {
            const result = data.Item.Data.B as Buffer
            this.cache.set(hash.toString(), result)
            resolve(result)
            return
          }
          resolve()
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async putItem(
    hash: Buffer,
    originBlock: Buffer
  ): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            BlockHash: {
              B: hash
            },
            Data: {
              B: originBlock
            }
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }
        this.dynamodb.putItem(params, (err: any, data: DynamoDB.Types.PutItemOutput) => {
          if (err) {
            reject(err)
          }
          this.cache.set(hash.toString(), originBlock)
          resolve()
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async deleteItem(hash: Buffer): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.DeleteItemInput = {
          Key: {
            BlockHash: {
              B: hash
            }
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }
        this.dynamodb.deleteItem(params, (err: any, data: DynamoDB.Types.DeleteItemOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }
          this.cache.del(hash.toString())
          resolve()
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async scan(limit: number, offsetHash ?: Buffer | undefined): Promise <any[]> {
    return new Promise<[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.ScanInput = {
          Limit: limit,
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }
        if (offsetHash) {
          params.ExclusiveStartKey = {
            BlockHash: {
              B: offsetHash
            }
          }
        }

        this.dynamodb.scan(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          let result = []

          if (data.Items) {
            for (const item of data.Items) {
              if (item.BlockHash && item.BlockHash.B && item.Data && item.Data.B) {
                const payload = item.Data.B as Buffer
                this.cache.set(item.BlockHash.B.toString(), payload)
                result.push(payload)
              } else {
                this.logError(`Result with Missing BlockHash or Data: ${item}`)
              }
            }
          }

          // if there is a LastEvaluatedKey, we need to get the next page because dynamodb limits a scan to 1 megabyte
          if (result.length < limit && data.LastEvaluatedKey) {
            const delta = limit - result.length
            const nextPage = await this.scan(delta, data.LastEvaluatedKey.BlockHash.B as Buffer)
            result = result.concat(nextPage)
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
