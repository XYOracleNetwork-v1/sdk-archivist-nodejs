import { IXyoAboutMeConfig } from '../@types'
import { XyoAboutMeService } from '../../about-me'

export function instantiateAboutMe(config: IXyoAboutMeConfig, address: Buffer): XyoAboutMeService {
    // todo get public key here
  return new XyoAboutMeService(config.ip, config.boundWitnessServerPort, config.graphqlPort, config.version, address, config.name)
}
