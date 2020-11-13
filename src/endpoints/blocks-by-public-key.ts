/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:50:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blocksByPublicKey.ts

 * @Last modified time: Thursday, 14th February 2019 2:53:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { XyoBlockByPublicKeyRepository } from '@xyo-network/sdk-core-nodejs'
import bs58 from 'bs58'

import { bufferToGraphQlBlock } from './buffer-to-graphql-block'

export class XyoGetBlocksByPublicKeyResolver extends XyoBase {
  public static query =
    'blocksByPublicKey(publicKey: String!, up: Boolean!, limit: Int, index: Int): XyoBlockCollection'
  public static queryName = 'blocksByPublicKey'

  constructor(
    private readonly archivistRepository: XyoBlockByPublicKeyRepository
  ) {
    super()
  }

  public async resolve(obj: any, args: any): Promise<any> {
    if (!args || !args.publicKey) {
      return []
    }

    const innerBlocks = await this.getBlockCollectionForPublicKey(
      args.publicKey,
      args.limit,
      args.index,
      args.up
    )

    return innerBlocks
  }

  private async getBlockCollectionForPublicKey(
    publicKey: string,
    limit: number | undefined,
    index: number | undefined,
    up: boolean
  ) {
    try {
      const blocksByPublicKeySet = await this.archivistRepository.getOriginBlocksByPublicKey(
        bs58.decode(publicKey),
        index,
        limit,
        up
      )

      const serializedBoundWitnesses = await blocksByPublicKeySet.items.map(
        (block: Buffer) => {
          return bufferToGraphQlBlock(block)
        }
      )

      return {
        blocks: serializedBoundWitnesses,
        keySet: [publicKey],
      }
    } catch (e) {
      this.logError(
        `There was an error getting block-collection from public-key ${e}`
      )
      return {
        blocks: [],
        keySet: [publicKey],
      }
    }
  }
}
