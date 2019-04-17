/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 6:06:38 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IXyoHash } from '@xyo-network/hashing'
import { IXyoBoundWitness } from '@xyo-network/bound-witness'

export interface IXyoArchivistNetwork {
  startFindingPeers(): void
  getIntersections(
    partyOne: string[],
    partyTwo: string[],
    markers: string[],
    direction: 'FORWARD' | 'BACKWARD' | null
  ): Promise<IXyoHash[]>
  getBlock(hash: IXyoHash): Promise<IXyoBoundWitness|undefined>
}
