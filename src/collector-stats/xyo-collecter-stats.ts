import fs from 'fs'
import os from 'os'

// todo move this into a plugin config
const statStorePth = `${os.homedir()}/.config/xyo/stats.json`

interface IXyoCollectorStatsState {
  allTimeBoundWitnesses: number,
  allTimeCollectedBoundWitnesses: number
}

export class XyoCollectorStats {
  private allTimeBoundWitnesses = 0
  private allTimeCollectedBoundWitnesses = 0
  private runTimeBoundWitnesses = 0
  private runTimeCollectedBoundWitnesses = 0

  public didBoundWitness(numberOfBridgedBlocks: number) {
    this.runTimeBoundWitnesses += 1
    this.runTimeCollectedBoundWitnesses += numberOfBridgedBlocks + 1

    this.allTimeBoundWitnesses += 1
    this.allTimeCollectedBoundWitnesses += numberOfBridgedBlocks + 1
  }

  public getRunTimeBoundWitnesses(): number {
    return this.runTimeBoundWitnesses
  }

  public getRunTimeCollectedBoundWitnesses(): number {
    return this.runTimeCollectedBoundWitnesses
  }

  public getMeanBridgeBlockRuntime(): number {
    if (this.runTimeBoundWitnesses === 0) {
      return 0
    }

    return (this.runTimeCollectedBoundWitnesses - this.runTimeBoundWitnesses) / this.runTimeBoundWitnesses
  }

  public geAllTimeBoundWitnesses(): number {
    return this.allTimeBoundWitnesses
  }

  public getAllTimeCollectedBoundWitnesses(): number {
    return this.allTimeCollectedBoundWitnesses
  }

  public getMeanBridgeBlockAllTime(): number {
    if (this.allTimeBoundWitnesses === 0) {
      return 0
    }

    return (this.allTimeCollectedBoundWitnesses - this.allTimeBoundWitnesses) / this.allTimeBoundWitnesses
  }

  public commit() {
    const state: IXyoCollectorStatsState = {
      allTimeBoundWitnesses: this.allTimeBoundWitnesses,
      allTimeCollectedBoundWitnesses: this.allTimeCollectedBoundWitnesses
    }

    const stateString = JSON.stringify(state)
    fs.writeFileSync(statStorePth, stateString)
  }

  public restore() {
    try {
      const file = fs.readFileSync(statStorePth)
      const state = JSON.parse(file.toString('utf8')) as IXyoCollectorStatsState
      this.allTimeBoundWitnesses = state.allTimeBoundWitnesses
      this.allTimeCollectedBoundWitnesses = state.allTimeCollectedBoundWitnesses
    } catch {
          // do nothing if file does not exist
    }
  }
}
