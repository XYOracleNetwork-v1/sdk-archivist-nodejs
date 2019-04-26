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
import { bufferToGraphQlBlock } from './buffer-to-graphql-block'
import bs58 from 'bs58'

export const serviceDependencies = [
  'originBlockRepository',
  'hashProvider',
  'serializationService',
  'archivistNetwork?'
]

export class XyoGetBlockByHashResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = 'blockByHash(hash: String!): XyoBlock'
  public static dependsOnTypes = ['XyoBlock']

  constructor(
    private readonly originBlockRepository: IXyoOriginBlockRepository
  ) {
    super()
  }

  public async resolve(obj: any, args: any, context: any, info: GraphQLResolveInfo): Promise<any> {
    const stringHash = args.hash as string
    const bufferHash = bs58.decode(stringHash)

    const data = await this.originBlockRepository.getOriginBlock(bufferHash)
    if (!data) {
      return undefined
    }

    return bufferToGraphQlBlock(data)
  }
}
