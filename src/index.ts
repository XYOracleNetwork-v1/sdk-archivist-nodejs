/*
 * File: index.ts
 * Project: @xyo-network/sdk-archivist-nodejs
 * File Created: Wednesday, 17th April 2019 2:51:11 pm
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 30th April 2019 9:34:32 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoNode, DEFAULT_NODE_CONFIG_MYSQL, DEFAULT_NODE_CONFIG_DYNAMODB, DEFAULT_NODE_ARCHIVIST_CONFIG } from './base-node'
import _ from 'lodash'
import { instantiateBlockRepository } from './base-node/instantiators/xyo-originblock-repository-instaniator'
import { instantiateGraphql } from './base-node/instantiators/xyo-graphql-instantiator'
import { IXyoNodeConfig } from './base-node/@types'
import { XyoAboutMeService } from './about-me'
import { instantiateAboutMe } from './base-node/instantiators/xyo-aboutme-instantiator'
import { ArchivistAbsorber } from './absorb/archivist-absorber'
import { XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import bs58 from 'bs58'
import crypto from 'crypto'

export * from './about-me'
export * from './attribution-request'
export * from './base-node'
export * from './diviner-archivist-client'
export * from './graphql-apis'
export * from './graphql-server'
export * from './repository'
export * from './@types'

// function to launch for testing.  Should never be used in production
async function main() {
  const config = resolveConfig()
  const port = config.tcpServerConfig && config.tcpServerConfig.serverPort || 11000
  const path = config.originStateRepository && config.originStateRepository.path || './test-state.json'
  const db = config.archivistRepository && instantiateBlockRepository(config.archivistRepository) || (() => { throw new Error('No archivist repository') })()

  const node = new XyoNode(port, path, db)
  await node.start()
  await db.initialize()

  const about = config.aboutMeService && instantiateAboutMe(
  config.aboutMeService, node.stateRepo.getSigners()[0].getPublicKey().getAll().getContentsCopy()) || (() => { throw new Error('No about me') })()
  const graphql = config.graphql && instantiateGraphql(config.graphql, about, db) || (() => { throw new Error('No graphql') })()

  await graphql.start()

  // const absorber = new ArchivistAbsorber('http://3.80.173.107:11001/')
  // absorber.resetCursor('1N9qKYAMoSE91Rgm6C42SHNpj8TT9xiDsAUK5DRYcGgY7cY')

  // while (true) {
  //   const blocks = await absorber.readBlocks(5)

  //   for (const block of blocks) {
  //     const bw = new XyoBoundWitness(block)
  //     const hash = bw.getHash(new XyoSha256()).getAll().getContentsCopy()
  //     await db.addOriginBlock(hash, block)
  //   }

  // }
}

const resolveConfig = (): IXyoNodeConfig => {
  const db = process.argv.length > 2 ? process.argv[2] : 'unknown'

  switch (db) {
    case 'mysql': {
      return _.merge({}, DEFAULT_NODE_ARCHIVIST_CONFIG, DEFAULT_NODE_CONFIG_MYSQL)
    }
    case 'dynamodb': {
      return _.merge({}, DEFAULT_NODE_ARCHIVIST_CONFIG, DEFAULT_NODE_CONFIG_DYNAMODB)
    }
    default: {
      return DEFAULT_NODE_ARCHIVIST_CONFIG
    }
  }
}

if (require.main === module) {
  main()
}
