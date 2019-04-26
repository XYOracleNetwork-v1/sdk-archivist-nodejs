/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 8th February 2019 12:54:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts

 * @Last modified time: Thursday, 14th February 2019 10:33:42 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import {
  CatalogueItem
} from '@xyo-network/network'

import {
  IXyoComponentFeatureResponse,
} from '@xyo-network/node-network'

export interface IXyoDiscoveryConfig {
  bootstrapNodes: string[]
  publicKey: string
  address: string
}

export interface IXyoPeerTransportConfig {
  address: string
}

export interface IXyoNodeNetworkConfig {
  shouldServiceBlockPermissionRequests: boolean
  features: IXyoComponentFeatureResponse
}

export interface IXyoNetworkConfig {
  port: number
}

export interface IXyoNetworkProcedureCatalogueConfig {
  catalogue: CatalogueItem[]
}

export interface IXyoOriginStateConfig {
  data: string
}

export interface IXyoAboutMeConfig {
  ip: string
  boundWitnessServerPort: number | undefined
  graphqlPort: number | undefined
  version: string
  name: string
}

export interface IXyoGraphQLConfig {
  port: number
  apis: {
    about: boolean
    blockByHash: boolean
    blockList: boolean
    entities: boolean
    blocksByPublicKey: boolean
    intersections: boolean
    transactionList: boolean
  }
}

export interface IXyoTCPBoundWitnessConfig {
  serverPort: number
}

export interface IXyoBoundWitnessConfig {
  catalogue: CatalogueItem[]
  tcp: IXyoTCPBoundWitnessConfig
}

export interface IXyoDataConfig {
  path?: string
}

export interface IXyoNodeDelegatesConfig {
  enableBoundWitnessServer: boolean
  enableGraphQLServer: boolean
  enableQuestionsWorker: boolean
}

export interface IXyoNodeConfig {
  data?: IXyoDataConfig,
  nodeRunnerDelegates?: any,
  blockProducer?: any,
  blockWitness?: any,
  discovery?: any,
  peerTransport?: any,
  nodeNetworkFrom?: any,
  network?: any,
  originChainRepository?: any,
  networkProcedureCatalogue?: any,
  archivistRepository?: any,
  boundWitnessValidator?: any,
  aboutMeService?: any,
  graphql?: any,
  web3Service?: any,
  contentAddressableService?: any,
  transactionRepository?: any
}

export interface IXyoNodeOptions {
  config?: IXyoNodeConfig
}

export type PartialNodeOptions = Partial<IXyoNodeOptions>
