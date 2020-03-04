/* eslint-disable @typescript-eslint/no-explicit-any */
/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 1:52:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockByHash.ts

 * @Last modified time: Friday, 22nd February 2019 2:23:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { IXyoOriginBlockGetter } from '@xyo-network/sdk-core-nodejs'
import { bufferToGraphQlBlock } from './buffer-to-graphql-block'
import bs58 from 'bs58'

export class XyoGetBlockByHashResolver extends XyoBase {
  public static query = 'blockByHash(hash: String!): XyoBlock'
  public static queryName = 'blockByHash'

  constructor(private readonly originBlockRepository: IXyoOriginBlockGetter) {
    super()
  }

  public async resolve(obj: any, args: any): Promise<any> {
    const stringHash = args.hash as string
    const bufferHash = bs58.decode(stringHash)

    const data = await this.originBlockRepository.getOriginBlock(bufferHash)
    if (!data) {
      return undefined
    }

    return bufferToGraphQlBlock(data)
  }
}
