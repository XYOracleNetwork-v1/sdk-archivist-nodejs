import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { InMemoryCache, NormalizedCacheObject } from 'apollo-cache-inmemory'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import gql from 'graphql-tag'
import nodeFetch from 'node-fetch'

export class ArchivistAbsorber extends XyoBase {
  private cursorHash: string | undefined
  private client: ApolloClient<NormalizedCacheObject>

  constructor(endpoint: string) {
    super()

    this.client = new ApolloClient({
      cache: new InMemoryCache(),
      link: createHttpLink({
        fetch: nodeFetch as any,
        uri: endpoint,
      }),
    })
  }

  public async readBlocks(n: number): Promise<Buffer[]> {
    const result = await this.client.query({
      query: this.blockQuery(n, this.cursorHash),
    })

    const resultArray = result.data.blockList.items as any[]

    if (resultArray.length === 0) {
      return []
    }

    this.cursorHash = resultArray[resultArray.length - 1].signedHash
    this.logInfo(
      `Read ${resultArray.length}, Absorber cursor hash set to: ${this.cursorHash}`
    )

    return resultArray.map((item) => {
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
