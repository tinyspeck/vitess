import * as jspb from "google-protobuf"

export class VRepStream extends jspb.Message {
  getId(): number;
  setId(value: number): VRepStream;

  getWorkflow(): string;
  setWorkflow(value: string): VRepStream;

  getSource(): string;
  setSource(value: string): VRepStream;

  getPos(): string;
  setPos(value: string): VRepStream;

  getStopPos(): string;
  setStopPos(value: string): VRepStream;

  getMaxTps(): number;
  setMaxTps(value: number): VRepStream;

  getMaxReplicationLag(): number;
  setMaxReplicationLag(value: number): VRepStream;

  getCell(): string;
  setCell(value: string): VRepStream;

  getTabletTypesList(): Array<string>;
  setTabletTypesList(value: Array<string>): VRepStream;
  clearTabletTypesList(): VRepStream;
  addTabletTypes(value: string, index?: number): VRepStream;

  getTimeUpdated(): number;
  setTimeUpdated(value: number): VRepStream;

  getTransactionTimestamp(): number;
  setTransactionTimestamp(value: number): VRepStream;

  getState(): VRepStreamState;
  setState(value: VRepStreamState): VRepStream;

  getMessage(): string;
  setMessage(value: string): VRepStream;

  getDbName(): string;
  setDbName(value: string): VRepStream;

  getCluster(): string;
  setCluster(value: string): VRepStream;

  getKeyspace(): string;
  setKeyspace(value: string): VRepStream;

  getShard(): string;
  setShard(value: string): VRepStream;

  getTabletAlias(): string;
  setTabletAlias(value: string): VRepStream;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): VRepStream.AsObject;
  static toObject(includeInstance: boolean, msg: VRepStream): VRepStream.AsObject;
  static serializeBinaryToWriter(message: VRepStream, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): VRepStream;
  static deserializeBinaryFromReader(message: VRepStream, reader: jspb.BinaryReader): VRepStream;
}

export namespace VRepStream {
  export type AsObject = {
    id: number,
    workflow: string,
    source: string,
    pos: string,
    stopPos: string,
    maxTps: number,
    maxReplicationLag: number,
    cell: string,
    tabletTypesList: Array<string>,
    timeUpdated: number,
    transactionTimestamp: number,
    state: VRepStreamState,
    message: string,
    dbName: string,
    cluster: string,
    keyspace: string,
    shard: string,
    tabletAlias: string,
  }
}

export enum VRepStreamState { 
  RUNNING = 0,
  STOPPED = 1,
}
