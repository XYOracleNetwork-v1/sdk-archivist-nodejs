/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Thursday, 14th February 2019 1:52:34 pm
 * @Email:  developer@xyfindables.com
 * @Filename: blockByHash.ts

 * @Last modified time: Friday, 22nd February 2019 2:23:24 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */
import { IXyoDataResolver } from '../../graphql-server'
import { GraphQLResolveInfo } from 'graphql'
import { XyoBase } from '@xyo-network/base'
import { IXyoOriginBlockRepository, XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import { XyoStructure } from '@xyo-network/object-model'

export const serviceDependencies = [
  'originBlockRepository',
  'hashProvider',
  'serializationService',
  'archivistNetwork?'
]

export default class XyoGetBlockByHashResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = 'blockByHash(hash: String!): XyoBlock'
  public static dependsOnTypes = ['XyoBlock']

  constructor(
    private readonly originBlockRepository: IXyoOriginBlockRepository
  ) {
    super()
  }

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const hexHash = args.hash as string
    const bufferHash = Buffer.from(hexHash, 'hex')

    const data = await this.originBlockRepository.getOriginBlock(bufferHash)
    if (!data) {
      return undefined
    }

    const bw = new XyoBoundWitness(data)

    return {
      humanReadable: bw.toString(),
      bytes: data.toString('hex'),
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
  }
}
