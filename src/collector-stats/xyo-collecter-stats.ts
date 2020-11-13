import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import fs from 'fs'
import os from 'os'

// todo move this into a plugin config
const statStorePth = `${os.homedir()}/.config/xyo/stats.json`

interface IXyoCollectorStatsState {
  allTimeBoundWitnesses: number
  allTimeCollectedBoundWitnesses: number
  lastBoundWitnessTime: number
}

export class XyoCollectorStats extends XyoBase {
  private since: number
  private lastBoundWitnessTime = -1
  private allTimeBoundWitnesses = 0
  private allTimeCollectedBoundWitnesses = 0
  private runTimeBoundWitnesses = 0
  private runTimeCollectedBoundWitnesses = 0

  constructor() {
    super()

    this.since = new Date().getTime()
  }

  public didBoundWitness(numberOfBridgedBlocks: number) {
    this.runTimeBoundWitnesses += 1
    this.runTimeCollectedBoundWitnesses += numberOfBridgedBlocks + 1

    this.allTimeBoundWitnesses += 1
    this.allTimeCollectedBoundWitnesses += numberOfBridgedBlocks + 1

    this.lastBoundWitnessTime = new Date().getTime()
  }

  public getMeanBoundWitnessPerMinuteRuntime(): number {
    const timeNow = new Date().getTime()
    const timeDelta = timeNow - this.since
    const mins = timeDelta / (1000 * 60)
    return this.runTimeBoundWitnesses / mins
  }

  public getMeanCollectedBoundWitnessPerMinuteRuntime(): number {
    const timeNow = new Date().getTime()
    const timeDelta = timeNow - this.since
    const mins = timeDelta / (1000 * 60)
    return this.runTimeCollectedBoundWitnesses / mins
  }

  public getLastBoundWitnessTime(): number {
    return this.lastBoundWitnessTime
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

    return (
      (this.runTimeCollectedBoundWitnesses - this.runTimeBoundWitnesses) /
      this.runTimeBoundWitnesses
    )
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

    return (
      (this.allTimeCollectedBoundWitnesses - this.allTimeBoundWitnesses) /
      this.allTimeBoundWitnesses
    )
  }

  public commit() {
    const state: IXyoCollectorStatsState = {
      allTimeBoundWitnesses: this.allTimeBoundWitnesses,
      allTimeCollectedBoundWitnesses: this.allTimeCollectedBoundWitnesses,
      lastBoundWitnessTime: this.lastBoundWitnessTime,
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
      this.lastBoundWitnessTime = state.lastBoundWitnessTime || -1
    } catch {
      // do nothing if file does not exist
    }
  }
}
