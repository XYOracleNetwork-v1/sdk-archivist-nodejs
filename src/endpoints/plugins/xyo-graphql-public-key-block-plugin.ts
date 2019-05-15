import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate } from '@xyo-network/sdk-base-nodejs'
import { IXyoBlockByPublicKeyRepository } from '@xyo-network/sdk-core-nodejs'
import { XyoGetBlocksByPublicKeyResolver } from '../blocks-by-public-key'

export class XyoGraphQlBlockGetPlugin implements IXyoPlugin {

  public getName(): string {
    return 'graphql-public-key-block-getter'
  }

  public getProvides(): string[] {
    return []
  }

  public getPluginDependencies(): string[] {
    return [
      'BLOCK_REPOSITORY_PUBLIC_KEY', // for getting the blocks by public key
      'BASE_GRAPHQL_TYPES', // for base graphql types
    ]
  }

  public async initialize(deps: { [key: string]: any; }, config: any, graphql?: IXyoGraphQlDelegate | undefined): Promise<boolean> {
    const blockRepositoryPublicKey = deps.BLOCK_REPOSITORY_PUBLIC_KEY as IXyoBlockByPublicKeyRepository

    if (!graphql) {
      throw new Error('XyoGraphQlBlockGetPlugin is expecting graphql')
    }

    const resolverPublicKey = new XyoGetBlocksByPublicKeyResolver(blockRepositoryPublicKey)
    graphql.addQuery(XyoGetBlocksByPublicKeyResolver.query)
    graphql.addResolver(XyoGetBlocksByPublicKeyResolver.queryName, resolverPublicKey)

    return true
  }

}

module.exports = new XyoGraphQlBlockGetPlugin()
