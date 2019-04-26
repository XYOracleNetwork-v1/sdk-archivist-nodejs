/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Thursday, 25th April 2019 4:59:52 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoNode } from './base-node'
import { DEFAULT_NODE_OPTIONS_MYSQL, DEFAULT_NODE_OPTIONS_DYNAMODB, DEFAULT_NODE_OPTIONS } from './base-node/default-node-options'

export * from './about-me/'
export * from './attribution-request/'
export * from './attribution-request-node-network/'
export * from './base-node'
export * from './diviner-archivist-client'
export * from './graphql-apis'
export * from './graphql-server'
export * from './repository'
export * from './@types'

// function to launch for testing.  Should never be used in production
async function main() {
  let node
  const db = process.argv.length > 2 ? process.argv[2] : 'unknown'
  switch (db) {
    case 'mysql': {
      node = new XyoNode()
      break
    }
    case 'dynamodb': {
      node = new XyoNode()
      break
    }
    default: {
      node = new XyoNode()
      break
    }
  }
  await node.start()
}

if (require.main === module) {
  main()
}
