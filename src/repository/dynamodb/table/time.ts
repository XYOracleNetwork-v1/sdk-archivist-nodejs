/* eslint-disable require-await */
import { DynamoDB } from 'aws-sdk'

import { Table } from './table'

const TIME_MINUTE = 1000 * 60
const TIME_HOUR = TIME_MINUTE * 60

export class TimeTable extends Table {
  constructor(tableName = 'xyo-archivist-time', region = 'us-east-1') {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'Hour',
          AttributeType: 'N',
        },
        {
          AttributeName: 'Time',
          AttributeType: 'N',
        },
      ],
      KeySchema: [
        {
          AttributeName: 'Hour',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'Time',
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

  public async putItem(bytes: Buffer): Promise<void> {
    const currentTime = new Date().getTime()

    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            Bytes: {
              B: bytes,
            },
            Hour: {
              N: Math.floor(currentTime / TIME_HOUR).toString(),
            },
            Time: {
              N: currentTime.toString(),
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

  public async getByTime(
    hour: number,
    cursor: number,
    limit: number
  ): Promise<{ lastTime: number; results: Buffer[] }> {
    return new Promise<{ lastTime: number; results: Buffer[] }>(
      (resolve: any, reject: any) => {
        try {
          const params: DynamoDB.Types.QueryInput = {
            ExpressionAttributeNames: {
              '#hour': 'Hour',
              '#time': 'Time',
            },
            ExpressionAttributeValues: {
              ':hour': { N: hour.toString() },
              ':time': { N: cursor.toString() },
            },
            KeyConditionExpression: '#hour = :hour and #time < :time',
            Limit: limit,
            ScanIndexForward: false,
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
              let lastTime = 0
              if (data && data.Items) {
                for (const item of data.Items) {
                  if (item.Bytes && item.Bytes.B && item.Time && item.Time.N) {
                    result.push(item.Bytes.B)
                    lastTime = parseInt(item.Time.N, 10)
                  } else {
                    this.logError(`Result with Missing Bytes: ${item}`)
                  }
                }
              }
              resolve({ lastTime, results: result })
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
