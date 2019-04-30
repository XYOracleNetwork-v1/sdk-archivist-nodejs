import { IXyoArchivistRepositoryConfig } from '../@types'
import { IXyoArchivistRepository } from '../../repository'
import { XyoArchivistDynamoRepository } from '../../repository/dynamodb/xyo-dynamo-archivist-repository'

export function instantiateBlockRepository(config: IXyoArchivistRepositoryConfig): IXyoArchivistRepository {
  switch (config.platform) {
    case 'dynamodb': {
      const tablePrefix = config.config && config.config.tablePrefix
      const region = config.config && config.config.region
      return new XyoArchivistDynamoRepository(tablePrefix, region)
    }
    default: {
      throw new Error(`Unknown platform: ${config.platform}`)
    }
  }
}
