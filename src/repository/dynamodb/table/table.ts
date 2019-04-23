/*
 * File: main-table.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Tuesday, 23rd April 2019 8:14:51 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 8:42:46 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { DynamoDB } from 'aws-sdk'

export class Table {
  protected createTableInput?: DynamoDB.Types.CreateTableInput
  protected dynamodb: DynamoDB
  private tableInfo: any

  constructor(
    protected readonly tableName: string,
    region: string = 'us-east-1'
  ) {
    this.dynamodb = new DynamoDB({
      region
    })
  }

  public async initialize() {
    this.tableInfo = await this.getTableInfo()
    return true
  }

  private async createTable() {
    return new Promise((resolve, reject) => {
      if (this.createTableInput) {
        this.dynamodb.createTable(this.createTableInput, (createErr: any, tableData: DynamoDB.Types.CreateTableOutput) => {
          if (createErr) {
            reject(createErr)
            return
          }
          resolve(tableData)
        })
      } else {
        reject('createTableInput Required')
      }
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
          resolve(await this.createTable())
        } else {
          resolve(await this.readTableDescription(this.tableName))
        }
      })
    })
  }

  private async getTableInfo() {
    if (!this.tableInfo) {
      this.tableInfo = await this.createTableIfNeeded()
    }
    return this.tableInfo
  }
}
