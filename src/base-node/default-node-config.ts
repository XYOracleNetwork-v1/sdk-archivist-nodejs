/*
 * File: default-node-options.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Thursday, 18th April 2019 1:55:31 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 7:41:51 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IXyoNodeConfig } from './@types'

export const DEFAULT_NODE_ARCHIVIST_CONFIG: IXyoNodeConfig = {
  tcpServerConfig: {
    serverPort: 11000
  },
  originStateRepository: {
    path: './archivist-state.json'
  },
  graphql: {
    port: 11001,
    apis: {
      about: true,
      blockByHash: true,
      entities: true,
      blockList: true,
      blocksByPublicKey: true,
      traceChain: true
    }
  },
  aboutMeService: {
    ip: '127.0.0.1',
    boundWitnessServerPort: 11000,
    graphqlPort: 11001,
    version: '0.23.0',
    name: 'Test Archivist'
  },
}

export const DEFAULT_NODE_CONFIG_MYSQL: Partial<IXyoNodeConfig> = {
  archivistRepository: {
    platform: 'mysql',
    config: {
      host: '127.0.0.1',
      user: 'admin',
      password: 'password',
      database: 'Xyo',
      port: 3306
    }
  }
}

export const DEFAULT_NODE_CONFIG_DYNAMODB: Partial<IXyoNodeConfig> = {
  archivistRepository: {
    platform: 'dynamodb'
  }
}
