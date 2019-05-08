import { IXyoDataResolver } from '../../graphql-server'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { IXyoArchivistRepository } from '../../repository'
import bs58 from 'bs58'
import { bufferToGraphQlBlock } from './buffer-to-graphql-block'

export const serviceDependencies = ['archivistRepository', 'hashProvider', 'serializationService']

export class XyoTraceChainResolver extends XyoBase implements IXyoDataResolver<any, any, any, any> {

  public static query = 'traceChain(publicKey: String!, limit: Int, up: Boolean, cursor: String): XyoBlockCollection'
  public static dependsOnTypes = ['XyoBlockCollection']

  constructor(
    private readonly archivistRepository: IXyoArchivistRepository
  ) {
    super()
  }

  public async resolve(obj: any, args: any, context: any, info: any): Promise<any> {
    if (!args || !args.publicKey) {
      return []
    }

    const innerBlocks = await this.traceChain(args.publicKey, args.limit, args.cursor, args.up)

    return innerBlocks
  }

  private getCursor(string: string | undefined): Buffer | undefined {
    if (string && string !== '') {
      return bs58.decode(string)
    }

    return undefined
  }

  private async traceChain(publicKey: string, limit: number | undefined, cursor: string | undefined, up: boolean) {
    try {
      const traceChainResult = await this.archivistRepository.traceChain(bs58.decode(publicKey), limit || 100, this.getCursor(cursor), up)
      console.log(traceChainResult)
      const serializedBoundWitnesses = traceChainResult.map((block: Buffer) => {
        return bufferToGraphQlBlock(block)
      })

      return {
        blocks: serializedBoundWitnesses,
        keySet: [publicKey]
      }

    } catch (e) {
      this.logError(`There was an error getting block-collection from public-key ${e}`)
      return {
        blocks: [],
        keySet: [publicKey]
      }
    }
  }
}
