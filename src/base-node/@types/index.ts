/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Friday, 8th February 2019 12:54:30 pm
 * @Email:  developer@xyfindables.com
 * @Filename: index.ts

 * @Last modified time: Thursday, 14th February 2019 10:33:42 am
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

export interface IXyoNetworkConfig {
  port: number
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
    traceChain: boolean
  }
}

export interface IXyoTcpBoundWitnessConfig {
  serverPort: number
}

export interface IXyoArchivistRepositoryConfig {
  platform: string,
  config?: any
}

export interface IXyoOriginStateConfig {
  path: string
}

export interface IXyoNodeConfig {
  tcpServerConfig?: IXyoTcpBoundWitnessConfig,
  originStateRepository?: IXyoOriginStateConfig,
  archivistRepository?: IXyoArchivistRepositoryConfig,
  aboutMeService?: IXyoAboutMeConfig,
  graphql?: IXyoGraphQLConfig,
}
