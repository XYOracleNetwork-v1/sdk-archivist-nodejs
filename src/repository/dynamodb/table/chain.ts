
import { Table } from './table'
import { DynamoDB } from 'aws-sdk'

export interface IChainRow {
  segmentId: Buffer
  hash: Buffer
  index: number
  nextPublicKey: Buffer | undefined
  previousHash: Buffer | undefined
  publicKeys: Buffer[],
  topSegment: Buffer | undefined,
  bottomSegment: Buffer | undefined
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
          AttributeName: 'Index',
          AttributeType: 'N'
        },
        {
          AttributeName: 'ChainSegmentId',
          AttributeType: 'B'
        },
      ],
      KeySchema: [
        {
          AttributeName: 'Index',
          KeyType: 'RANGE'
        },
        {
          AttributeName: 'ChainSegmentId',
          KeyType: 'HASH'
        },
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      TableName: tableName
    }
  }

  public async putItem(row: IChainRow): Promise<boolean> {
    this.logDebug('putItem')
    return new Promise<boolean>((resolve: any, reject: any) => {
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
            Index: {
              N: row.index.toString(),
            },
          },
          ExpressionAttributeNames : {
            '#seg' : 'ChainSegmentId',
            '#index' : 'Index',
          },
          ConditionExpression: 'attribute_not_exists(#seg) AND attribute_not_exists(#index)',
          ReturnConsumedCapacity: 'TOTAL',
          TableName: this.tableName
        }

        if (row.nextPublicKey) { params.Item.NextPublicKey = { B: row.nextPublicKey } }
        if (row.previousHash) { params.Item.PreviousHash = { B: row.previousHash } }
        if (row.topSegment) { params.Item.TopSegment = {  B: row.topSegment  } }
        if (row.bottomSegment) { params.Item.BottomSegment = { B: row.bottomSegment } }

        this.dynamodb.putItem(params, (err: any, data: DynamoDB.Types.PutItemOutput) => {
          if (err) {
            resolve(false)
            return
          }
          resolve(true)
        })
      } catch (ex) {
        this.logError(ex)
        reject(ex)
      }
    })
  }

  // todo abstract this function
  public async getByHash(hash: Buffer): Promise<IChainRow[]> {
    this.logDebug('getByHash')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          IndexName: 'BlockHash',
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
    this.logDebug('getByPreviousHash')
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
    this.logDebug('getByNextPublicKey')
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

  public async updateBottomSegment(newBottomSegment: Buffer, blockHash: number, chainSegmentId: Buffer) {
    return new Promise((resolve, reject) => {
      const params: DynamoDB.Types.Update = {
        Key: {
          Index: {
            N: blockHash.toString()
          },
          ChainSegmentId: {
            B: chainSegmentId
          },
        },
        TableName: this.tableName,
        UpdateExpression: 'set #BottomSegment = :seg',
        ExpressionAttributeNames: {
          '#BottomSegment': 'BottomSegment'
        },
        ExpressionAttributeValues: {
          ':seg': { B: newBottomSegment }
        }
      }

      this.dynamodb.updateItem(params, (error) => {
        if (error) {
          this.logError(`Error updating item: ${error}`)
          reject(error)
          return
        }

        resolve()
      })
    })
  }

  public async getBySegmentId(id: Buffer, up: boolean, limit: number, offsetIndex: number | undefined): Promise<IChainRow[]> {
    this.logDebug('getBySegmentId')
    return new Promise<IChainRow[]>((resolve: any, reject: any) => {
      try {
        const params: DynamoDB.Types.QueryInput = {
          KeyConditionExpression: 'ChainSegmentId = :seg',
          ExpressionAttributeValues: {
            ':seg': { B: id }
          },
          TableName: this.tableName,
          Limit: limit,
          ScanIndexForward: up
        }

        if (offsetIndex) {
          params.ExclusiveStartKey = {
            ChainSegmentId: {
              B: id
            },
            Index: {
              N: offsetIndex.toString()
            }
          }
        }

        this.dynamodb.query(params, async(err: any, data: DynamoDB.Types.ScanOutput) => {
          if (err) {
            this.logError(err)
            reject(err)
          }

          // todo move this filter into dynanmo
          resolve(this.getChainRowFromResult(data).filter((item) => {
            if (up) {
              return item.index > (offsetIndex || 0)
            }

            return item.index < (offsetIndex || 0)
          }))
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
        if (item.BlockHash && item.BlockHash.B && item.ChainSegmentId && item.ChainSegmentId.B && item.PublicKeys && item.PublicKeys.BS && item.Index && item.Index.N) {
          result.push({
            segmentId: item.ChainSegmentId.B as Buffer,
            hash: item.BlockHash.B as Buffer,
            nextPublicKey: item.BlockHash && item.BlockHash.B as Buffer | undefined,
            previousHash: item.PreviousHash && item.PreviousHash.B as Buffer | undefined,
            publicKeys: item.PublicKeys.BS as Buffer[],
            bottomSegment: item.BottomSegment && item.BottomSegment.B as Buffer | undefined,
            topSegment: item.TopSegment && item.TopSegment.B as Buffer | undefined,
            index: Number.parseInt(item.Index.N, 10),
          })
        } else {
          this.logError(`Result with Missing BlochHash or ChainSegmentId or PublicKeys: ${item}`)
        }
      }
    }

    return result
  }
}
