/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 23rd April 2019 6:15:25 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoNode } from './base-node'
import { DEFAULT_NODE_OPTIONS_MYSQL, DEFAULT_NODE_OPTIONS_DYNAMODB, DEFAULT_NODE_OPTIONS } from './base-node/default-node-options'

export { default as AboutMe } from './about-me/'
export { default as AttributionRequest } from './attribution-request/'
export { default as AttributionRequestNodeNetwork } from './attribution-request-node-network/'
export { default as BaseNode } from './base-node'
export { default as BlockProducer } from './block-producer'
export { default as BlockWitness } from './block-witness'
export { default as Consensus } from './consensus'
export { default as ContentAddressableService } from './content-addressable-service'
export { default as DataGenerator } from './data-generator'
export { default as DivinerArchivistClient } from './diviner-archivist-client'
export { default as GraphqlApis } from './graphql-apis'
export { default as GraphqlServer } from './graphql-server'
export { default as IpfsClient } from './ipfs-client'
export { default as Network } from './network/'
export { default as Questions } from './questions'
export { default as Repository } from './repository'
export { default as TransactionPool } from './transaction-pool'
export { default as Types } from './@types'
export { default as Web3QuestionService } from './web3-question-service'
export { default as Web3Service } from './web3-service'

// function to launch for testing.  Should never be used in production
async function main() {
  let node
  const db = process.argv.length > 2 ? process.argv[2] : 'unknown'
  switch (db) {
    case 'mysql': {
      node = new XyoNode(DEFAULT_NODE_OPTIONS_MYSQL)
      break
    }
    case 'dynamodb': {
      node = new XyoNode(DEFAULT_NODE_OPTIONS_DYNAMODB)
      break
    }
    default: {
      node = new XyoNode(DEFAULT_NODE_OPTIONS)
      break
    }
  }
  await node.initialize()
  await node.start()
}

if (require.main === module) {
  main()
}
