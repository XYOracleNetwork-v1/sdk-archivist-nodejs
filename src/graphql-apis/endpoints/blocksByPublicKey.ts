/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 2:50:26 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blocksByPublicKey.ts

 * @Last modified time: Thursday, 14th February 2019 2:53:21 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { IXyoDataResolver } from '../../graphql-server'
import { XyoBase } from '@xyo-network/base'
import { IXyoArchivistRepository } from '../../repository'
import { XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import { XyoStructure } from '@xyo-network/object-model'

export const serviceDependencies = ['archivistRepository', 'hashProvider', 'serializationService']

export default class XyoGetBlocksByPublicKeyResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = 'blocksByPublicKey(publicKeys: [String!]): [XyoBlockCollection]'
  public static dependsOnTypes = ['XyoBlockCollection']

  constructor(
    private readonly archivistRepository: IXyoArchivistRepository
  ) {
    super()
  }

  public async resolve (obj: any, args: any, context: any, info: any): Promise<any> {
    if (!args || !args.publicKeys || !args.publicKeys.length) {
      return []
    }

    const blocks = await Promise.all((args.publicKeys as string[]).map(async (publicKey) => {
      const innerBlocks = await this.getBlockCollectionForPublicKey(publicKey)
      return {
        publicKey,
        publicKeySet: innerBlocks.keySet,
        blocks: innerBlocks.blocks
      }
    }))

    return blocks
  }

  private async getBlockCollectionForPublicKey(publicKey: string) {
    try {
      const blocksByPublicKeySet = await this.archivistRepository.getOriginBlocksByPublicKey(
        Buffer.from(publicKey, 'hex')
      )

      const serializedBoundWitnesses = await Promise.all(blocksByPublicKeySet.items.map(async (block: Buffer) => {
        const bw = new XyoBoundWitness(block)
        return {
          humanReadable: bw.toString(),
          bytes: block.toString('hex'),
          publicKeys: bw.getPublicKeys().map((publickeyset: XyoStructure[]) => {
            return {
              array: publickeyset.map((publickey: XyoStructure) => {
                return {
                  value: publickey.getValue()
                }
              })
            }
          }),
          signatures: bw.getSignatures().map((signatureset: XyoStructure[]) => {
            return {
              array: signatureset.map((signature: XyoStructure) => {
                return {
                  value: signature.getValue()
                }
              })
            }
          }),
          heuristics: bw.getHeuristics().map((heuristicset: XyoStructure[]) => {
            return {
              array: heuristicset.map((heuristic: XyoStructure) => {
                return {
                  value: heuristic.getValue()
                }
              })
            }
          }),
          signedHash: new XyoSha256().hash(bw.getSigningData())
        }
      }))

      return {
        blocks: serializedBoundWitnesses
      }

    } catch (e) {
      this.logError('There was an error getting block-collection from public-key', e)
      return {
        blocks: [],
        keySet: [publicKey]
      }
    }
  }
}
