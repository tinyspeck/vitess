import * as $protobuf from "protobufjs";
/** Namespace vreplication. */
export namespace vreplication {

    /** VRepStreamState enum. */
    enum VRepStreamState {
        RUNNING = 0,
        STOPPED = 1
    }

    /** Properties of a VRepStream. */
    interface IVRepStream {

        /** VRepStream id */
        id?: (number|Long|null);

        /** VRepStream workflow */
        workflow?: (string|null);

        /** VRepStream source */
        source?: (string|null);

        /** VRepStream pos */
        pos?: (string|null);

        /** VRepStream stopPos */
        stopPos?: (string|null);

        /** VRepStream maxTps */
        maxTps?: (number|Long|null);

        /** VRepStream maxReplicationLag */
        maxReplicationLag?: (number|Long|null);

        /** VRepStream cell */
        cell?: (string|null);

        /** VRepStream tabletTypes */
        tabletTypes?: (string[]|null);

        /** VRepStream timeUpdated */
        timeUpdated?: (number|Long|null);

        /** VRepStream transactionTimestamp */
        transactionTimestamp?: (number|Long|null);

        /** VRepStream state */
        state?: (vreplication.VRepStreamState|null);

        /** VRepStream message */
        message?: (string|null);

        /** VRepStream dbName */
        dbName?: (string|null);

        /** VRepStream cluster */
        cluster?: (string|null);

        /** VRepStream keyspace */
        keyspace?: (string|null);

        /** VRepStream shard */
        shard?: (string|null);

        /** VRepStream tabletAlias */
        tabletAlias?: (string|null);
    }

    /** Represents a VRepStream. */
    class VRepStream implements IVRepStream {

        /**
         * Constructs a new VRepStream.
         * @param [properties] Properties to set
         */
        constructor(properties?: vreplication.IVRepStream);

        /** VRepStream id. */
        public id: (number|Long);

        /** VRepStream workflow. */
        public workflow: string;

        /** VRepStream source. */
        public source: string;

        /** VRepStream pos. */
        public pos: string;

        /** VRepStream stopPos. */
        public stopPos: string;

        /** VRepStream maxTps. */
        public maxTps: (number|Long);

        /** VRepStream maxReplicationLag. */
        public maxReplicationLag: (number|Long);

        /** VRepStream cell. */
        public cell: string;

        /** VRepStream tabletTypes. */
        public tabletTypes: string[];

        /** VRepStream timeUpdated. */
        public timeUpdated: (number|Long);

        /** VRepStream transactionTimestamp. */
        public transactionTimestamp: (number|Long);

        /** VRepStream state. */
        public state: vreplication.VRepStreamState;

        /** VRepStream message. */
        public message: string;

        /** VRepStream dbName. */
        public dbName: string;

        /** VRepStream cluster. */
        public cluster: string;

        /** VRepStream keyspace. */
        public keyspace: string;

        /** VRepStream shard. */
        public shard: string;

        /** VRepStream tabletAlias. */
        public tabletAlias: string;

        /**
         * Creates a new VRepStream instance using the specified properties.
         * @param [properties] Properties to set
         * @returns VRepStream instance
         */
        public static create(properties?: vreplication.IVRepStream): vreplication.VRepStream;

        /**
         * Encodes the specified VRepStream message. Does not implicitly {@link vreplication.VRepStream.verify|verify} messages.
         * @param message VRepStream message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vreplication.IVRepStream, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified VRepStream message, length delimited. Does not implicitly {@link vreplication.VRepStream.verify|verify} messages.
         * @param message VRepStream message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vreplication.IVRepStream, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a VRepStream message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns VRepStream
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vreplication.VRepStream;

        /**
         * Decodes a VRepStream message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns VRepStream
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vreplication.VRepStream;

        /**
         * Verifies a VRepStream message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a VRepStream message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns VRepStream
         */
        public static fromObject(object: { [k: string]: any }): vreplication.VRepStream;

        /**
         * Creates a plain object from a VRepStream message. Also converts values to other types if specified.
         * @param message VRepStream
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vreplication.VRepStream, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this VRepStream to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
