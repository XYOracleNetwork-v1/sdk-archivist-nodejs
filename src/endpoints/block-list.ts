/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:11:32 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockList.ts

 * @Last modified time: Tuesday, 19th February 2019 10:55:05 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoOriginBlockRepository, XyoSha256, XyoBoundWitness, IXyoOriginBlockGetter } from '@xyo-network/sdk-core-nodejs'
import { bufferToGraphQlBlock } from './buffer-to-graphql-block'
import bs58 from 'bs58'

export class XyoGetBlockList {

  public static query = 'blockList(limit: Int!, cursor: String): XyoBlockList!'
  public static queryName = 'blockList'

  constructor(
    private readonly originBlockRepository: IXyoOriginBlockGetter
  ) {}

  public async resolve(obj: any, args: any): Promise<any> {
    const cursor = args.cursor as string | undefined
    const cursorBuffer = cursor ? bs58.decode(cursor) : undefined
    const result = await this.originBlockRepository.getOriginBlocks(args.limit as number, cursorBuffer)

    let endCursor: string | undefined
    if (result.items.length) {
      const hasher = new XyoSha256()
      const signingData = new XyoBoundWitness(result.items[result.items.length - 1]).getSigningData()
      endCursor = hasher.hash(signingData).getAll().getContentsCopy().toString()
    }

    const items: any[] = []

    result.items.forEach((buffer) => {
      try {
        items.push(bufferToGraphQlBlock(buffer))
      } catch {
        // do nothing if there is an error parcing the block todo delete the block
      }
    })

    return {
      items,
      meta: {
        endCursor,
        totalCount: result.total
      },
    }
  }
}
