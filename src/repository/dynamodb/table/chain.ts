
import { Table } from './table'
import { DynamoDB } from 'aws-sdk'

export interface IChainRow {
  segmentId: Buffer
  hash: Buffer
  nextPublicKey: Buffer | undefined
  previousHash: Buffer | undefined
  publicKeys: Buffer[]
}

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

  public async putItem(row: IChainRow): Promise<void> {
    this.logInfo('putItem')
    return new Promise<void>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.PutItemInput = {
          Item: {
            ChainSegmentId: {
              B: row.segmentId
            },
            BlockHash: {
              B: row.hash
            },

            PublicKeys: {
              BS: row.publicKeys
            },
          },
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }

        if (row.nextPublicKey) {
          params.Item.NextPublicKey = {
            B: row.nextPublicKey
          }
        }

        if (row.previousHash) {
          params.Item.PreviousHash = {
            B: row.previousHash
          }
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

  // todo abstract this function
  public async getByHash(hash: Buffer): Promise<IChainRow[]> {
    this.logInfo('getByHash')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          KeyConditionExpression: 'BlockHash = :key',
          ExpressionAttributeValues: {
            ':key': { B: hash }
          },
          TableName: this.tableName
        }
        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          resolve(this.getChainRowFromResult(data))
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async getByPreviousHash(hash: Buffer): Promise<IChainRow[]> {
    this.logInfo('getByPreviousHash')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          KeyConditionExpression: 'PreviousHash = :hash',
          IndexName: 'PreviousHash',
          ExpressionAttributeValues: {
            ':hash': { B: hash }
          },
          TableName: this.tableName
        }
        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          resolve(this.getChainRowFromResult(data))
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async getByNextPublicKey(key: Buffer): Promise<IChainRow[]> {
    this.logInfo('getByNextPublicKey')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          KeyConditionExpression: 'NextPublicKey = :key',
          ExpressionAttributeValues: {
            ':key': { B: key }
          },
          TableName: this.tableName
        }
        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          resolve(this.getChainRowFromResult(data))
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  public async getBySegmentId(id: Buffer): Promise<IChainRow[]> {
    this.logInfo('getBySegmentId')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          KeyConditionExpression: 'ChainSegmentId = :seg',
          ExpressionAttributeValues: {
            ':seg': { B: id }
          },
          TableName: this.tableName
        }
        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          resolve(this.getChainRowFromResult(data))
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  private getChainRowFromResult(data: DynamoDB.Types.ScanOutput): IChainRow[] {
    const result: IChainRow[] = []
    if (data && data.Items) {
      for (const item of data.Items) {
        if (item.BlockHash && item.BlockHash.B && item.ChainSegmentId && item.ChainSegmentId.B && item.PublicKeys && item.PublicKeys.BS) {
          result.push({
            segmentId: item.ChainSegmentId.B as Buffer,
            hash: item.BlockHash.B as Buffer,
            nextPublicKey: item.BlockHash && item.BlockHash.B as Buffer | undefined,
            previousHash: item.NextPublicKey && item.NextPublicKey.B as Buffer | undefined,
            publicKeys: item.PublicKeys.BS as Buffer[]
          })
        } else {
          this.logError(`Result with Missing BlochHash or ChainSegmentId or PublicKeys: ${item}`)
        }
      }
    }

    return result
  }
}
