/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Friday, 13th November 2020 2:52:49 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { XyoArchivistLevelRepository } from './xyo-level-archivist-repository'

const createArchivistLevelDBRepository = () => {
  return new XyoArchivistLevelRepository()
}

export { createArchivistLevelDBRepository }
