/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { createHttpLink } from 'apollo-link-http'
import { ApolloClient } from 'apollo-client'
import nodeFetch from 'node-fetch'
import gql from 'graphql-tag'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class ArchivistAbsorber extends XyoBase {
  private cursorHash: string | undefined
  private client: ApolloClient<NormalizedCacheObject>

  constructor(endpoint: string) {
    super()

    this.client = new ApolloClient({
      link: createHttpLink({
        fetch: nodeFetch as any,
        uri: endpoint
      }),
      cache: new InMemoryCache()
    })
  }

  public async readBlocks(n: number): Promise<Buffer[]> {
    const result = await this.client.query({
      query: this.blockQuery(n, this.cursorHash)
    })

    const resultArray = result.data.blockList.items as any[]

    if (resultArray.length === 0) {
      return []
    }

    this.cursorHash = resultArray[resultArray.length - 1].signedHash
    this.logInfo(
      `Read ${resultArray.length}, Absorber cursor hash set to: ${this.cursorHash}`
    )

    return resultArray.map(item => {
      return Buffer.from(item.bytes, 'base64')
    })
  }

  public resetCursor(cursor: string | undefined) {
    this.cursorHash = cursor
  }

  private blockQuery = (limit: number, offset: string | undefined) => {
    if (offset) {
      return gql`
        query {
                blockList(limit: ${limit}, cursor: "${offset}") {
                items {
                  signedHash
                  bytes
                }
            }
        }
      `
    }

    return gql`
        query {
                blockList(limit: ${limit}) {
                items {
                    signedHash
                    bytes
                }
            }
        }
    `
  }
}
