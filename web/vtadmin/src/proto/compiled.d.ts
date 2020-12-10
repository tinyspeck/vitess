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

        /** VRepStream stop_pos */
        stop_pos?: (string|null);

        /** VRepStream max_tps */
        max_tps?: (number|Long|null);

        /** VRepStream max_replication_lag */
        max_replication_lag?: (number|Long|null);

        /** VRepStream cell */
        cell?: (string|null);

        /** VRepStream tablet_types */
        tablet_types?: (string[]|null);

        /** VRepStream time_updated */
        time_updated?: (number|Long|null);

        /** VRepStream transaction_timestamp */
        transaction_timestamp?: (number|Long|null);

        /** VRepStream state */
        state?: (vreplication.VRepStreamState|null);

        /** VRepStream message */
        message?: (string|null);

        /** VRepStream db_name */
        db_name?: (string|null);

        /** VRepStream cluster */
        cluster?: (string|null);

        /** VRepStream keyspace */
        keyspace?: (string|null);

        /** VRepStream shard */
        shard?: (string|null);

        /** VRepStream tablet_alias */
        tablet_alias?: (string|null);
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

        /** VRepStream stop_pos. */
        public stop_pos: string;

        /** VRepStream max_tps. */
        public max_tps: (number|Long);

        /** VRepStream max_replication_lag. */
        public max_replication_lag: (number|Long);

        /** VRepStream cell. */
        public cell: string;

        /** VRepStream tablet_types. */
        public tablet_types: string[];

        /** VRepStream time_updated. */
        public time_updated: (number|Long);

        /** VRepStream transaction_timestamp. */
        public transaction_timestamp: (number|Long);

        /** VRepStream state. */
        public state: vreplication.VRepStreamState;

        /** VRepStream message. */
        public message: string;

        /** VRepStream db_name. */
        public db_name: string;

        /** VRepStream cluster. */
        public cluster: string;

        /** VRepStream keyspace. */
        public keyspace: string;

        /** VRepStream shard. */
        public shard: string;

        /** VRepStream tablet_alias. */
        public tablet_alias: string;

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
