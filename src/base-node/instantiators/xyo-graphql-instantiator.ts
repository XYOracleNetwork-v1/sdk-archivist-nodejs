import { IXyoGraphQLConfig, IXyoAboutMeConfig } from '../@types'
import { XyoGraphQLServer } from '../../graphql-server'
import { XyoAboutMeService } from '../../about-me'
import { XyoAboutMeResolver } from '../../graphql-apis/endpoints/about'
import { IXyoArchivistRepository } from '../../repository'
import { XyoGetBlockByHashResolver } from '../../graphql-apis/endpoints/blockByHash'
import { XyoGetBlockList } from '../../graphql-apis/endpoints/blockList'
import { XyoGetBlocksByPublicKeyResolver } from '../../graphql-apis/endpoints/blocksByPublicKey'
import { GetEntitiesResolver } from '../../graphql-apis/endpoints/entities'

export function instantiateGraphql(config: IXyoGraphQLConfig, about: XyoAboutMeService | undefined, archivistRepo: IXyoArchivistRepository | undefined): XyoGraphQLServer {
  const server = new XyoGraphQLServer(getGraphQlSchema(config), config.port)

  if (config.apis.about && about) {
    const endpoint = new XyoAboutMeResolver(about)
    server.addQueryResolver('about', endpoint)
  }

  if (config.apis.blockByHash && archivistRepo) {
    const endpoint = new XyoGetBlockByHashResolver(archivistRepo)
    server.addQueryResolver('blockByHash', endpoint)
  }

  if (config.apis.blockList && archivistRepo) {
    const endpoint = new XyoGetBlockList(archivistRepo)
    server.addQueryResolver('blockList', endpoint)
  }

  if (config.apis.blocksByPublicKey && archivistRepo) {
    const endpoint = new XyoGetBlocksByPublicKeyResolver(archivistRepo)
    server.addQueryResolver('blocksByPublicKey', endpoint)
  }

  if (config.apis.entities && archivistRepo) {
    const endpoint = new GetEntitiesResolver(archivistRepo)
    server.addQueryResolver('entities', endpoint)
  }

  return server
}

const getGraphQlSchema = (config: IXyoGraphQLConfig): string => {
  const queries: string[] = []
  const types: string[] = []

  types.push(require('../../graphql-apis/graphql-types/List').type)
  types.push(require('../../graphql-apis/graphql-types/ListMeta').type)
  types.push(require('../../graphql-apis/graphql-types/XyoAboutMe').type)
  types.push(require('../../graphql-apis/graphql-types/XyoBlock').type)
  types.push(require('../../graphql-apis/graphql-types/XyoBlockCollection').type)
  types.push(require('../../graphql-apis/graphql-types/XyoBlockList').type)
  types.push(require('../../graphql-apis/graphql-types/XyoEntitiesList').type)
  types.push(require('../../graphql-apis/graphql-types/XyoEntity').type)
  types.push(require('../../graphql-apis/graphql-types/XyoEntityType').type)
  types.push(require('../../graphql-apis/graphql-types/XyoHeuristicSet').type)
  types.push(require('../../graphql-apis/graphql-types/XyoIntersectionList').type)
  types.push(require('../../graphql-apis/graphql-types/XyoKeySet').type)
  types.push(require('../../graphql-apis/graphql-types/XyoObject').type)
  types.push(require('../../graphql-apis/graphql-types/XyoPublicKey').type)
  types.push(require('../../graphql-apis/graphql-types/XyoSignature').type)
  types.push(require('../../graphql-apis/graphql-types/XyoSignatureSet').type)
  types.push(require('../../graphql-apis/graphql-types/XyoTransaction').type)
  types.push(require('../../graphql-apis/graphql-types/XyoTransactionList').type)

  if (config.apis.about) {
    queries.push(XyoAboutMeResolver.query)
  }

  if (config.apis.blockByHash) {
    queries.push(XyoGetBlockByHashResolver.query)
  }

  if (config.apis.blockList) {
    queries.push(XyoGetBlockList.query)
  }

  if (config.apis.blocksByPublicKey) {
    queries.push(XyoGetBlocksByPublicKeyResolver.query)
  }

  if (config.apis.entities) {
    queries.push(GetEntitiesResolver.query)
  }

  return `
    scalar JSON

    type Query {
        ${queries.join('\n  ')}
    }

    ${types.join('\n\n')}
    `
}
