/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { XyoBase } from '@xyo-network/sdk-base-nodejs'
import { XyoCollectorStats } from '../xyo-collecter-stats'
import fs, { writeFileSync, readFileSync } from 'fs'
import os from 'os'

const TIME_MINUTE = 1000 * 60
const TIME_HOUR = TIME_MINUTE * 60
const XYO_EPOCH = 1558462136666
const BUCKET_INV = 24 * 7

const snapshotStatePath = `${os.homedir()}/.config/xyo/snapshot.json`

export class XyoStatSnap extends XyoBase {
  private values: number[] = []
  private lastHour = 0
  private stats: XyoCollectorStats

  constructor(stats: XyoCollectorStats) {
    super()

    this.stats = stats

    setInterval(this.onMinutePass, TIME_MINUTE)
  }

  private onMinutePass = () => {
    const currentHour = this.getEpochHour()

    if (currentHour > this.lastHour) {
      this.logInfo(`Saving snapshot to hour: ${currentHour}`)
      const snapshot = this.stats.getAllTimeCollectedBoundWitnesses()
      this.saveRecord(snapshot)
      this.lastHour = currentHour
      this.commit()
    }
  }

  private saveRecord(n: number) {
    if (this.values.length >= BUCKET_INV) {
      this.values.pop()
    }

    this.values.unshift(n)
  }

  public getPastWeek(): number[] {
    return this.values
  }

  public commit() {
    writeFileSync(snapshotStatePath, JSON.stringify(this.values))
  }

  public restore() {
    try {
      this.values = JSON.parse(readFileSync(snapshotStatePath).toString('utf8'))
    } catch {
      this.commit()
    }
  }

  public getEpochHour() {
    const epoch = new Date().getTime()
    const epochDelta = epoch - XYO_EPOCH
    return Math.floor(epochDelta / TIME_HOUR) * TIME_HOUR
  }
}
