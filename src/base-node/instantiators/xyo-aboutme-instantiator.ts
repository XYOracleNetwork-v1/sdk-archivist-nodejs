import { IXyoAboutMeConfig } from '../@types'
import { XyoAboutMeService } from '../../about-me'

export function instantiateAboutMe(config: IXyoAboutMeConfig): XyoAboutMeService {
    // todo get public key here
  return new XyoAboutMeService(config.ip, config.boundWitnessServerPort, config.graphqlPort, config.version, Buffer.alloc(0), config.name)
}
