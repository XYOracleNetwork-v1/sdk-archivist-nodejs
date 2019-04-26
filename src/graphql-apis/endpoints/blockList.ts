/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:11:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockList.ts

 * @Last modified time: Tuesday, 19th February 2019 10:55:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from '../../graphql-server'
import { GraphQLResolveInfo } from 'graphql'
import { IXyoOriginBlockRepository, XyoSha256, XyoBoundWitness } from '@xyo-network/sdk-core-nodejs'

export const serviceDependencies = ['originBlockRepository', 'hashProvider']

export default class XyoGetBlockList implements IXyoDataResolver<any, any, any, any> {

  public static query = 'blockList(limit: Int!, cursor: String): XyoBlockList!'
  public static dependsOnTypes = ['XyoBlockList']

  constructor(
    private readonly originBlockRepository: IXyoOriginBlockRepository
  ) {}

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const cursor = args.cursor as string | undefined
    const cursorBuffer = cursor ? Buffer.from(cursor, 'hex') : undefined
    const result = await this.originBlockRepository.getOriginBlocks(args.limit as number, cursorBuffer)

    let endCursor: string | undefined
    if (result.items.length) {
      const hasher = new XyoSha256()
      const signingData = new XyoBoundWitness(result.items[result.items.length - 1]).getSigningData()
      endCursor = hasher.hash(signingData).getAll().getContentsCopy().toString()
    }

    return {
      meta: {
        endCursor,
        totalCount: result.total
      },
      items: await Promise.all(result.items.map(async(block: any) => {
        return {
          humanReadable: block.getReadableValue(),
          bytes: block.serializeHex(),
          publicKeys: block.publicKeys.map((keyset: any) => {
            return {
              array: keyset.keys.map((key: any) => {
                return {
                  value: key.serializeHex()
                }
              })
            }
          }),
          signatures: block.signatures.map((sigSet: any) => {
            return {
              array: sigSet.signatures.map((sig: any) => {
                return {
                  value: sig.serializeHex()
                }
              })
            }
          }),
          heuristics: block.heuristics.map((heuristicSet: any) => {
            return {
              array: heuristicSet.map((heuristic: any) => {
                return {
                  value: heuristic.serializeHex()
                }
              })
            }
          }),
          ssignedHash: new XyoSha256().hash(block.getSigningData())
        }
      }))
    }
  }
}
