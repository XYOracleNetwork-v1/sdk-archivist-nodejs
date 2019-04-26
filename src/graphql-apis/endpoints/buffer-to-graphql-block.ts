import { XyoStructure } from '@xyo-network/object-model'
import { XyoBoundWitness, XyoSha256 } from '@xyo-network/sdk-core-nodejs'
import bs58 from 'bs58'

const hasher = new XyoSha256()

export function bufferToGraphQlBlock(buffer: Buffer): any {
  const boundWitness = new XyoBoundWitness(buffer)
  return {
    // todo get human readable
    humanReadable: JSON.stringify({}),
    bytes: buffer.toString('base64'),
    publicKeys: boundWitness.getPublicKeys().map((keyset: XyoStructure[]) => {
      return {
        array: keyset.map((key: XyoStructure) => {
          return {
            value: bs58.encode(key.getAll().getContentsCopy())
          }
        })
      }
    }),
    signatures: boundWitness.getSignatures().map((sigset: XyoStructure[]) => {
      return {
        array: sigset.map((sig: XyoStructure) => {
          return {
            value: sig.getAll().getContentsCopy().toString('base64')
          }
        })
      }
    }),
    heuristics: boundWitness.getHeuristics().map((heuristics: XyoStructure[]) => {
      return {
        array: heuristics.map((heuristic: XyoStructure) => {
          return {
            value: heuristic.getAll().getContentsCopy().toString('base64')
          }
        })
      }
    }),
    signedHash: bs58.encode(hasher.hash(boundWitness.getSigningData()).getAll().getContentsCopy())
  }
}
