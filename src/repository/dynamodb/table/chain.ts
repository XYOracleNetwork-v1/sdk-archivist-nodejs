
import { Table } from './table'
import { DynamoDB } from 'aws-sdk'

export class ChainTable extends Table {

  constructor(
        tableName: string = 'xyo-archivist-chains',
        region: string = 'us-east-1'
      ) {
    super(tableName, region)
    this.createTableInput = {
      AttributeDefinitions: [
        {
          AttributeName: 'BlockHash',
          AttributeType: 'B'
        },
        {
          AttributeName: 'ChainSegmentId',
          AttributeType: 'B'
        },
      ],
      KeySchema: [
        {
          AttributeName: 'BlockHash',
          KeyType: 'HASH'
        },
        {
          AttributeName: 'ChainSegmentId',
          KeyType: 'RANGE'
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    }
  }

  public async putItem(
    hash: Buffer,
    previousHash: Buffer | undefined,
    nextPublicKey: Buffer | undefined,
    chainSegmentId: Buffer
  ): Promise<void> {
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            ChainSegmentId: {
              B: chainSegmentId
            },
            BlockHash: {
              B: hash
            },
            PreviousHash: {
              B: previousHash
            },
            AttributeName: {
              B: nextPublicKey
            },
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
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }
}

// {
//     AttributeName: 'PreviousHash',
//     AttributeType: 'B'
//   },
//   {
//     AttributeName: 'NextPublicKey',
//     AttributeType: 'B'
//   },
