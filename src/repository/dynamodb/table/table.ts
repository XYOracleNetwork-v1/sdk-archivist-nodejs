/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 3:24:51 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { DynamoDB } from 'aws-sdk'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class Table extends XyoBase {
  protected createTableInput?: DynamoDB.Types.CreateTableInput
  protected dynamodb: DynamoDB
  private tableInfo: any

  constructor(
    protected readonly tableName: string,
    region: string = 'us-east-1'
  ) {
    super()
    this.dynamodb = new DynamoDB({
      region
    })
  }

  public async initialize() {
    this.tableInfo = await this.getTableInfo()
    return true
  }

  public async getRecordCount() {
    const description = await this.readTableDescription()
    return description.ItemCount
  }

  protected async readTableDescription(): Promise<DynamoDB.Types.TableDescription> {
    return new Promise((resolve, reject) => {
      try {
        this.dynamodb.describeTable({ TableName: this.tableName }, ((describeErr: any, describeData: DynamoDB.Types.DescribeTableOutput) => {
          if (describeErr) {
            reject(describeErr)
            return
          }
          resolve(describeData.Table)
        }))
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  private async createTable() {
    return new Promise((resolve, reject) => {
      try {
        if (this.createTableInput) {
          this.dynamodb.createTable(this.createTableInput, (createErr: any, tableData: DynamoDB.Types.CreateTableOutput) => {
            if (createErr) {
              this.logError(createErr)
              reject(createErr)
              return
            }
            resolve(tableData)
          })
        } else {
          reject('createTableInput Required')
        }
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  private async createTableIfNeeded() {
    return new Promise((resolve, reject) => {
      try {
        this.dynamodb.listTables(async(listErr, listData) => {
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
            resolve(await this.createTable())
          } else {
            resolve(await this.readTableDescription())
          }
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  private async getTableInfo() {
    if (!this.tableInfo) {
      this.tableInfo = await this.createTableIfNeeded()
    }
    return this.tableInfo
  }
}
