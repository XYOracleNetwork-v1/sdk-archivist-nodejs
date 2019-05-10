import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { ChainTable, IChainRow } from './table/chain'
import { XyoBoundWitnessOriginGetter, XyoBoundWitness, XyoSha256, IXyoBoundWitnessHander, IXyoBoundWitnessOrigin } from '@xyo-network/sdk-core-nodejs'
import crypto from 'crypto'
import bs58 from 'bs58'

export class XyoDynamoChainTracer extends XyoBase {
  private chainsTable: ChainTable

  constructor(chainTable: ChainTable) {
    super()
    this.chainsTable = chainTable
  }

  public async getFromChainUp(startingChainSegmentId: Buffer, limit: number, offsetIndex: number): Promise<Buffer[]> {
    const firstResult = await this.getFromSegment(startingChainSegmentId, true, limit, offsetIndex - 1)

    // found thr amount we wanted so we can return
    if (firstResult.items.length >= limit) {
      return firstResult.items
    }

    if (!firstResult.topLink || firstResult.items.length === 0 || !firstResult.topIndex) {
      // hit the end of the chain
      return firstResult.items
    }

    const delta = limit - firstResult.items.length

    const toReturn: Buffer[] = firstResult.items
    const result = await this.getFromChainUp(firstResult.topLink, delta, firstResult.topIndex)

    for (const item of result) {
      toReturn.push(item)
    }

    return toReturn
  }

  public async getFromChainDown(startingChainSegmentId: Buffer, limit: number, offsetIndex: number): Promise<Buffer[]> {
    const firstResult = await this.getFromSegment(startingChainSegmentId, false, limit, offsetIndex + 1)

    // found thr amount we wanted so we can return
    if (firstResult.items.length >= limit) {
      return firstResult.items
    }

    if (!firstResult.bottomLink || firstResult.items.length === 0 || !firstResult.bottomIndex) {
      // hit the end of the chain
      return firstResult.items
    }

    // 4 - 2
    const delta = limit - firstResult.items.length

    const toReturn: Buffer[] = firstResult.items
    const result = await this.getFromChainDown(firstResult.bottomLink, delta, firstResult.bottomIndex)

    for (const item of result) {
      toReturn.push(item)
    }

    return toReturn
  }

  public async getFromSegment(chainSegmentId: Buffer, up: boolean, limit: number, offsetIndex: number): Promise < {
    items: Buffer[],
    topLink: Buffer | undefined,
    topIndex: number | undefined,
    bottomIndex: number | undefined,
    bottomLink: Buffer | undefined
  } > {
    const items = await this.chainsTable.getBySegmentId(chainSegmentId, up, limit, offsetIndex)

    const hashes: Buffer[] = []
    let topLink: Buffer | undefined
    let bottomLink: Buffer | undefined
    let topIndex: number | undefined
    let bottomIndex: number | undefined

    for (const item of items) {
      if (item.bottomSegment) {
        bottomLink = item.bottomSegment
      } else if (item.topSegment) {
        topLink = item.topSegment
      }

      if ((topIndex || 0) < item.index) {
        topIndex = item.index
      }

      if ((bottomIndex || item.index) >= item.index) {
        bottomIndex = item.index
      }

      hashes.push(item.hash)
    }

    return {
      topLink,
      bottomLink,
      bottomIndex,
      topIndex,
      items: hashes,
    }
  }

  public async traceChainWithOffsetHash(publicKey: Buffer, limit: number, offsetHash: Buffer, up: boolean): Promise<Buffer[]> {
    const blocksWithHash = await this.chainsTable.getByHash(offsetHash)

    for (const party of blocksWithHash) {
      for (const partyPublicKey of party.publicKeys) {
        if (publicKey.equals(partyPublicKey)) {
          // found the correct party to start from

          if (up) {
            return this.getFromChainUp(party.segmentId, limit, party.index)
          }

          return this.getFromChainDown(party.segmentId, limit, party.index)
        }
      }
    }

    return []
  }

