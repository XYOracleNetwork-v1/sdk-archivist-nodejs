
import { Table } from './table'
import { DynamoDB } from 'aws-sdk'

const TIME_MINUTE = 1000 * 60
const TIME_HOUR = TIME_MINUTE * 60

export class TimeTable extends Table {

  constructor(
    tableName: string = 'xyo-archivist-time',
    region: string = 'us-east-1'
  ) {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'Hour',
          AttributeType: 'N'
        },
        {
          AttributeName: 'Time',
          AttributeType: 'N'
        },
      ],
      KeySchema: [
        {
          AttributeName: 'Hour',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'Time',
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

  public async putItem(bytes: Buffer): Promise<void> {
    const currentTime = (new Date()).getTime()

    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            Hour: {
              N: Math.floor(currentTime / TIME_HOUR).toString()
            },
            Time: {
              N: currentTime.toString()
            },
            Bytes: {
              B: bytes
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

  public async getByTime(hour: number, cursor: number, limit: number): Promise <Buffer[]> {
    return new Promise<Buffer[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          Limit: limit,
          KeyConditionExpression: 'Hour = :hour and Time < :cursor',
          ExpressionAttributeValues: {
            ':hour': { N: hour.toString() },
            ':time': { N: cursor.toString() }
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
              if (item.Bytes && item.Bytes.B) {
                result.push(item.Bytes.B)
              } else {
                this.logError(`Result with Missing Bytes: ${item}`)
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
