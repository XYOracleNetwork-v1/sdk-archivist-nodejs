
import { XyoBase } from '@xyo-network/sdk-base-nodejs'

export class XyoArchivistInfoResolver extends XyoBase  {

  public static query = 'archivist: ArchivistInfo!'
  public static type = `
    type ArchivistInfo {
        boundWitnessServerPort: Int!
    }
  `
  public static queryName = 'archivist'

  constructor(
    private readonly serverPort: number
  ) {
    super()
  }

  public async resolve(): Promise<any> {
    return {
      boundWitnessServerPort: this.serverPort
    }
  }
}
