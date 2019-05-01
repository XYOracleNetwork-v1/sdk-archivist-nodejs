export interface IBlockPermissionRequestResolver {
  requestPermissionForBlock(hash: Buffer, timeout: number): Promise<IRequestPermissionForBlockResult | undefined>
}

export interface IRequestPermissionForBlockResult {
  newBoundWitnessHash: Buffer
  partyIndex: number
  supportingData: {[hash: string]: Buffer}
}
