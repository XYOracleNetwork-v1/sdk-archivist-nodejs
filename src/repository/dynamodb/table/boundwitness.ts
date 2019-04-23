/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 11:02:02 am
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
          AttributeName: 'Hash',
          AttributeType: 'B'
        }
      ],
      KeySchema: [
        {
          AttributeName: 'Hash',
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
        const shortHash = this.sha1(hash)
        const value = this.cache.get(shortHash.toString())
        if (value) {
          resolve(value)
          return
        }
        const params: DynamoDB.Types.GetItemInput = {
          Key: {
            Hash: {
              B: shortHash
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
            this.cache.set(shortHash.toString(), result)
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
        const shortHash = this.sha1(hash)
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            Hash: {
              B: shortHash
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
          this.cache.set(shortHash.toString(), originBlock)
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
        const shortHash = this.sha1(hash)
        const params: DynamoDB.Types.DeleteItemInput = {
          Key: {
            Hash: {
              B: shortHash
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
          this.cache.del(shortHash.toString())
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
            Hash: {
              B: this.sha1(offsetHash)
            }
          }
        }
        this.dynamodb.scan(params, (err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }
          const result = []
          if (data.Items) {
            for (const item of data.Items) {
              if (item.Hash && item.Hash.B && item.Data && item.Data.B) {
                const payload = item.Hash.B as Buffer
                const shortHash = this.sha1(payload)
                this.cache.set(shortHash.toString(), payload)
                result.push(payload)
              } else {
                this.logError(`Result with Missing Hash or Data: ${item}`)
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
