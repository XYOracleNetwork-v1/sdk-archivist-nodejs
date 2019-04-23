/*
 * File: xyo-dynamo-archivist-repository.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 2:04:07 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 6:32:27 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import {
  IXyoArchivistRepository,
  IXyoOriginBlocksByPublicKeyResult,
  IXyoEntitiesList,
  IXyoIntersectionsList
} from '..'

import { XyoBase } from '@xyo-network/base'
import { IXyoPublicKey, IXyoSignature } from '@xyo-network/signing'
import { IXyoBoundWitness, XyoBoundWitness } from '@xyo-network/bound-witness'
import { IXyoSerializationService, IXyoSerializableObject } from '@xyo-network/serialization'

import _ from 'lodash'
import { DynamoDB } from 'aws-sdk'
import { IXyoHash } from '@xyo-network/hashing'
import { IOriginBlockQueryResult } from '@xyo-network/origin-block-repository'
import { XyoError } from '@xyo-network/errors'

export class XyoArchivistDynamoRepository extends XyoBase implements IXyoArchivistRepository {

  private dynamodb: DynamoDB
  private tableInfo: any

  constructor(
    private readonly serializationService: IXyoSerializationService,
    private readonly tableName: string = 'xyo-archivist-data'
  ) {
    super()
    this.dynamodb = new DynamoDB({
      region: 'us-east-1'
    })
  }

  public async initialize() {
    this.tableInfo = await this.getTableInfo()
    return true
  }

  public async getOriginBlocksByPublicKey(publicKey: IXyoPublicKey): Promise<IXyoOriginBlocksByPublicKeyResult> {
    throw new XyoError('getOriginBlocksByPublicKey: Not Implemented')
    return {
      publicKeys: [],
      boundWitnesses: []
    }
  }

  public async getIntersections(
    publicKeyA: string,
    publicKeyB: string,
    limit: number,
    cursor: string | undefined
  ): Promise<IXyoIntersectionsList> {
    throw new XyoError('getIntersections: Not Implemented')
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async getEntities(limit: number, offsetCursor?: string | undefined): Promise<IXyoEntitiesList> {
    throw new XyoError('getEntities: Not Implemented')
    return {
      list: [],
      hasNextPage: false,
      totalSize: 0,
      cursor: undefined
    }
  }

  public async removeOriginBlock(hash: Buffer): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      const params: DynamoDB.Types.DeleteItemInput = {
        Key: {
          Hash: {
            B: hash
          }
        },
        ReturnConsumedCapacity: 'TOTAL',
        TableName: this.tableName
      }
      this.dynamodb.deleteItem(params, (err: any, data: DynamoDB.Types.DeleteItemOutput) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    })
  }

  public async containsOriginBlock(hash: Buffer): Promise<boolean> {
    return new Promise<boolean>((resolve: any, reject: any) => {
      const params: DynamoDB.Types.GetItemInput = {
        Key: {
          Hash: {
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
        resolve(true)
      })
    })
  }

  public async getAllOriginBlockHashes(): Promise<Buffer[]> {
    throw new XyoError('getAllOriginBlockHashes: Not Implemented')
    return []
  }

  public async addOriginBlock(
    hash: IXyoHash,
    originBlock: IXyoBoundWitness,
    bridgedFromOriginBlockHash?: IXyoHash
  ): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      const params: DynamoDB.Types.PutItemInput = {
        Item: {
          Hash: {
            B: hash.serialize()
          },
          Data: {
            B: originBlock.serialize()
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
    })
  }

  public async getOriginBlockByHash(hash: Buffer): Promise < IXyoBoundWitness | undefined > {
    return new Promise<IXyoBoundWitness | undefined>((resolve: any, reject: any) => {
      const params: DynamoDB.Types.GetItemInput = {
        Key: {
          Hash: {
            B: hash
          }
        },
        AttributesToGet: [
          'Data'
        ],
        ReturnConsumedCapacity: 'TOTAL',
        TableName: this.tableName
      }
      this.dynamodb.getItem(params, (err: any, data: DynamoDB.Types.GetItemOutput) => {
        if (err) {
          reject(err)
        }
        resolve(data.Item)
      })
    })
  }

  public async getBlocksThatProviderAttribution(hash: Buffer): Promise < { [h: string]: IXyoBoundWitness } > {
    throw new XyoError('getBlocksThatProviderAttribution: Not Implemented')
    return {

    }
  }

  public async getOriginBlocks(limit: number, offsetHash ?: Buffer | undefined): Promise < IOriginBlockQueryResult > {
    return new Promise<IOriginBlockQueryResult>((resolve: any, reject: any) => {
      const params: DynamoDB.Types.ScanInput = {
        Limit: 100,
        ReturnConsumedCapacity: 'TOTAL',
        TableName: this.tableName
      }
      if (offsetHash) {
        params.ExclusiveStartKey = {
          Hash: {
            B: offsetHash
          }
        }
      }
      this.dynamodb.scan(params, (err: any, data: DynamoDB.Types.ScanOutput) => {
        if (err) {
          reject(err)
        }
        const result: IOriginBlockQueryResult = {
          list: [],
          totalSize: data.Count || -1,
          hasNextPage: true
        }
        if (data.Items) {
          for (const item of data.Items) {
            result.list.push(XyoBoundWitness.deserializer.deserialize(item.Data.B as Buffer, this.serializationService))
          }
        }
        resolve(data.Items)
      })
    })
  }

  private async getTableInfo() {
    if (!this .tableInfo) {
      this.tableInfo = await this.createTableIfNeeded()
    }
    return this.tableInfo
  }

  private async createTable(tableName: string) {
    return new Promise((resolve, reject) => {
      const createParams: DynamoDB.Types.CreateTableInput = {
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
      this.dynamodb.createTable(createParams, (createErr: any, tableData: DynamoDB.Types.CreateTableOutput) => {
        if (createErr) {
          reject(createErr)
          return
        }
        resolve(tableData)
      })
    })
  }

  private async readTableDescription(tableName: string) {
    return new Promise((resolve, reject) => {
      this.dynamodb.describeTable({ TableName: tableName }, ((describeErr: any, describeData: DynamoDB.Types.DescribeTableOutput) => {
        if (describeErr) {
          reject(describeErr)
          return
        }
        resolve(describeData)
      }))
    })
  }

  private async createTableIfNeeded() {
    return new Promise((resolve, reject) => {
      this.dynamodb.listTables(async (listErr, listData) => {
        if (listErr) {
          reject(listErr)
          return
        }
        let found = false
        if (listData.TableNames) {
          for (const table of listData.TableNames) {
            if (table === this.tableName) {
              found = true
            }
          }
        }
        if (!found) {
          resolve(await this.createTable(this.tableName))
        } else {
          resolve(await this.readTableDescription(this.tableName))
        }
      })
    })
  }
}
