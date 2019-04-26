/*
 * @Author: XY | The Findables Company <xyo-network>
 * @Date:   Monday, 3rd December 2018 11:21:44 am
 * @Email:  developer@xyfindables.com
 * @Filename: about-me-service.ts

 * @Last modified time: Thursday, 14th February 2019 12:09:10 pm
 * @License: All Rights Reserved
 * @Copyright: Copyright XY | The Findables Company
 */

import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class XyoAboutMeService extends XyoBase {

  constructor(
    private readonly ip: string,
    private readonly boundWitnessServerPort: number | undefined,
    private readonly graphqlPort: number | undefined,
    private readonly version: string,
    private readonly genesisPublicKey: Buffer,
    private readonly name: string
  ) {
    super()
  }

  public async getAboutMe(): Promise<any> {
    const me = {
      name: this.name,
      version: this.version,
      ip: this.ip,
      graphqlPort: this.graphqlPort,
      boundWitnessServerPort: this.boundWitnessServerPort,
      address:  this.genesisPublicKey.toString('hex'),
    }

    return me
  }
}
