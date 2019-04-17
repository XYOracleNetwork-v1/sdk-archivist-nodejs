/*
 * File: index.ts
 * Project: sdk-archivist-nodejs
 * File Created: Tuesday, 16th April 2019 9:19:05 am
 * Author: XYO Development Team (support@xyo.network)
 * -----
 * Last Modified: Tuesday, 16th April 2019 2:06:18 pm
 * Modified By: XYO Development Team (support@xyo.network>)
 * -----
 * Copyright 2017 - 2019 XY - The Persistent Company
 */

import { IArchivistRepositoryConfig } from "../../@types"

export interface ISqlArchivistRepositoryConfig extends IArchivistRepositoryConfig {
  host: string,
  user: string,
  password: string,
  database: string,
  port: number
}
