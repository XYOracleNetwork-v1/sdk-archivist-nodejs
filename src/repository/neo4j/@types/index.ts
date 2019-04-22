import { IArchivistRepositoryConfig } from '../../'

/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Monday, 22nd April 2019 8:32:48 am
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

export interface INeo4jArchivistRepositoryConfig extends IArchivistRepositoryConfig {
  host: string
}