  public async createSegments(boundWitness: XyoBoundWitness): Promise<void> {
    const allPublicKeys = boundWitness.getPublicKeys()
    const allOrigins = XyoBoundWitnessOriginGetter.getOriginInformation(boundWitness)
    const hash = boundWitness.getHash(new XyoSha256())

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < allPublicKeys.length; i++) {
      const publicKeysOfParty = allPublicKeys[i].map((item) => {
        return this.sha1(item.getAll().getContentsCopy())
      })

      const row = await this.findOrCreateChainRow(allOrigins[i], publicKeysOfParty, this.sha1(hash.getAll().getContentsCopy()))

      if (row) {
        await this.chainsTable.putItem(row)
      }
    }
  }

  private async traverseBlockDown(previousHash: Buffer, publicKeys: Buffer[]): Promise < IChainRow | undefined > {
    const blockParties = await this.chainsTable.getByHash(previousHash)

    for (const party of blockParties) {

      // check to see if the public keys are equal, if so it is the correct party
      for (const publicKey of publicKeys) {
        for (const partyPublicKey of party.publicKeys) {
          if (publicKey.equals(partyPublicKey)) {
            return party
          }
        }

        // check to see if the next public key is the public key, if so it is the correct party
        if (party.nextPublicKey && publicKey.equals(party.nextPublicKey)) {
          return party
        }
      }
    }

    return undefined
  }

  private async traverseBlockUp(hash: Buffer, publicKeys: Buffer[], nextPublicKey: Buffer | undefined): Promise < IChainRow | undefined > {
    const blockParties = await this.chainsTable.getByPreviousHash(hash)

    for (const party of blockParties) {

      // check to see if the public keys are equal, if so it is the correct party
      for (const publicKey of publicKeys) {
        for (const partyPublicKey of party.publicKeys) {

          // check to see if it is also the next public key
          if (publicKey.equals(partyPublicKey) || (nextPublicKey && publicKey.equals(nextPublicKey))) {
            return party
          }
        }
      }
    }

    return undefined
  }

  // todo move into the
  private async findOrCreateChainRow(origin: IXyoBoundWitnessOrigin, publicKeys: Buffer[], hash: Buffer): Promise < IChainRow | undefined> {
    const minPreviousHash = origin.previousHash && this.sha1(origin.previousHash)
    const minNextPublicKey =  origin.nextPublicKey && this.sha1(origin.nextPublicKey)
    const segmentIdTop = await this.traverseBlockUp(hash, publicKeys, minNextPublicKey)
    let segmentIdBelow: IChainRow | undefined

    if (minPreviousHash) {
      segmentIdBelow = await this.traverseBlockDown(minPreviousHash, publicKeys)
    }

    if (segmentIdTop && segmentIdBelow && segmentIdTop.hash && segmentIdTop.segmentId) {
      // do merge here

      const didNotExist = await this.chainsTable.putItem({
        hash,
        publicKeys,
        nextPublicKey: minNextPublicKey,
        previousHash: minPreviousHash,
        index: origin.index,
        segmentId: segmentIdBelow.segmentId,
        topSegment: segmentIdTop.segmentId,
        bottomSegment: undefined,
      })

      if (didNotExist) {
        this.logInfo(`Merging block segments: ${segmentIdTop.segmentId.toString('base64')}, ${segmentIdBelow.segmentId.toString('base64')}`)
        await this.chainsTable.updateBottomSegment(segmentIdBelow.segmentId, segmentIdTop.index, segmentIdTop.segmentId, segmentIdTop)
      }

      return undefined
    }

    if (segmentIdTop) {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} below ${segmentIdTop.segmentId.toString('base64')}`)
    } else if (segmentIdBelow) {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} on top of ${segmentIdBelow.segmentId.toString('base64')}`)
    } else {
      this.logInfo(`Adding block with hash ${bs58.encode(hash)} to new segment`)
    }

    // if no segment is found, create a new segment
    const segId = ((segmentIdBelow && segmentIdBelow.segmentId) || (segmentIdTop && segmentIdTop.segmentId)) || this.sha1(Buffer.concat([hash, Buffer.concat(publicKeys)]))

    return {
      hash,
      publicKeys,
      nextPublicKey: minNextPublicKey,
      previousHash: minPreviousHash,
      index: origin.index,
      segmentId: segId,
      topSegment: undefined,
      bottomSegment: undefined,
    }
  }

  private sha1(data: Buffer) {
    return crypto.createHash('sha1').update(data).digest()
  }

}
