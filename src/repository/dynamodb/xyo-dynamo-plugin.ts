import { IXyoPlugin, IXyoGraphQlDelegate, IXyoBoundWitnessMutexDelegate } from '@xyo-network/sdk-base-nodejs'
import { XyoArchivistDynamoRepository } from './xyo-dynamo-archivist-repository'
import { IXyoArchivistRepository } from '../@types'

interface IXyoDynamoRepositoryConfig {
  tablePrefix?: string,
  region?: string
}

export class XyoArchivistDynamoRepositoryPlugin implements IXyoPlugin {
  public BLOCK_REPOSITORY: IXyoArchivistRepository | undefined

  public getName(): string {
    return 'archivist-dynamo-repository'
  }

  public getProvides(): string[] {
    return ['BLOCK_REPOSITORY']
  }
  public getPluginDependencies(): string[] {
    return []
  }

  public initialize(deps: { [key: string]: any; }, config: any): Promise<boolean> {
    const dbConfig = config as IXyoDynamoRepositoryConfig
    const db = new XyoArchivistDynamoRepository(dbConfig.tablePrefix, dbConfig.region)
    this.BLOCK_REPOSITORY = db
    return db.initialize()
  }

}

module.exports = new XyoArchivistDynamoRepositoryPlugin()
