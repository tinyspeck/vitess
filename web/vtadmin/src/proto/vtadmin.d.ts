import * as $protobuf from "protobufjs";
/** Namespace vtadmin. */
export namespace vtadmin {

    /** Represents a VTAdmin */
    class VTAdmin extends $protobuf.rpc.Service {

        /**
         * Constructs a new VTAdmin service.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         */
        constructor(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean);

        /**
         * Creates new VTAdmin service using the specified rpc implementation.
         * @param rpcImpl RPC implementation
         * @param [requestDelimited=false] Whether requests are length-delimited
         * @param [responseDelimited=false] Whether responses are length-delimited
         * @returns RPC service. Useful where requests and/or responses are streamed.
         */
        public static create(rpcImpl: $protobuf.RPCImpl, requestDelimited?: boolean, responseDelimited?: boolean): VTAdmin;

        /**
         * Calls GetGates.
         * @param request GetGatesRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and GetGatesResponse
         */
        public getGates(request: vtadmin.IGetGatesRequest, callback: vtadmin.VTAdmin.GetGatesCallback): void;

        /**
         * Calls GetGates.
         * @param request GetGatesRequest message or plain object
         * @returns Promise
         */
        public getGates(request: vtadmin.IGetGatesRequest): Promise<vtadmin.GetGatesResponse>;

        /**
         * Calls GetKeyspaces.
         * @param request GetKeyspacesRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and GetKeyspacesResponse
         */
        public getKeyspaces(request: vtadmin.IGetKeyspacesRequest, callback: vtadmin.VTAdmin.GetKeyspacesCallback): void;

        /**
         * Calls GetKeyspaces.
         * @param request GetKeyspacesRequest message or plain object
         * @returns Promise
         */
        public getKeyspaces(request: vtadmin.IGetKeyspacesRequest): Promise<vtadmin.GetKeyspacesResponse>;

        /**
         * Calls GetTablet.
         * @param request GetTabletRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and Tablet
         */
        public getTablet(request: vtadmin.IGetTabletRequest, callback: vtadmin.VTAdmin.GetTabletCallback): void;

        /**
         * Calls GetTablet.
         * @param request GetTabletRequest message or plain object
         * @returns Promise
         */
        public getTablet(request: vtadmin.IGetTabletRequest): Promise<vtadmin.Tablet>;

        /**
         * Calls GetTablets.
         * @param request GetTabletsRequest message or plain object
         * @param callback Node-style callback called with the error, if any, and GetTabletsResponse
         */
        public getTablets(request: vtadmin.IGetTabletsRequest, callback: vtadmin.VTAdmin.GetTabletsCallback): void;

        /**
         * Calls GetTablets.
         * @param request GetTabletsRequest message or plain object
         * @returns Promise
         */
        public getTablets(request: vtadmin.IGetTabletsRequest): Promise<vtadmin.GetTabletsResponse>;
    }

    namespace VTAdmin {

        /**
         * Callback as used by {@link vtadmin.VTAdmin#getGates}.
         * @param error Error, if any
         * @param [response] GetGatesResponse
         */
        type GetGatesCallback = (error: (Error|null), response?: vtadmin.GetGatesResponse) => void;

        /**
         * Callback as used by {@link vtadmin.VTAdmin#getKeyspaces}.
         * @param error Error, if any
         * @param [response] GetKeyspacesResponse
         */
        type GetKeyspacesCallback = (error: (Error|null), response?: vtadmin.GetKeyspacesResponse) => void;

        /**
         * Callback as used by {@link vtadmin.VTAdmin#getTablet}.
         * @param error Error, if any
         * @param [response] Tablet
         */
        type GetTabletCallback = (error: (Error|null), response?: vtadmin.Tablet) => void;

        /**
         * Callback as used by {@link vtadmin.VTAdmin#getTablets}.
         * @param error Error, if any
         * @param [response] GetTabletsResponse
         */
        type GetTabletsCallback = (error: (Error|null), response?: vtadmin.GetTabletsResponse) => void;
    }

    /** Properties of a Cluster. */
    interface ICluster {

        /** Cluster id */
        id?: (string|null);

        /** Cluster name */
        name?: (string|null);
    }

    /** Represents a Cluster. */
    class Cluster implements ICluster {

        /**
         * Constructs a new Cluster.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.ICluster);

        /** Cluster id. */
        public id: string;

        /** Cluster name. */
        public name: string;

        /**
         * Creates a new Cluster instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Cluster instance
         */
        public static create(properties?: vtadmin.ICluster): vtadmin.Cluster;

        /**
         * Encodes the specified Cluster message. Does not implicitly {@link vtadmin.Cluster.verify|verify} messages.
         * @param message Cluster message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.ICluster, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Cluster message, length delimited. Does not implicitly {@link vtadmin.Cluster.verify|verify} messages.
         * @param message Cluster message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.ICluster, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Cluster message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Cluster
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.Cluster;

        /**
         * Decodes a Cluster message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Cluster
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.Cluster;

        /**
         * Verifies a Cluster message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Cluster message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Cluster
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.Cluster;

        /**
         * Creates a plain object from a Cluster message. Also converts values to other types if specified.
         * @param message Cluster
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.Cluster, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Cluster to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Keyspace. */
    interface IKeyspace {

        /** Keyspace cluster */
        cluster?: (vtadmin.ICluster|null);

        /** Keyspace keyspace */
        keyspace?: (vtctldata.IKeyspace|null);
    }

    /** Represents a Keyspace. */
    class Keyspace implements IKeyspace {

        /**
         * Constructs a new Keyspace.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IKeyspace);

        /** Keyspace cluster. */
        public cluster?: (vtadmin.ICluster|null);

        /** Keyspace keyspace. */
        public keyspace?: (vtctldata.IKeyspace|null);

        /**
         * Creates a new Keyspace instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Keyspace instance
         */
        public static create(properties?: vtadmin.IKeyspace): vtadmin.Keyspace;

        /**
         * Encodes the specified Keyspace message. Does not implicitly {@link vtadmin.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Keyspace message, length delimited. Does not implicitly {@link vtadmin.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Keyspace message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.Keyspace;

        /**
         * Decodes a Keyspace message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.Keyspace;

        /**
         * Verifies a Keyspace message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Keyspace message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Keyspace
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.Keyspace;

        /**
         * Creates a plain object from a Keyspace message. Also converts values to other types if specified.
         * @param message Keyspace
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.Keyspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Keyspace to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Tablet. */
    interface ITablet {

        /** Tablet cluster */
        cluster?: (vtadmin.ICluster|null);

        /** Tablet tablet */
        tablet?: (topodata.ITablet|null);

        /** Tablet state */
        state?: (vtadmin.Tablet.ServingState|null);
    }

    /** Represents a Tablet. */
    class Tablet implements ITablet {

        /**
         * Constructs a new Tablet.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.ITablet);

        /** Tablet cluster. */
        public cluster?: (vtadmin.ICluster|null);

        /** Tablet tablet. */
        public tablet?: (topodata.ITablet|null);

        /** Tablet state. */
        public state: vtadmin.Tablet.ServingState;

        /**
         * Creates a new Tablet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Tablet instance
         */
        public static create(properties?: vtadmin.ITablet): vtadmin.Tablet;

        /**
         * Encodes the specified Tablet message. Does not implicitly {@link vtadmin.Tablet.verify|verify} messages.
         * @param message Tablet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.ITablet, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Tablet message, length delimited. Does not implicitly {@link vtadmin.Tablet.verify|verify} messages.
         * @param message Tablet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.ITablet, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Tablet message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Tablet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.Tablet;

        /**
         * Decodes a Tablet message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Tablet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.Tablet;

        /**
         * Verifies a Tablet message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Tablet message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Tablet
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.Tablet;

        /**
         * Creates a plain object from a Tablet message. Also converts values to other types if specified.
         * @param message Tablet
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.Tablet, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Tablet to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Tablet {

        /** ServingState enum. */
        enum ServingState {
            UNKNOWN = 0,
            SERVING = 1,
            NOT_SERVING = 2
        }
    }

    /** Properties of a Vtctld. */
    interface IVtctld {

        /** Vtctld hostname */
        hostname?: (string|null);

        /** Vtctld cluster */
        cluster?: (vtadmin.ICluster|null);
    }

    /** Represents a Vtctld. */
    class Vtctld implements IVtctld {

        /**
         * Constructs a new Vtctld.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IVtctld);

        /** Vtctld hostname. */
        public hostname: string;

        /** Vtctld cluster. */
        public cluster?: (vtadmin.ICluster|null);

        /**
         * Creates a new Vtctld instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Vtctld instance
         */
        public static create(properties?: vtadmin.IVtctld): vtadmin.Vtctld;

        /**
         * Encodes the specified Vtctld message. Does not implicitly {@link vtadmin.Vtctld.verify|verify} messages.
         * @param message Vtctld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IVtctld, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Vtctld message, length delimited. Does not implicitly {@link vtadmin.Vtctld.verify|verify} messages.
         * @param message Vtctld message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IVtctld, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Vtctld message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Vtctld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.Vtctld;

        /**
         * Decodes a Vtctld message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Vtctld
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.Vtctld;

        /**
         * Verifies a Vtctld message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Vtctld message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Vtctld
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.Vtctld;

        /**
         * Creates a plain object from a Vtctld message. Also converts values to other types if specified.
         * @param message Vtctld
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.Vtctld, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Vtctld to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a VTGate. */
    interface IVTGate {

        /** VTGate hostname */
        hostname?: (string|null);

        /** VTGate pool */
        pool?: (string|null);

        /** VTGate cell */
        cell?: (string|null);

        /** VTGate cluster */
        cluster?: (vtadmin.ICluster|null);

        /** VTGate keyspaces */
        keyspaces?: (string[]|null);
    }

    /** Represents a VTGate. */
    class VTGate implements IVTGate {

        /**
         * Constructs a new VTGate.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IVTGate);

        /** VTGate hostname. */
        public hostname: string;

        /** VTGate pool. */
        public pool: string;

        /** VTGate cell. */
        public cell: string;

        /** VTGate cluster. */
        public cluster?: (vtadmin.ICluster|null);

        /** VTGate keyspaces. */
        public keyspaces: string[];

        /**
         * Creates a new VTGate instance using the specified properties.
         * @param [properties] Properties to set
         * @returns VTGate instance
         */
        public static create(properties?: vtadmin.IVTGate): vtadmin.VTGate;

        /**
         * Encodes the specified VTGate message. Does not implicitly {@link vtadmin.VTGate.verify|verify} messages.
         * @param message VTGate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IVTGate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified VTGate message, length delimited. Does not implicitly {@link vtadmin.VTGate.verify|verify} messages.
         * @param message VTGate message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IVTGate, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a VTGate message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns VTGate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.VTGate;

        /**
         * Decodes a VTGate message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns VTGate
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.VTGate;

        /**
         * Verifies a VTGate message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a VTGate message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns VTGate
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.VTGate;

        /**
         * Creates a plain object from a VTGate message. Also converts values to other types if specified.
         * @param message VTGate
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.VTGate, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this VTGate to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetGatesRequest. */
    interface IGetGatesRequest {

        /** GetGatesRequest cluster_ids */
        cluster_ids?: (string[]|null);
    }

    /** Represents a GetGatesRequest. */
    class GetGatesRequest implements IGetGatesRequest {

        /**
         * Constructs a new GetGatesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetGatesRequest);

        /** GetGatesRequest cluster_ids. */
        public cluster_ids: string[];

        /**
         * Creates a new GetGatesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetGatesRequest instance
         */
        public static create(properties?: vtadmin.IGetGatesRequest): vtadmin.GetGatesRequest;

        /**
         * Encodes the specified GetGatesRequest message. Does not implicitly {@link vtadmin.GetGatesRequest.verify|verify} messages.
         * @param message GetGatesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetGatesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetGatesRequest message, length delimited. Does not implicitly {@link vtadmin.GetGatesRequest.verify|verify} messages.
         * @param message GetGatesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetGatesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetGatesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetGatesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetGatesRequest;

        /**
         * Decodes a GetGatesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetGatesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetGatesRequest;

        /**
         * Verifies a GetGatesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetGatesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetGatesRequest
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetGatesRequest;

        /**
         * Creates a plain object from a GetGatesRequest message. Also converts values to other types if specified.
         * @param message GetGatesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetGatesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetGatesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetGatesResponse. */
    interface IGetGatesResponse {

        /** GetGatesResponse gates */
        gates?: (vtadmin.IVTGate[]|null);
    }

    /** Represents a GetGatesResponse. */
    class GetGatesResponse implements IGetGatesResponse {

        /**
         * Constructs a new GetGatesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetGatesResponse);

        /** GetGatesResponse gates. */
        public gates: vtadmin.IVTGate[];

        /**
         * Creates a new GetGatesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetGatesResponse instance
         */
        public static create(properties?: vtadmin.IGetGatesResponse): vtadmin.GetGatesResponse;

        /**
         * Encodes the specified GetGatesResponse message. Does not implicitly {@link vtadmin.GetGatesResponse.verify|verify} messages.
         * @param message GetGatesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetGatesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetGatesResponse message, length delimited. Does not implicitly {@link vtadmin.GetGatesResponse.verify|verify} messages.
         * @param message GetGatesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetGatesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetGatesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetGatesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetGatesResponse;

        /**
         * Decodes a GetGatesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetGatesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetGatesResponse;

        /**
         * Verifies a GetGatesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetGatesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetGatesResponse
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetGatesResponse;

        /**
         * Creates a plain object from a GetGatesResponse message. Also converts values to other types if specified.
         * @param message GetGatesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetGatesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetGatesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspacesRequest. */
    interface IGetKeyspacesRequest {

        /** GetKeyspacesRequest cluster_ids */
        cluster_ids?: (string[]|null);
    }

    /** Represents a GetKeyspacesRequest. */
    class GetKeyspacesRequest implements IGetKeyspacesRequest {

        /**
         * Constructs a new GetKeyspacesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetKeyspacesRequest);

        /** GetKeyspacesRequest cluster_ids. */
        public cluster_ids: string[];

        /**
         * Creates a new GetKeyspacesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspacesRequest instance
         */
        public static create(properties?: vtadmin.IGetKeyspacesRequest): vtadmin.GetKeyspacesRequest;

        /**
         * Encodes the specified GetKeyspacesRequest message. Does not implicitly {@link vtadmin.GetKeyspacesRequest.verify|verify} messages.
         * @param message GetKeyspacesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetKeyspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspacesRequest message, length delimited. Does not implicitly {@link vtadmin.GetKeyspacesRequest.verify|verify} messages.
         * @param message GetKeyspacesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetKeyspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspacesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspacesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetKeyspacesRequest;

        /**
         * Decodes a GetKeyspacesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspacesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetKeyspacesRequest;

        /**
         * Verifies a GetKeyspacesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspacesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspacesRequest
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetKeyspacesRequest;

        /**
         * Creates a plain object from a GetKeyspacesRequest message. Also converts values to other types if specified.
         * @param message GetKeyspacesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetKeyspacesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspacesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspacesResponse. */
    interface IGetKeyspacesResponse {

        /** GetKeyspacesResponse keyspaces */
        keyspaces?: (vtadmin.IKeyspace[]|null);
    }

    /** Represents a GetKeyspacesResponse. */
    class GetKeyspacesResponse implements IGetKeyspacesResponse {

        /**
         * Constructs a new GetKeyspacesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetKeyspacesResponse);

        /** GetKeyspacesResponse keyspaces. */
        public keyspaces: vtadmin.IKeyspace[];

        /**
         * Creates a new GetKeyspacesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspacesResponse instance
         */
        public static create(properties?: vtadmin.IGetKeyspacesResponse): vtadmin.GetKeyspacesResponse;

        /**
         * Encodes the specified GetKeyspacesResponse message. Does not implicitly {@link vtadmin.GetKeyspacesResponse.verify|verify} messages.
         * @param message GetKeyspacesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetKeyspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspacesResponse message, length delimited. Does not implicitly {@link vtadmin.GetKeyspacesResponse.verify|verify} messages.
         * @param message GetKeyspacesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetKeyspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspacesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspacesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetKeyspacesResponse;

        /**
         * Decodes a GetKeyspacesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspacesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetKeyspacesResponse;

        /**
         * Verifies a GetKeyspacesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspacesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspacesResponse
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetKeyspacesResponse;

        /**
         * Creates a plain object from a GetKeyspacesResponse message. Also converts values to other types if specified.
         * @param message GetKeyspacesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetKeyspacesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspacesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetTabletRequest. */
    interface IGetTabletRequest {

        /** GetTabletRequest hostname */
        hostname?: (string|null);

        /** GetTabletRequest cluster_ids */
        cluster_ids?: (string[]|null);
    }

    /** Represents a GetTabletRequest. */
    class GetTabletRequest implements IGetTabletRequest {

        /**
         * Constructs a new GetTabletRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetTabletRequest);

        /** GetTabletRequest hostname. */
        public hostname: string;

        /** GetTabletRequest cluster_ids. */
        public cluster_ids: string[];

        /**
         * Creates a new GetTabletRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetTabletRequest instance
         */
        public static create(properties?: vtadmin.IGetTabletRequest): vtadmin.GetTabletRequest;

        /**
         * Encodes the specified GetTabletRequest message. Does not implicitly {@link vtadmin.GetTabletRequest.verify|verify} messages.
         * @param message GetTabletRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetTabletRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetTabletRequest message, length delimited. Does not implicitly {@link vtadmin.GetTabletRequest.verify|verify} messages.
         * @param message GetTabletRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetTabletRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetTabletRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetTabletRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetTabletRequest;

        /**
         * Decodes a GetTabletRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetTabletRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetTabletRequest;

        /**
         * Verifies a GetTabletRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetTabletRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetTabletRequest
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetTabletRequest;

        /**
         * Creates a plain object from a GetTabletRequest message. Also converts values to other types if specified.
         * @param message GetTabletRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetTabletRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetTabletRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetTabletsRequest. */
    interface IGetTabletsRequest {

        /** GetTabletsRequest cluster_ids */
        cluster_ids?: (string[]|null);
    }

    /** Represents a GetTabletsRequest. */
    class GetTabletsRequest implements IGetTabletsRequest {

        /**
         * Constructs a new GetTabletsRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetTabletsRequest);

        /** GetTabletsRequest cluster_ids. */
        public cluster_ids: string[];

        /**
         * Creates a new GetTabletsRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetTabletsRequest instance
         */
        public static create(properties?: vtadmin.IGetTabletsRequest): vtadmin.GetTabletsRequest;

        /**
         * Encodes the specified GetTabletsRequest message. Does not implicitly {@link vtadmin.GetTabletsRequest.verify|verify} messages.
         * @param message GetTabletsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetTabletsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetTabletsRequest message, length delimited. Does not implicitly {@link vtadmin.GetTabletsRequest.verify|verify} messages.
         * @param message GetTabletsRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetTabletsRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetTabletsRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetTabletsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetTabletsRequest;

        /**
         * Decodes a GetTabletsRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetTabletsRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetTabletsRequest;

        /**
         * Verifies a GetTabletsRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetTabletsRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetTabletsRequest
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetTabletsRequest;

        /**
         * Creates a plain object from a GetTabletsRequest message. Also converts values to other types if specified.
         * @param message GetTabletsRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetTabletsRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetTabletsRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetTabletsResponse. */
    interface IGetTabletsResponse {

        /** GetTabletsResponse tablets */
        tablets?: (vtadmin.ITablet[]|null);
    }

    /** Represents a GetTabletsResponse. */
    class GetTabletsResponse implements IGetTabletsResponse {

        /**
         * Constructs a new GetTabletsResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtadmin.IGetTabletsResponse);

        /** GetTabletsResponse tablets. */
        public tablets: vtadmin.ITablet[];

        /**
         * Creates a new GetTabletsResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetTabletsResponse instance
         */
        public static create(properties?: vtadmin.IGetTabletsResponse): vtadmin.GetTabletsResponse;

        /**
         * Encodes the specified GetTabletsResponse message. Does not implicitly {@link vtadmin.GetTabletsResponse.verify|verify} messages.
         * @param message GetTabletsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtadmin.IGetTabletsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetTabletsResponse message, length delimited. Does not implicitly {@link vtadmin.GetTabletsResponse.verify|verify} messages.
         * @param message GetTabletsResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtadmin.IGetTabletsResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetTabletsResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetTabletsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtadmin.GetTabletsResponse;

        /**
         * Decodes a GetTabletsResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetTabletsResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtadmin.GetTabletsResponse;

        /**
         * Verifies a GetTabletsResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetTabletsResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetTabletsResponse
         */
        public static fromObject(object: { [k: string]: any }): vtadmin.GetTabletsResponse;

        /**
         * Creates a plain object from a GetTabletsResponse message. Also converts values to other types if specified.
         * @param message GetTabletsResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtadmin.GetTabletsResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetTabletsResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Namespace topodata. */
export namespace topodata {

    /** Properties of a KeyRange. */
    interface IKeyRange {

        /** KeyRange start */
        start?: (Uint8Array|null);

        /** KeyRange end */
        end?: (Uint8Array|null);
    }

    /** Represents a KeyRange. */
    class KeyRange implements IKeyRange {

        /**
         * Constructs a new KeyRange.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IKeyRange);

        /** KeyRange start. */
        public start: Uint8Array;

        /** KeyRange end. */
        public end: Uint8Array;

        /**
         * Creates a new KeyRange instance using the specified properties.
         * @param [properties] Properties to set
         * @returns KeyRange instance
         */
        public static create(properties?: topodata.IKeyRange): topodata.KeyRange;

        /**
         * Encodes the specified KeyRange message. Does not implicitly {@link topodata.KeyRange.verify|verify} messages.
         * @param message KeyRange message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IKeyRange, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified KeyRange message, length delimited. Does not implicitly {@link topodata.KeyRange.verify|verify} messages.
         * @param message KeyRange message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IKeyRange, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a KeyRange message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns KeyRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.KeyRange;

        /**
         * Decodes a KeyRange message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns KeyRange
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.KeyRange;

        /**
         * Verifies a KeyRange message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a KeyRange message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns KeyRange
         */
        public static fromObject(object: { [k: string]: any }): topodata.KeyRange;

        /**
         * Creates a plain object from a KeyRange message. Also converts values to other types if specified.
         * @param message KeyRange
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.KeyRange, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this KeyRange to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** KeyspaceType enum. */
    enum KeyspaceType {
        NORMAL = 0,
        SNAPSHOT = 1
    }

    /** KeyspaceIdType enum. */
    enum KeyspaceIdType {
        UNSET = 0,
        UINT64 = 1,
        BYTES = 2
    }

    /** Properties of a TabletAlias. */
    interface ITabletAlias {

        /** TabletAlias cell */
        cell?: (string|null);

        /** TabletAlias uid */
        uid?: (number|null);
    }

    /** Represents a TabletAlias. */
    class TabletAlias implements ITabletAlias {

        /**
         * Constructs a new TabletAlias.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.ITabletAlias);

        /** TabletAlias cell. */
        public cell: string;

        /** TabletAlias uid. */
        public uid: number;

        /**
         * Creates a new TabletAlias instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TabletAlias instance
         */
        public static create(properties?: topodata.ITabletAlias): topodata.TabletAlias;

        /**
         * Encodes the specified TabletAlias message. Does not implicitly {@link topodata.TabletAlias.verify|verify} messages.
         * @param message TabletAlias message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.ITabletAlias, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TabletAlias message, length delimited. Does not implicitly {@link topodata.TabletAlias.verify|verify} messages.
         * @param message TabletAlias message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.ITabletAlias, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TabletAlias message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TabletAlias
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.TabletAlias;

        /**
         * Decodes a TabletAlias message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TabletAlias
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.TabletAlias;

        /**
         * Verifies a TabletAlias message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TabletAlias message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TabletAlias
         */
        public static fromObject(object: { [k: string]: any }): topodata.TabletAlias;

        /**
         * Creates a plain object from a TabletAlias message. Also converts values to other types if specified.
         * @param message TabletAlias
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.TabletAlias, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TabletAlias to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** TabletType enum. */
    enum TabletType {
        UNKNOWN = 0,
        MASTER = 1,
        REPLICA = 2,
        RDONLY = 3,
        BATCH = 3,
        SPARE = 4,
        EXPERIMENTAL = 5,
        BACKUP = 6,
        RESTORE = 7,
        DRAINED = 8
    }

    /** Properties of a Tablet. */
    interface ITablet {

        /** Tablet alias */
        alias?: (topodata.ITabletAlias|null);

        /** Tablet hostname */
        hostname?: (string|null);

        /** Tablet port_map */
        port_map?: ({ [k: string]: number }|null);

        /** Tablet keyspace */
        keyspace?: (string|null);

        /** Tablet shard */
        shard?: (string|null);

        /** Tablet key_range */
        key_range?: (topodata.IKeyRange|null);

        /** Tablet type */
        type?: (topodata.TabletType|null);

        /** Tablet db_name_override */
        db_name_override?: (string|null);

        /** Tablet tags */
        tags?: ({ [k: string]: string }|null);

        /** Tablet mysql_hostname */
        mysql_hostname?: (string|null);

        /** Tablet mysql_port */
        mysql_port?: (number|null);

        /** Tablet master_term_start_time */
        master_term_start_time?: (vttime.ITime|null);
    }

    /** Represents a Tablet. */
    class Tablet implements ITablet {

        /**
         * Constructs a new Tablet.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.ITablet);

        /** Tablet alias. */
        public alias?: (topodata.ITabletAlias|null);

        /** Tablet hostname. */
        public hostname: string;

        /** Tablet port_map. */
        public port_map: { [k: string]: number };

        /** Tablet keyspace. */
        public keyspace: string;

        /** Tablet shard. */
        public shard: string;

        /** Tablet key_range. */
        public key_range?: (topodata.IKeyRange|null);

        /** Tablet type. */
        public type: topodata.TabletType;

        /** Tablet db_name_override. */
        public db_name_override: string;

        /** Tablet tags. */
        public tags: { [k: string]: string };

        /** Tablet mysql_hostname. */
        public mysql_hostname: string;

        /** Tablet mysql_port. */
        public mysql_port: number;

        /** Tablet master_term_start_time. */
        public master_term_start_time?: (vttime.ITime|null);

        /**
         * Creates a new Tablet instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Tablet instance
         */
        public static create(properties?: topodata.ITablet): topodata.Tablet;

        /**
         * Encodes the specified Tablet message. Does not implicitly {@link topodata.Tablet.verify|verify} messages.
         * @param message Tablet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.ITablet, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Tablet message, length delimited. Does not implicitly {@link topodata.Tablet.verify|verify} messages.
         * @param message Tablet message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.ITablet, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Tablet message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Tablet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Tablet;

        /**
         * Decodes a Tablet message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Tablet
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Tablet;

        /**
         * Verifies a Tablet message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Tablet message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Tablet
         */
        public static fromObject(object: { [k: string]: any }): topodata.Tablet;

        /**
         * Creates a plain object from a Tablet message. Also converts values to other types if specified.
         * @param message Tablet
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.Tablet, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Tablet to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Shard. */
    interface IShard {

        /** Shard master_alias */
        master_alias?: (topodata.ITabletAlias|null);

        /** Shard master_term_start_time */
        master_term_start_time?: (vttime.ITime|null);

        /** Shard key_range */
        key_range?: (topodata.IKeyRange|null);

        /** Shard served_types */
        served_types?: (topodata.Shard.IServedType[]|null);

        /** Shard source_shards */
        source_shards?: (topodata.Shard.ISourceShard[]|null);

        /** Shard tablet_controls */
        tablet_controls?: (topodata.Shard.ITabletControl[]|null);

        /** Shard is_master_serving */
        is_master_serving?: (boolean|null);
    }

    /** Represents a Shard. */
    class Shard implements IShard {

        /**
         * Constructs a new Shard.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IShard);

        /** Shard master_alias. */
        public master_alias?: (topodata.ITabletAlias|null);

        /** Shard master_term_start_time. */
        public master_term_start_time?: (vttime.ITime|null);

        /** Shard key_range. */
        public key_range?: (topodata.IKeyRange|null);

        /** Shard served_types. */
        public served_types: topodata.Shard.IServedType[];

        /** Shard source_shards. */
        public source_shards: topodata.Shard.ISourceShard[];

        /** Shard tablet_controls. */
        public tablet_controls: topodata.Shard.ITabletControl[];

        /** Shard is_master_serving. */
        public is_master_serving: boolean;

        /**
         * Creates a new Shard instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Shard instance
         */
        public static create(properties?: topodata.IShard): topodata.Shard;

        /**
         * Encodes the specified Shard message. Does not implicitly {@link topodata.Shard.verify|verify} messages.
         * @param message Shard message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IShard, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Shard message, length delimited. Does not implicitly {@link topodata.Shard.verify|verify} messages.
         * @param message Shard message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IShard, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Shard message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Shard
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Shard;

        /**
         * Decodes a Shard message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Shard
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Shard;

        /**
         * Verifies a Shard message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Shard message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Shard
         */
        public static fromObject(object: { [k: string]: any }): topodata.Shard;

        /**
         * Creates a plain object from a Shard message. Also converts values to other types if specified.
         * @param message Shard
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.Shard, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Shard to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Shard {

        /** Properties of a ServedType. */
        interface IServedType {

            /** ServedType tablet_type */
            tablet_type?: (topodata.TabletType|null);

            /** ServedType cells */
            cells?: (string[]|null);
        }

        /** Represents a ServedType. */
        class ServedType implements IServedType {

            /**
             * Constructs a new ServedType.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.Shard.IServedType);

            /** ServedType tablet_type. */
            public tablet_type: topodata.TabletType;

            /** ServedType cells. */
            public cells: string[];

            /**
             * Creates a new ServedType instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServedType instance
             */
            public static create(properties?: topodata.Shard.IServedType): topodata.Shard.ServedType;

            /**
             * Encodes the specified ServedType message. Does not implicitly {@link topodata.Shard.ServedType.verify|verify} messages.
             * @param message ServedType message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.Shard.IServedType, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServedType message, length delimited. Does not implicitly {@link topodata.Shard.ServedType.verify|verify} messages.
             * @param message ServedType message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.Shard.IServedType, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServedType message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServedType
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Shard.ServedType;

            /**
             * Decodes a ServedType message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServedType
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Shard.ServedType;

            /**
             * Verifies a ServedType message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServedType message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServedType
             */
            public static fromObject(object: { [k: string]: any }): topodata.Shard.ServedType;

            /**
             * Creates a plain object from a ServedType message. Also converts values to other types if specified.
             * @param message ServedType
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.Shard.ServedType, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServedType to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a SourceShard. */
        interface ISourceShard {

            /** SourceShard uid */
            uid?: (number|null);

            /** SourceShard keyspace */
            keyspace?: (string|null);

            /** SourceShard shard */
            shard?: (string|null);

            /** SourceShard key_range */
            key_range?: (topodata.IKeyRange|null);

            /** SourceShard tables */
            tables?: (string[]|null);
        }

        /** Represents a SourceShard. */
        class SourceShard implements ISourceShard {

            /**
             * Constructs a new SourceShard.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.Shard.ISourceShard);

            /** SourceShard uid. */
            public uid: number;

            /** SourceShard keyspace. */
            public keyspace: string;

            /** SourceShard shard. */
            public shard: string;

            /** SourceShard key_range. */
            public key_range?: (topodata.IKeyRange|null);

            /** SourceShard tables. */
            public tables: string[];

            /**
             * Creates a new SourceShard instance using the specified properties.
             * @param [properties] Properties to set
             * @returns SourceShard instance
             */
            public static create(properties?: topodata.Shard.ISourceShard): topodata.Shard.SourceShard;

            /**
             * Encodes the specified SourceShard message. Does not implicitly {@link topodata.Shard.SourceShard.verify|verify} messages.
             * @param message SourceShard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.Shard.ISourceShard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified SourceShard message, length delimited. Does not implicitly {@link topodata.Shard.SourceShard.verify|verify} messages.
             * @param message SourceShard message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.Shard.ISourceShard, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a SourceShard message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns SourceShard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Shard.SourceShard;

            /**
             * Decodes a SourceShard message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns SourceShard
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Shard.SourceShard;

            /**
             * Verifies a SourceShard message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a SourceShard message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns SourceShard
             */
            public static fromObject(object: { [k: string]: any }): topodata.Shard.SourceShard;

            /**
             * Creates a plain object from a SourceShard message. Also converts values to other types if specified.
             * @param message SourceShard
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.Shard.SourceShard, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this SourceShard to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a TabletControl. */
        interface ITabletControl {

            /** TabletControl tablet_type */
            tablet_type?: (topodata.TabletType|null);

            /** TabletControl cells */
            cells?: (string[]|null);

            /** TabletControl blacklisted_tables */
            blacklisted_tables?: (string[]|null);

            /** TabletControl frozen */
            frozen?: (boolean|null);
        }

        /** Represents a TabletControl. */
        class TabletControl implements ITabletControl {

            /**
             * Constructs a new TabletControl.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.Shard.ITabletControl);

            /** TabletControl tablet_type. */
            public tablet_type: topodata.TabletType;

            /** TabletControl cells. */
            public cells: string[];

            /** TabletControl blacklisted_tables. */
            public blacklisted_tables: string[];

            /** TabletControl frozen. */
            public frozen: boolean;

            /**
             * Creates a new TabletControl instance using the specified properties.
             * @param [properties] Properties to set
             * @returns TabletControl instance
             */
            public static create(properties?: topodata.Shard.ITabletControl): topodata.Shard.TabletControl;

            /**
             * Encodes the specified TabletControl message. Does not implicitly {@link topodata.Shard.TabletControl.verify|verify} messages.
             * @param message TabletControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.Shard.ITabletControl, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified TabletControl message, length delimited. Does not implicitly {@link topodata.Shard.TabletControl.verify|verify} messages.
             * @param message TabletControl message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.Shard.ITabletControl, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a TabletControl message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns TabletControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Shard.TabletControl;

            /**
             * Decodes a TabletControl message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns TabletControl
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Shard.TabletControl;

            /**
             * Verifies a TabletControl message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a TabletControl message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns TabletControl
             */
            public static fromObject(object: { [k: string]: any }): topodata.Shard.TabletControl;

            /**
             * Creates a plain object from a TabletControl message. Also converts values to other types if specified.
             * @param message TabletControl
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.Shard.TabletControl, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this TabletControl to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a Keyspace. */
    interface IKeyspace {

        /** Keyspace sharding_column_name */
        sharding_column_name?: (string|null);

        /** Keyspace sharding_column_type */
        sharding_column_type?: (topodata.KeyspaceIdType|null);

        /** Keyspace served_froms */
        served_froms?: (topodata.Keyspace.IServedFrom[]|null);

        /** Keyspace keyspace_type */
        keyspace_type?: (topodata.KeyspaceType|null);

        /** Keyspace base_keyspace */
        base_keyspace?: (string|null);

        /** Keyspace snapshot_time */
        snapshot_time?: (vttime.ITime|null);
    }

    /** Represents a Keyspace. */
    class Keyspace implements IKeyspace {

        /**
         * Constructs a new Keyspace.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IKeyspace);

        /** Keyspace sharding_column_name. */
        public sharding_column_name: string;

        /** Keyspace sharding_column_type. */
        public sharding_column_type: topodata.KeyspaceIdType;

        /** Keyspace served_froms. */
        public served_froms: topodata.Keyspace.IServedFrom[];

        /** Keyspace keyspace_type. */
        public keyspace_type: topodata.KeyspaceType;

        /** Keyspace base_keyspace. */
        public base_keyspace: string;

        /** Keyspace snapshot_time. */
        public snapshot_time?: (vttime.ITime|null);

        /**
         * Creates a new Keyspace instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Keyspace instance
         */
        public static create(properties?: topodata.IKeyspace): topodata.Keyspace;

        /**
         * Encodes the specified Keyspace message. Does not implicitly {@link topodata.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Keyspace message, length delimited. Does not implicitly {@link topodata.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Keyspace message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Keyspace;

        /**
         * Decodes a Keyspace message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Keyspace;

        /**
         * Verifies a Keyspace message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Keyspace message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Keyspace
         */
        public static fromObject(object: { [k: string]: any }): topodata.Keyspace;

        /**
         * Creates a plain object from a Keyspace message. Also converts values to other types if specified.
         * @param message Keyspace
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.Keyspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Keyspace to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace Keyspace {

        /** Properties of a ServedFrom. */
        interface IServedFrom {

            /** ServedFrom tablet_type */
            tablet_type?: (topodata.TabletType|null);

            /** ServedFrom cells */
            cells?: (string[]|null);

            /** ServedFrom keyspace */
            keyspace?: (string|null);
        }

        /** Represents a ServedFrom. */
        class ServedFrom implements IServedFrom {

            /**
             * Constructs a new ServedFrom.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.Keyspace.IServedFrom);

            /** ServedFrom tablet_type. */
            public tablet_type: topodata.TabletType;

            /** ServedFrom cells. */
            public cells: string[];

            /** ServedFrom keyspace. */
            public keyspace: string;

            /**
             * Creates a new ServedFrom instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServedFrom instance
             */
            public static create(properties?: topodata.Keyspace.IServedFrom): topodata.Keyspace.ServedFrom;

            /**
             * Encodes the specified ServedFrom message. Does not implicitly {@link topodata.Keyspace.ServedFrom.verify|verify} messages.
             * @param message ServedFrom message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.Keyspace.IServedFrom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServedFrom message, length delimited. Does not implicitly {@link topodata.Keyspace.ServedFrom.verify|verify} messages.
             * @param message ServedFrom message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.Keyspace.IServedFrom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServedFrom message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServedFrom
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.Keyspace.ServedFrom;

            /**
             * Decodes a ServedFrom message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServedFrom
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.Keyspace.ServedFrom;

            /**
             * Verifies a ServedFrom message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServedFrom message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServedFrom
             */
            public static fromObject(object: { [k: string]: any }): topodata.Keyspace.ServedFrom;

            /**
             * Creates a plain object from a ServedFrom message. Also converts values to other types if specified.
             * @param message ServedFrom
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.Keyspace.ServedFrom, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServedFrom to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a ShardReplication. */
    interface IShardReplication {

        /** ShardReplication nodes */
        nodes?: (topodata.ShardReplication.INode[]|null);
    }

    /** Represents a ShardReplication. */
    class ShardReplication implements IShardReplication {

        /**
         * Constructs a new ShardReplication.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IShardReplication);

        /** ShardReplication nodes. */
        public nodes: topodata.ShardReplication.INode[];

        /**
         * Creates a new ShardReplication instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ShardReplication instance
         */
        public static create(properties?: topodata.IShardReplication): topodata.ShardReplication;

        /**
         * Encodes the specified ShardReplication message. Does not implicitly {@link topodata.ShardReplication.verify|verify} messages.
         * @param message ShardReplication message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IShardReplication, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ShardReplication message, length delimited. Does not implicitly {@link topodata.ShardReplication.verify|verify} messages.
         * @param message ShardReplication message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IShardReplication, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ShardReplication message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ShardReplication
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.ShardReplication;

        /**
         * Decodes a ShardReplication message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ShardReplication
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.ShardReplication;

        /**
         * Verifies a ShardReplication message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ShardReplication message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ShardReplication
         */
        public static fromObject(object: { [k: string]: any }): topodata.ShardReplication;

        /**
         * Creates a plain object from a ShardReplication message. Also converts values to other types if specified.
         * @param message ShardReplication
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.ShardReplication, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ShardReplication to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace ShardReplication {

        /** Properties of a Node. */
        interface INode {

            /** Node tablet_alias */
            tablet_alias?: (topodata.ITabletAlias|null);
        }

        /** Represents a Node. */
        class Node implements INode {

            /**
             * Constructs a new Node.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.ShardReplication.INode);

            /** Node tablet_alias. */
            public tablet_alias?: (topodata.ITabletAlias|null);

            /**
             * Creates a new Node instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Node instance
             */
            public static create(properties?: topodata.ShardReplication.INode): topodata.ShardReplication.Node;

            /**
             * Encodes the specified Node message. Does not implicitly {@link topodata.ShardReplication.Node.verify|verify} messages.
             * @param message Node message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.ShardReplication.INode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Node message, length delimited. Does not implicitly {@link topodata.ShardReplication.Node.verify|verify} messages.
             * @param message Node message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.ShardReplication.INode, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Node message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.ShardReplication.Node;

            /**
             * Decodes a Node message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Node
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.ShardReplication.Node;

            /**
             * Verifies a Node message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Node message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Node
             */
            public static fromObject(object: { [k: string]: any }): topodata.ShardReplication.Node;

            /**
             * Creates a plain object from a Node message. Also converts values to other types if specified.
             * @param message Node
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.ShardReplication.Node, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Node to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a ShardReference. */
    interface IShardReference {

        /** ShardReference name */
        name?: (string|null);

        /** ShardReference key_range */
        key_range?: (topodata.IKeyRange|null);
    }

    /** Represents a ShardReference. */
    class ShardReference implements IShardReference {

        /**
         * Constructs a new ShardReference.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IShardReference);

        /** ShardReference name. */
        public name: string;

        /** ShardReference key_range. */
        public key_range?: (topodata.IKeyRange|null);

        /**
         * Creates a new ShardReference instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ShardReference instance
         */
        public static create(properties?: topodata.IShardReference): topodata.ShardReference;

        /**
         * Encodes the specified ShardReference message. Does not implicitly {@link topodata.ShardReference.verify|verify} messages.
         * @param message ShardReference message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IShardReference, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ShardReference message, length delimited. Does not implicitly {@link topodata.ShardReference.verify|verify} messages.
         * @param message ShardReference message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IShardReference, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ShardReference message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ShardReference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.ShardReference;

        /**
         * Decodes a ShardReference message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ShardReference
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.ShardReference;

        /**
         * Verifies a ShardReference message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ShardReference message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ShardReference
         */
        public static fromObject(object: { [k: string]: any }): topodata.ShardReference;

        /**
         * Creates a plain object from a ShardReference message. Also converts values to other types if specified.
         * @param message ShardReference
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.ShardReference, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ShardReference to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a ShardTabletControl. */
    interface IShardTabletControl {

        /** ShardTabletControl name */
        name?: (string|null);

        /** ShardTabletControl key_range */
        key_range?: (topodata.IKeyRange|null);

        /** ShardTabletControl query_service_disabled */
        query_service_disabled?: (boolean|null);
    }

    /** Represents a ShardTabletControl. */
    class ShardTabletControl implements IShardTabletControl {

        /**
         * Constructs a new ShardTabletControl.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.IShardTabletControl);

        /** ShardTabletControl name. */
        public name: string;

        /** ShardTabletControl key_range. */
        public key_range?: (topodata.IKeyRange|null);

        /** ShardTabletControl query_service_disabled. */
        public query_service_disabled: boolean;

        /**
         * Creates a new ShardTabletControl instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ShardTabletControl instance
         */
        public static create(properties?: topodata.IShardTabletControl): topodata.ShardTabletControl;

        /**
         * Encodes the specified ShardTabletControl message. Does not implicitly {@link topodata.ShardTabletControl.verify|verify} messages.
         * @param message ShardTabletControl message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.IShardTabletControl, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ShardTabletControl message, length delimited. Does not implicitly {@link topodata.ShardTabletControl.verify|verify} messages.
         * @param message ShardTabletControl message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.IShardTabletControl, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a ShardTabletControl message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ShardTabletControl
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.ShardTabletControl;

        /**
         * Decodes a ShardTabletControl message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ShardTabletControl
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.ShardTabletControl;

        /**
         * Verifies a ShardTabletControl message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a ShardTabletControl message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ShardTabletControl
         */
        public static fromObject(object: { [k: string]: any }): topodata.ShardTabletControl;

        /**
         * Creates a plain object from a ShardTabletControl message. Also converts values to other types if specified.
         * @param message ShardTabletControl
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.ShardTabletControl, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ShardTabletControl to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a SrvKeyspace. */
    interface ISrvKeyspace {

        /** SrvKeyspace partitions */
        partitions?: (topodata.SrvKeyspace.IKeyspacePartition[]|null);

        /** SrvKeyspace sharding_column_name */
        sharding_column_name?: (string|null);

        /** SrvKeyspace sharding_column_type */
        sharding_column_type?: (topodata.KeyspaceIdType|null);

        /** SrvKeyspace served_from */
        served_from?: (topodata.SrvKeyspace.IServedFrom[]|null);
    }

    /** Represents a SrvKeyspace. */
    class SrvKeyspace implements ISrvKeyspace {

        /**
         * Constructs a new SrvKeyspace.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.ISrvKeyspace);

        /** SrvKeyspace partitions. */
        public partitions: topodata.SrvKeyspace.IKeyspacePartition[];

        /** SrvKeyspace sharding_column_name. */
        public sharding_column_name: string;

        /** SrvKeyspace sharding_column_type. */
        public sharding_column_type: topodata.KeyspaceIdType;

        /** SrvKeyspace served_from. */
        public served_from: topodata.SrvKeyspace.IServedFrom[];

        /**
         * Creates a new SrvKeyspace instance using the specified properties.
         * @param [properties] Properties to set
         * @returns SrvKeyspace instance
         */
        public static create(properties?: topodata.ISrvKeyspace): topodata.SrvKeyspace;

        /**
         * Encodes the specified SrvKeyspace message. Does not implicitly {@link topodata.SrvKeyspace.verify|verify} messages.
         * @param message SrvKeyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.ISrvKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified SrvKeyspace message, length delimited. Does not implicitly {@link topodata.SrvKeyspace.verify|verify} messages.
         * @param message SrvKeyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.ISrvKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a SrvKeyspace message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns SrvKeyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.SrvKeyspace;

        /**
         * Decodes a SrvKeyspace message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns SrvKeyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.SrvKeyspace;

        /**
         * Verifies a SrvKeyspace message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a SrvKeyspace message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns SrvKeyspace
         */
        public static fromObject(object: { [k: string]: any }): topodata.SrvKeyspace;

        /**
         * Creates a plain object from a SrvKeyspace message. Also converts values to other types if specified.
         * @param message SrvKeyspace
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.SrvKeyspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this SrvKeyspace to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    namespace SrvKeyspace {

        /** Properties of a KeyspacePartition. */
        interface IKeyspacePartition {

            /** KeyspacePartition served_type */
            served_type?: (topodata.TabletType|null);

            /** KeyspacePartition shard_references */
            shard_references?: (topodata.IShardReference[]|null);

            /** KeyspacePartition shard_tablet_controls */
            shard_tablet_controls?: (topodata.IShardTabletControl[]|null);
        }

        /** Represents a KeyspacePartition. */
        class KeyspacePartition implements IKeyspacePartition {

            /**
             * Constructs a new KeyspacePartition.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.SrvKeyspace.IKeyspacePartition);

            /** KeyspacePartition served_type. */
            public served_type: topodata.TabletType;

            /** KeyspacePartition shard_references. */
            public shard_references: topodata.IShardReference[];

            /** KeyspacePartition shard_tablet_controls. */
            public shard_tablet_controls: topodata.IShardTabletControl[];

            /**
             * Creates a new KeyspacePartition instance using the specified properties.
             * @param [properties] Properties to set
             * @returns KeyspacePartition instance
             */
            public static create(properties?: topodata.SrvKeyspace.IKeyspacePartition): topodata.SrvKeyspace.KeyspacePartition;

            /**
             * Encodes the specified KeyspacePartition message. Does not implicitly {@link topodata.SrvKeyspace.KeyspacePartition.verify|verify} messages.
             * @param message KeyspacePartition message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.SrvKeyspace.IKeyspacePartition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified KeyspacePartition message, length delimited. Does not implicitly {@link topodata.SrvKeyspace.KeyspacePartition.verify|verify} messages.
             * @param message KeyspacePartition message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.SrvKeyspace.IKeyspacePartition, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a KeyspacePartition message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns KeyspacePartition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.SrvKeyspace.KeyspacePartition;

            /**
             * Decodes a KeyspacePartition message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns KeyspacePartition
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.SrvKeyspace.KeyspacePartition;

            /**
             * Verifies a KeyspacePartition message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a KeyspacePartition message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns KeyspacePartition
             */
            public static fromObject(object: { [k: string]: any }): topodata.SrvKeyspace.KeyspacePartition;

            /**
             * Creates a plain object from a KeyspacePartition message. Also converts values to other types if specified.
             * @param message KeyspacePartition
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.SrvKeyspace.KeyspacePartition, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this KeyspacePartition to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }

        /** Properties of a ServedFrom. */
        interface IServedFrom {

            /** ServedFrom tablet_type */
            tablet_type?: (topodata.TabletType|null);

            /** ServedFrom keyspace */
            keyspace?: (string|null);
        }

        /** Represents a ServedFrom. */
        class ServedFrom implements IServedFrom {

            /**
             * Constructs a new ServedFrom.
             * @param [properties] Properties to set
             */
            constructor(properties?: topodata.SrvKeyspace.IServedFrom);

            /** ServedFrom tablet_type. */
            public tablet_type: topodata.TabletType;

            /** ServedFrom keyspace. */
            public keyspace: string;

            /**
             * Creates a new ServedFrom instance using the specified properties.
             * @param [properties] Properties to set
             * @returns ServedFrom instance
             */
            public static create(properties?: topodata.SrvKeyspace.IServedFrom): topodata.SrvKeyspace.ServedFrom;

            /**
             * Encodes the specified ServedFrom message. Does not implicitly {@link topodata.SrvKeyspace.ServedFrom.verify|verify} messages.
             * @param message ServedFrom message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: topodata.SrvKeyspace.IServedFrom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified ServedFrom message, length delimited. Does not implicitly {@link topodata.SrvKeyspace.ServedFrom.verify|verify} messages.
             * @param message ServedFrom message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: topodata.SrvKeyspace.IServedFrom, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a ServedFrom message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns ServedFrom
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.SrvKeyspace.ServedFrom;

            /**
             * Decodes a ServedFrom message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns ServedFrom
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.SrvKeyspace.ServedFrom;

            /**
             * Verifies a ServedFrom message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a ServedFrom message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns ServedFrom
             */
            public static fromObject(object: { [k: string]: any }): topodata.SrvKeyspace.ServedFrom;

            /**
             * Creates a plain object from a ServedFrom message. Also converts values to other types if specified.
             * @param message ServedFrom
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: topodata.SrvKeyspace.ServedFrom, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this ServedFrom to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }

    /** Properties of a CellInfo. */
    interface ICellInfo {

        /** CellInfo server_address */
        server_address?: (string|null);

        /** CellInfo root */
        root?: (string|null);
    }

    /** Represents a CellInfo. */
    class CellInfo implements ICellInfo {

        /**
         * Constructs a new CellInfo.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.ICellInfo);

        /** CellInfo server_address. */
        public server_address: string;

        /** CellInfo root. */
        public root: string;

        /**
         * Creates a new CellInfo instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CellInfo instance
         */
        public static create(properties?: topodata.ICellInfo): topodata.CellInfo;

        /**
         * Encodes the specified CellInfo message. Does not implicitly {@link topodata.CellInfo.verify|verify} messages.
         * @param message CellInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.ICellInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CellInfo message, length delimited. Does not implicitly {@link topodata.CellInfo.verify|verify} messages.
         * @param message CellInfo message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.ICellInfo, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CellInfo message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CellInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.CellInfo;

        /**
         * Decodes a CellInfo message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CellInfo
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.CellInfo;

        /**
         * Verifies a CellInfo message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CellInfo message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CellInfo
         */
        public static fromObject(object: { [k: string]: any }): topodata.CellInfo;

        /**
         * Creates a plain object from a CellInfo message. Also converts values to other types if specified.
         * @param message CellInfo
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.CellInfo, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CellInfo to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a CellsAlias. */
    interface ICellsAlias {

        /** CellsAlias cells */
        cells?: (string[]|null);
    }

    /** Represents a CellsAlias. */
    class CellsAlias implements ICellsAlias {

        /**
         * Constructs a new CellsAlias.
         * @param [properties] Properties to set
         */
        constructor(properties?: topodata.ICellsAlias);

        /** CellsAlias cells. */
        public cells: string[];

        /**
         * Creates a new CellsAlias instance using the specified properties.
         * @param [properties] Properties to set
         * @returns CellsAlias instance
         */
        public static create(properties?: topodata.ICellsAlias): topodata.CellsAlias;

        /**
         * Encodes the specified CellsAlias message. Does not implicitly {@link topodata.CellsAlias.verify|verify} messages.
         * @param message CellsAlias message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: topodata.ICellsAlias, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified CellsAlias message, length delimited. Does not implicitly {@link topodata.CellsAlias.verify|verify} messages.
         * @param message CellsAlias message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: topodata.ICellsAlias, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a CellsAlias message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns CellsAlias
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): topodata.CellsAlias;

        /**
         * Decodes a CellsAlias message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns CellsAlias
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): topodata.CellsAlias;

        /**
         * Verifies a CellsAlias message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a CellsAlias message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns CellsAlias
         */
        public static fromObject(object: { [k: string]: any }): topodata.CellsAlias;

        /**
         * Creates a plain object from a CellsAlias message. Also converts values to other types if specified.
         * @param message CellsAlias
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: topodata.CellsAlias, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this CellsAlias to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Namespace vttime. */
export namespace vttime {

    /** Properties of a Time. */
    interface ITime {

        /** Time seconds */
        seconds?: (number|Long|null);

        /** Time nanoseconds */
        nanoseconds?: (number|null);
    }

    /** Represents a Time. */
    class Time implements ITime {

        /**
         * Constructs a new Time.
         * @param [properties] Properties to set
         */
        constructor(properties?: vttime.ITime);

        /** Time seconds. */
        public seconds: (number|Long);

        /** Time nanoseconds. */
        public nanoseconds: number;

        /**
         * Creates a new Time instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Time instance
         */
        public static create(properties?: vttime.ITime): vttime.Time;

        /**
         * Encodes the specified Time message. Does not implicitly {@link vttime.Time.verify|verify} messages.
         * @param message Time message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vttime.ITime, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Time message, length delimited. Does not implicitly {@link vttime.Time.verify|verify} messages.
         * @param message Time message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vttime.ITime, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Time message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Time
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vttime.Time;

        /**
         * Decodes a Time message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Time
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vttime.Time;

        /**
         * Verifies a Time message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Time message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Time
         */
        public static fromObject(object: { [k: string]: any }): vttime.Time;

        /**
         * Creates a plain object from a Time message. Also converts values to other types if specified.
         * @param message Time
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vttime.Time, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Time to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Namespace vtctldata. */
export namespace vtctldata {

    /** Properties of an ExecuteVtctlCommandRequest. */
    interface IExecuteVtctlCommandRequest {

        /** ExecuteVtctlCommandRequest args */
        args?: (string[]|null);

        /** ExecuteVtctlCommandRequest action_timeout */
        action_timeout?: (number|Long|null);
    }

    /** Represents an ExecuteVtctlCommandRequest. */
    class ExecuteVtctlCommandRequest implements IExecuteVtctlCommandRequest {

        /**
         * Constructs a new ExecuteVtctlCommandRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IExecuteVtctlCommandRequest);

        /** ExecuteVtctlCommandRequest args. */
        public args: string[];

        /** ExecuteVtctlCommandRequest action_timeout. */
        public action_timeout: (number|Long);

        /**
         * Creates a new ExecuteVtctlCommandRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExecuteVtctlCommandRequest instance
         */
        public static create(properties?: vtctldata.IExecuteVtctlCommandRequest): vtctldata.ExecuteVtctlCommandRequest;

        /**
         * Encodes the specified ExecuteVtctlCommandRequest message. Does not implicitly {@link vtctldata.ExecuteVtctlCommandRequest.verify|verify} messages.
         * @param message ExecuteVtctlCommandRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IExecuteVtctlCommandRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ExecuteVtctlCommandRequest message, length delimited. Does not implicitly {@link vtctldata.ExecuteVtctlCommandRequest.verify|verify} messages.
         * @param message ExecuteVtctlCommandRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IExecuteVtctlCommandRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ExecuteVtctlCommandRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ExecuteVtctlCommandRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.ExecuteVtctlCommandRequest;

        /**
         * Decodes an ExecuteVtctlCommandRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ExecuteVtctlCommandRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.ExecuteVtctlCommandRequest;

        /**
         * Verifies an ExecuteVtctlCommandRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ExecuteVtctlCommandRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ExecuteVtctlCommandRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.ExecuteVtctlCommandRequest;

        /**
         * Creates a plain object from an ExecuteVtctlCommandRequest message. Also converts values to other types if specified.
         * @param message ExecuteVtctlCommandRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.ExecuteVtctlCommandRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ExecuteVtctlCommandRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an ExecuteVtctlCommandResponse. */
    interface IExecuteVtctlCommandResponse {

        /** ExecuteVtctlCommandResponse event */
        event?: (logutil.IEvent|null);
    }

    /** Represents an ExecuteVtctlCommandResponse. */
    class ExecuteVtctlCommandResponse implements IExecuteVtctlCommandResponse {

        /**
         * Constructs a new ExecuteVtctlCommandResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IExecuteVtctlCommandResponse);

        /** ExecuteVtctlCommandResponse event. */
        public event?: (logutil.IEvent|null);

        /**
         * Creates a new ExecuteVtctlCommandResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns ExecuteVtctlCommandResponse instance
         */
        public static create(properties?: vtctldata.IExecuteVtctlCommandResponse): vtctldata.ExecuteVtctlCommandResponse;

        /**
         * Encodes the specified ExecuteVtctlCommandResponse message. Does not implicitly {@link vtctldata.ExecuteVtctlCommandResponse.verify|verify} messages.
         * @param message ExecuteVtctlCommandResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IExecuteVtctlCommandResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified ExecuteVtctlCommandResponse message, length delimited. Does not implicitly {@link vtctldata.ExecuteVtctlCommandResponse.verify|verify} messages.
         * @param message ExecuteVtctlCommandResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IExecuteVtctlCommandResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an ExecuteVtctlCommandResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns ExecuteVtctlCommandResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.ExecuteVtctlCommandResponse;

        /**
         * Decodes an ExecuteVtctlCommandResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns ExecuteVtctlCommandResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.ExecuteVtctlCommandResponse;

        /**
         * Verifies an ExecuteVtctlCommandResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an ExecuteVtctlCommandResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns ExecuteVtctlCommandResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.ExecuteVtctlCommandResponse;

        /**
         * Creates a plain object from an ExecuteVtctlCommandResponse message. Also converts values to other types if specified.
         * @param message ExecuteVtctlCommandResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.ExecuteVtctlCommandResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this ExecuteVtctlCommandResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellInfoNamesRequest. */
    interface IGetCellInfoNamesRequest {
    }

    /** Represents a GetCellInfoNamesRequest. */
    class GetCellInfoNamesRequest implements IGetCellInfoNamesRequest {

        /**
         * Constructs a new GetCellInfoNamesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellInfoNamesRequest);

        /**
         * Creates a new GetCellInfoNamesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellInfoNamesRequest instance
         */
        public static create(properties?: vtctldata.IGetCellInfoNamesRequest): vtctldata.GetCellInfoNamesRequest;

        /**
         * Encodes the specified GetCellInfoNamesRequest message. Does not implicitly {@link vtctldata.GetCellInfoNamesRequest.verify|verify} messages.
         * @param message GetCellInfoNamesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellInfoNamesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellInfoNamesRequest message, length delimited. Does not implicitly {@link vtctldata.GetCellInfoNamesRequest.verify|verify} messages.
         * @param message GetCellInfoNamesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellInfoNamesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellInfoNamesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellInfoNamesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellInfoNamesRequest;

        /**
         * Decodes a GetCellInfoNamesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellInfoNamesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellInfoNamesRequest;

        /**
         * Verifies a GetCellInfoNamesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellInfoNamesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellInfoNamesRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellInfoNamesRequest;

        /**
         * Creates a plain object from a GetCellInfoNamesRequest message. Also converts values to other types if specified.
         * @param message GetCellInfoNamesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellInfoNamesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellInfoNamesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellInfoNamesResponse. */
    interface IGetCellInfoNamesResponse {

        /** GetCellInfoNamesResponse names */
        names?: (string[]|null);
    }

    /** Represents a GetCellInfoNamesResponse. */
    class GetCellInfoNamesResponse implements IGetCellInfoNamesResponse {

        /**
         * Constructs a new GetCellInfoNamesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellInfoNamesResponse);

        /** GetCellInfoNamesResponse names. */
        public names: string[];

        /**
         * Creates a new GetCellInfoNamesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellInfoNamesResponse instance
         */
        public static create(properties?: vtctldata.IGetCellInfoNamesResponse): vtctldata.GetCellInfoNamesResponse;

        /**
         * Encodes the specified GetCellInfoNamesResponse message. Does not implicitly {@link vtctldata.GetCellInfoNamesResponse.verify|verify} messages.
         * @param message GetCellInfoNamesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellInfoNamesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellInfoNamesResponse message, length delimited. Does not implicitly {@link vtctldata.GetCellInfoNamesResponse.verify|verify} messages.
         * @param message GetCellInfoNamesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellInfoNamesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellInfoNamesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellInfoNamesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellInfoNamesResponse;

        /**
         * Decodes a GetCellInfoNamesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellInfoNamesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellInfoNamesResponse;

        /**
         * Verifies a GetCellInfoNamesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellInfoNamesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellInfoNamesResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellInfoNamesResponse;

        /**
         * Creates a plain object from a GetCellInfoNamesResponse message. Also converts values to other types if specified.
         * @param message GetCellInfoNamesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellInfoNamesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellInfoNamesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellInfoRequest. */
    interface IGetCellInfoRequest {

        /** GetCellInfoRequest cell */
        cell?: (string|null);
    }

    /** Represents a GetCellInfoRequest. */
    class GetCellInfoRequest implements IGetCellInfoRequest {

        /**
         * Constructs a new GetCellInfoRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellInfoRequest);

        /** GetCellInfoRequest cell. */
        public cell: string;

        /**
         * Creates a new GetCellInfoRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellInfoRequest instance
         */
        public static create(properties?: vtctldata.IGetCellInfoRequest): vtctldata.GetCellInfoRequest;

        /**
         * Encodes the specified GetCellInfoRequest message. Does not implicitly {@link vtctldata.GetCellInfoRequest.verify|verify} messages.
         * @param message GetCellInfoRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellInfoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellInfoRequest message, length delimited. Does not implicitly {@link vtctldata.GetCellInfoRequest.verify|verify} messages.
         * @param message GetCellInfoRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellInfoRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellInfoRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellInfoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellInfoRequest;

        /**
         * Decodes a GetCellInfoRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellInfoRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellInfoRequest;

        /**
         * Verifies a GetCellInfoRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellInfoRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellInfoRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellInfoRequest;

        /**
         * Creates a plain object from a GetCellInfoRequest message. Also converts values to other types if specified.
         * @param message GetCellInfoRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellInfoRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellInfoRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellInfoResponse. */
    interface IGetCellInfoResponse {

        /** GetCellInfoResponse cell_info */
        cell_info?: (topodata.ICellInfo|null);
    }

    /** Represents a GetCellInfoResponse. */
    class GetCellInfoResponse implements IGetCellInfoResponse {

        /**
         * Constructs a new GetCellInfoResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellInfoResponse);

        /** GetCellInfoResponse cell_info. */
        public cell_info?: (topodata.ICellInfo|null);

        /**
         * Creates a new GetCellInfoResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellInfoResponse instance
         */
        public static create(properties?: vtctldata.IGetCellInfoResponse): vtctldata.GetCellInfoResponse;

        /**
         * Encodes the specified GetCellInfoResponse message. Does not implicitly {@link vtctldata.GetCellInfoResponse.verify|verify} messages.
         * @param message GetCellInfoResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellInfoResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellInfoResponse message, length delimited. Does not implicitly {@link vtctldata.GetCellInfoResponse.verify|verify} messages.
         * @param message GetCellInfoResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellInfoResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellInfoResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellInfoResponse;

        /**
         * Decodes a GetCellInfoResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellInfoResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellInfoResponse;

        /**
         * Verifies a GetCellInfoResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellInfoResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellInfoResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellInfoResponse;

        /**
         * Creates a plain object from a GetCellInfoResponse message. Also converts values to other types if specified.
         * @param message GetCellInfoResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellInfoResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellInfoResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellsAliasesRequest. */
    interface IGetCellsAliasesRequest {
    }

    /** Represents a GetCellsAliasesRequest. */
    class GetCellsAliasesRequest implements IGetCellsAliasesRequest {

        /**
         * Constructs a new GetCellsAliasesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellsAliasesRequest);

        /**
         * Creates a new GetCellsAliasesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellsAliasesRequest instance
         */
        public static create(properties?: vtctldata.IGetCellsAliasesRequest): vtctldata.GetCellsAliasesRequest;

        /**
         * Encodes the specified GetCellsAliasesRequest message. Does not implicitly {@link vtctldata.GetCellsAliasesRequest.verify|verify} messages.
         * @param message GetCellsAliasesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellsAliasesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellsAliasesRequest message, length delimited. Does not implicitly {@link vtctldata.GetCellsAliasesRequest.verify|verify} messages.
         * @param message GetCellsAliasesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellsAliasesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellsAliasesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellsAliasesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellsAliasesRequest;

        /**
         * Decodes a GetCellsAliasesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellsAliasesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellsAliasesRequest;

        /**
         * Verifies a GetCellsAliasesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellsAliasesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellsAliasesRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellsAliasesRequest;

        /**
         * Creates a plain object from a GetCellsAliasesRequest message. Also converts values to other types if specified.
         * @param message GetCellsAliasesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellsAliasesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellsAliasesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetCellsAliasesResponse. */
    interface IGetCellsAliasesResponse {

        /** GetCellsAliasesResponse aliases */
        aliases?: ({ [k: string]: topodata.ICellsAlias }|null);
    }

    /** Represents a GetCellsAliasesResponse. */
    class GetCellsAliasesResponse implements IGetCellsAliasesResponse {

        /**
         * Constructs a new GetCellsAliasesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetCellsAliasesResponse);

        /** GetCellsAliasesResponse aliases. */
        public aliases: { [k: string]: topodata.ICellsAlias };

        /**
         * Creates a new GetCellsAliasesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetCellsAliasesResponse instance
         */
        public static create(properties?: vtctldata.IGetCellsAliasesResponse): vtctldata.GetCellsAliasesResponse;

        /**
         * Encodes the specified GetCellsAliasesResponse message. Does not implicitly {@link vtctldata.GetCellsAliasesResponse.verify|verify} messages.
         * @param message GetCellsAliasesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetCellsAliasesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetCellsAliasesResponse message, length delimited. Does not implicitly {@link vtctldata.GetCellsAliasesResponse.verify|verify} messages.
         * @param message GetCellsAliasesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetCellsAliasesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetCellsAliasesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetCellsAliasesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetCellsAliasesResponse;

        /**
         * Decodes a GetCellsAliasesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetCellsAliasesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetCellsAliasesResponse;

        /**
         * Verifies a GetCellsAliasesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetCellsAliasesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetCellsAliasesResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetCellsAliasesResponse;

        /**
         * Creates a plain object from a GetCellsAliasesResponse message. Also converts values to other types if specified.
         * @param message GetCellsAliasesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetCellsAliasesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetCellsAliasesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspacesRequest. */
    interface IGetKeyspacesRequest {
    }

    /** Represents a GetKeyspacesRequest. */
    class GetKeyspacesRequest implements IGetKeyspacesRequest {

        /**
         * Constructs a new GetKeyspacesRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetKeyspacesRequest);

        /**
         * Creates a new GetKeyspacesRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspacesRequest instance
         */
        public static create(properties?: vtctldata.IGetKeyspacesRequest): vtctldata.GetKeyspacesRequest;

        /**
         * Encodes the specified GetKeyspacesRequest message. Does not implicitly {@link vtctldata.GetKeyspacesRequest.verify|verify} messages.
         * @param message GetKeyspacesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetKeyspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspacesRequest message, length delimited. Does not implicitly {@link vtctldata.GetKeyspacesRequest.verify|verify} messages.
         * @param message GetKeyspacesRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetKeyspacesRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspacesRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspacesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetKeyspacesRequest;

        /**
         * Decodes a GetKeyspacesRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspacesRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetKeyspacesRequest;

        /**
         * Verifies a GetKeyspacesRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspacesRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspacesRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetKeyspacesRequest;

        /**
         * Creates a plain object from a GetKeyspacesRequest message. Also converts values to other types if specified.
         * @param message GetKeyspacesRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetKeyspacesRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspacesRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspacesResponse. */
    interface IGetKeyspacesResponse {

        /** GetKeyspacesResponse keyspaces */
        keyspaces?: (vtctldata.IKeyspace[]|null);
    }

    /** Represents a GetKeyspacesResponse. */
    class GetKeyspacesResponse implements IGetKeyspacesResponse {

        /**
         * Constructs a new GetKeyspacesResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetKeyspacesResponse);

        /** GetKeyspacesResponse keyspaces. */
        public keyspaces: vtctldata.IKeyspace[];

        /**
         * Creates a new GetKeyspacesResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspacesResponse instance
         */
        public static create(properties?: vtctldata.IGetKeyspacesResponse): vtctldata.GetKeyspacesResponse;

        /**
         * Encodes the specified GetKeyspacesResponse message. Does not implicitly {@link vtctldata.GetKeyspacesResponse.verify|verify} messages.
         * @param message GetKeyspacesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetKeyspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspacesResponse message, length delimited. Does not implicitly {@link vtctldata.GetKeyspacesResponse.verify|verify} messages.
         * @param message GetKeyspacesResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetKeyspacesResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspacesResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspacesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetKeyspacesResponse;

        /**
         * Decodes a GetKeyspacesResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspacesResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetKeyspacesResponse;

        /**
         * Verifies a GetKeyspacesResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspacesResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspacesResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetKeyspacesResponse;

        /**
         * Creates a plain object from a GetKeyspacesResponse message. Also converts values to other types if specified.
         * @param message GetKeyspacesResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetKeyspacesResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspacesResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspaceRequest. */
    interface IGetKeyspaceRequest {

        /** GetKeyspaceRequest keyspace */
        keyspace?: (string|null);
    }

    /** Represents a GetKeyspaceRequest. */
    class GetKeyspaceRequest implements IGetKeyspaceRequest {

        /**
         * Constructs a new GetKeyspaceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetKeyspaceRequest);

        /** GetKeyspaceRequest keyspace. */
        public keyspace: string;

        /**
         * Creates a new GetKeyspaceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspaceRequest instance
         */
        public static create(properties?: vtctldata.IGetKeyspaceRequest): vtctldata.GetKeyspaceRequest;

        /**
         * Encodes the specified GetKeyspaceRequest message. Does not implicitly {@link vtctldata.GetKeyspaceRequest.verify|verify} messages.
         * @param message GetKeyspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetKeyspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspaceRequest message, length delimited. Does not implicitly {@link vtctldata.GetKeyspaceRequest.verify|verify} messages.
         * @param message GetKeyspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetKeyspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspaceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetKeyspaceRequest;

        /**
         * Decodes a GetKeyspaceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetKeyspaceRequest;

        /**
         * Verifies a GetKeyspaceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspaceRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetKeyspaceRequest;

        /**
         * Creates a plain object from a GetKeyspaceRequest message. Also converts values to other types if specified.
         * @param message GetKeyspaceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetKeyspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspaceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a GetKeyspaceResponse. */
    interface IGetKeyspaceResponse {

        /** GetKeyspaceResponse keyspace */
        keyspace?: (vtctldata.IKeyspace|null);
    }

    /** Represents a GetKeyspaceResponse. */
    class GetKeyspaceResponse implements IGetKeyspaceResponse {

        /**
         * Constructs a new GetKeyspaceResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IGetKeyspaceResponse);

        /** GetKeyspaceResponse keyspace. */
        public keyspace?: (vtctldata.IKeyspace|null);

        /**
         * Creates a new GetKeyspaceResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns GetKeyspaceResponse instance
         */
        public static create(properties?: vtctldata.IGetKeyspaceResponse): vtctldata.GetKeyspaceResponse;

        /**
         * Encodes the specified GetKeyspaceResponse message. Does not implicitly {@link vtctldata.GetKeyspaceResponse.verify|verify} messages.
         * @param message GetKeyspaceResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IGetKeyspaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified GetKeyspaceResponse message, length delimited. Does not implicitly {@link vtctldata.GetKeyspaceResponse.verify|verify} messages.
         * @param message GetKeyspaceResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IGetKeyspaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a GetKeyspaceResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns GetKeyspaceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.GetKeyspaceResponse;

        /**
         * Decodes a GetKeyspaceResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns GetKeyspaceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.GetKeyspaceResponse;

        /**
         * Verifies a GetKeyspaceResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a GetKeyspaceResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns GetKeyspaceResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.GetKeyspaceResponse;

        /**
         * Creates a plain object from a GetKeyspaceResponse message. Also converts values to other types if specified.
         * @param message GetKeyspaceResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.GetKeyspaceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this GetKeyspaceResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an InitShardPrimaryRequest. */
    interface IInitShardPrimaryRequest {

        /** InitShardPrimaryRequest keyspace */
        keyspace?: (string|null);

        /** InitShardPrimaryRequest shard */
        shard?: (string|null);

        /** InitShardPrimaryRequest primary_elect_tablet_alias */
        primary_elect_tablet_alias?: (topodata.ITabletAlias|null);

        /** InitShardPrimaryRequest force */
        force?: (boolean|null);

        /** InitShardPrimaryRequest wait_replicas_timeout */
        wait_replicas_timeout?: (google.protobuf.IDuration|null);
    }

    /** Represents an InitShardPrimaryRequest. */
    class InitShardPrimaryRequest implements IInitShardPrimaryRequest {

        /**
         * Constructs a new InitShardPrimaryRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IInitShardPrimaryRequest);

        /** InitShardPrimaryRequest keyspace. */
        public keyspace: string;

        /** InitShardPrimaryRequest shard. */
        public shard: string;

        /** InitShardPrimaryRequest primary_elect_tablet_alias. */
        public primary_elect_tablet_alias?: (topodata.ITabletAlias|null);

        /** InitShardPrimaryRequest force. */
        public force: boolean;

        /** InitShardPrimaryRequest wait_replicas_timeout. */
        public wait_replicas_timeout?: (google.protobuf.IDuration|null);

        /**
         * Creates a new InitShardPrimaryRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns InitShardPrimaryRequest instance
         */
        public static create(properties?: vtctldata.IInitShardPrimaryRequest): vtctldata.InitShardPrimaryRequest;

        /**
         * Encodes the specified InitShardPrimaryRequest message. Does not implicitly {@link vtctldata.InitShardPrimaryRequest.verify|verify} messages.
         * @param message InitShardPrimaryRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IInitShardPrimaryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified InitShardPrimaryRequest message, length delimited. Does not implicitly {@link vtctldata.InitShardPrimaryRequest.verify|verify} messages.
         * @param message InitShardPrimaryRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IInitShardPrimaryRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an InitShardPrimaryRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns InitShardPrimaryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.InitShardPrimaryRequest;

        /**
         * Decodes an InitShardPrimaryRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns InitShardPrimaryRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.InitShardPrimaryRequest;

        /**
         * Verifies an InitShardPrimaryRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an InitShardPrimaryRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns InitShardPrimaryRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.InitShardPrimaryRequest;

        /**
         * Creates a plain object from an InitShardPrimaryRequest message. Also converts values to other types if specified.
         * @param message InitShardPrimaryRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.InitShardPrimaryRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this InitShardPrimaryRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of an InitShardPrimaryResponse. */
    interface IInitShardPrimaryResponse {

        /** InitShardPrimaryResponse events */
        events?: (logutil.IEvent[]|null);
    }

    /** Represents an InitShardPrimaryResponse. */
    class InitShardPrimaryResponse implements IInitShardPrimaryResponse {

        /**
         * Constructs a new InitShardPrimaryResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IInitShardPrimaryResponse);

        /** InitShardPrimaryResponse events. */
        public events: logutil.IEvent[];

        /**
         * Creates a new InitShardPrimaryResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns InitShardPrimaryResponse instance
         */
        public static create(properties?: vtctldata.IInitShardPrimaryResponse): vtctldata.InitShardPrimaryResponse;

        /**
         * Encodes the specified InitShardPrimaryResponse message. Does not implicitly {@link vtctldata.InitShardPrimaryResponse.verify|verify} messages.
         * @param message InitShardPrimaryResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IInitShardPrimaryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified InitShardPrimaryResponse message, length delimited. Does not implicitly {@link vtctldata.InitShardPrimaryResponse.verify|verify} messages.
         * @param message InitShardPrimaryResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IInitShardPrimaryResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an InitShardPrimaryResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns InitShardPrimaryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.InitShardPrimaryResponse;

        /**
         * Decodes an InitShardPrimaryResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns InitShardPrimaryResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.InitShardPrimaryResponse;

        /**
         * Verifies an InitShardPrimaryResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an InitShardPrimaryResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns InitShardPrimaryResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.InitShardPrimaryResponse;

        /**
         * Creates a plain object from an InitShardPrimaryResponse message. Also converts values to other types if specified.
         * @param message InitShardPrimaryResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.InitShardPrimaryResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this InitShardPrimaryResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Keyspace. */
    interface IKeyspace {

        /** Keyspace name */
        name?: (string|null);

        /** Keyspace keyspace */
        keyspace?: (topodata.IKeyspace|null);
    }

    /** Represents a Keyspace. */
    class Keyspace implements IKeyspace {

        /**
         * Constructs a new Keyspace.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IKeyspace);

        /** Keyspace name. */
        public name: string;

        /** Keyspace keyspace. */
        public keyspace?: (topodata.IKeyspace|null);

        /**
         * Creates a new Keyspace instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Keyspace instance
         */
        public static create(properties?: vtctldata.IKeyspace): vtctldata.Keyspace;

        /**
         * Encodes the specified Keyspace message. Does not implicitly {@link vtctldata.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Keyspace message, length delimited. Does not implicitly {@link vtctldata.Keyspace.verify|verify} messages.
         * @param message Keyspace message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IKeyspace, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Keyspace message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.Keyspace;

        /**
         * Decodes a Keyspace message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Keyspace
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.Keyspace;

        /**
         * Verifies a Keyspace message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Keyspace message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Keyspace
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.Keyspace;

        /**
         * Creates a plain object from a Keyspace message. Also converts values to other types if specified.
         * @param message Keyspace
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.Keyspace, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Keyspace to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a FindAllShardsInKeyspaceRequest. */
    interface IFindAllShardsInKeyspaceRequest {

        /** FindAllShardsInKeyspaceRequest keyspace */
        keyspace?: (string|null);
    }

    /** Represents a FindAllShardsInKeyspaceRequest. */
    class FindAllShardsInKeyspaceRequest implements IFindAllShardsInKeyspaceRequest {

        /**
         * Constructs a new FindAllShardsInKeyspaceRequest.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IFindAllShardsInKeyspaceRequest);

        /** FindAllShardsInKeyspaceRequest keyspace. */
        public keyspace: string;

        /**
         * Creates a new FindAllShardsInKeyspaceRequest instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FindAllShardsInKeyspaceRequest instance
         */
        public static create(properties?: vtctldata.IFindAllShardsInKeyspaceRequest): vtctldata.FindAllShardsInKeyspaceRequest;

        /**
         * Encodes the specified FindAllShardsInKeyspaceRequest message. Does not implicitly {@link vtctldata.FindAllShardsInKeyspaceRequest.verify|verify} messages.
         * @param message FindAllShardsInKeyspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IFindAllShardsInKeyspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FindAllShardsInKeyspaceRequest message, length delimited. Does not implicitly {@link vtctldata.FindAllShardsInKeyspaceRequest.verify|verify} messages.
         * @param message FindAllShardsInKeyspaceRequest message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IFindAllShardsInKeyspaceRequest, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FindAllShardsInKeyspaceRequest message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FindAllShardsInKeyspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.FindAllShardsInKeyspaceRequest;

        /**
         * Decodes a FindAllShardsInKeyspaceRequest message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FindAllShardsInKeyspaceRequest
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.FindAllShardsInKeyspaceRequest;

        /**
         * Verifies a FindAllShardsInKeyspaceRequest message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FindAllShardsInKeyspaceRequest message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FindAllShardsInKeyspaceRequest
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.FindAllShardsInKeyspaceRequest;

        /**
         * Creates a plain object from a FindAllShardsInKeyspaceRequest message. Also converts values to other types if specified.
         * @param message FindAllShardsInKeyspaceRequest
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.FindAllShardsInKeyspaceRequest, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FindAllShardsInKeyspaceRequest to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a FindAllShardsInKeyspaceResponse. */
    interface IFindAllShardsInKeyspaceResponse {

        /** FindAllShardsInKeyspaceResponse shards */
        shards?: ({ [k: string]: vtctldata.IShard }|null);
    }

    /** Represents a FindAllShardsInKeyspaceResponse. */
    class FindAllShardsInKeyspaceResponse implements IFindAllShardsInKeyspaceResponse {

        /**
         * Constructs a new FindAllShardsInKeyspaceResponse.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IFindAllShardsInKeyspaceResponse);

        /** FindAllShardsInKeyspaceResponse shards. */
        public shards: { [k: string]: vtctldata.IShard };

        /**
         * Creates a new FindAllShardsInKeyspaceResponse instance using the specified properties.
         * @param [properties] Properties to set
         * @returns FindAllShardsInKeyspaceResponse instance
         */
        public static create(properties?: vtctldata.IFindAllShardsInKeyspaceResponse): vtctldata.FindAllShardsInKeyspaceResponse;

        /**
         * Encodes the specified FindAllShardsInKeyspaceResponse message. Does not implicitly {@link vtctldata.FindAllShardsInKeyspaceResponse.verify|verify} messages.
         * @param message FindAllShardsInKeyspaceResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IFindAllShardsInKeyspaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified FindAllShardsInKeyspaceResponse message, length delimited. Does not implicitly {@link vtctldata.FindAllShardsInKeyspaceResponse.verify|verify} messages.
         * @param message FindAllShardsInKeyspaceResponse message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IFindAllShardsInKeyspaceResponse, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a FindAllShardsInKeyspaceResponse message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns FindAllShardsInKeyspaceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.FindAllShardsInKeyspaceResponse;

        /**
         * Decodes a FindAllShardsInKeyspaceResponse message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns FindAllShardsInKeyspaceResponse
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.FindAllShardsInKeyspaceResponse;

        /**
         * Verifies a FindAllShardsInKeyspaceResponse message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a FindAllShardsInKeyspaceResponse message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns FindAllShardsInKeyspaceResponse
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.FindAllShardsInKeyspaceResponse;

        /**
         * Creates a plain object from a FindAllShardsInKeyspaceResponse message. Also converts values to other types if specified.
         * @param message FindAllShardsInKeyspaceResponse
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.FindAllShardsInKeyspaceResponse, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this FindAllShardsInKeyspaceResponse to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a Shard. */
    interface IShard {

        /** Shard keyspace */
        keyspace?: (string|null);

        /** Shard name */
        name?: (string|null);

        /** Shard shard */
        shard?: (topodata.IShard|null);
    }

    /** Represents a Shard. */
    class Shard implements IShard {

        /**
         * Constructs a new Shard.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IShard);

        /** Shard keyspace. */
        public keyspace: string;

        /** Shard name. */
        public name: string;

        /** Shard shard. */
        public shard?: (topodata.IShard|null);

        /**
         * Creates a new Shard instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Shard instance
         */
        public static create(properties?: vtctldata.IShard): vtctldata.Shard;

        /**
         * Encodes the specified Shard message. Does not implicitly {@link vtctldata.Shard.verify|verify} messages.
         * @param message Shard message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IShard, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Shard message, length delimited. Does not implicitly {@link vtctldata.Shard.verify|verify} messages.
         * @param message Shard message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IShard, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Shard message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Shard
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.Shard;

        /**
         * Decodes a Shard message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Shard
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.Shard;

        /**
         * Verifies a Shard message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Shard message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Shard
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.Shard;

        /**
         * Creates a plain object from a Shard message. Also converts values to other types if specified.
         * @param message Shard
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.Shard, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Shard to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a TableMaterializeSettings. */
    interface ITableMaterializeSettings {

        /** TableMaterializeSettings target_table */
        target_table?: (string|null);

        /** TableMaterializeSettings source_expression */
        source_expression?: (string|null);

        /** TableMaterializeSettings create_ddl */
        create_ddl?: (string|null);
    }

    /** Represents a TableMaterializeSettings. */
    class TableMaterializeSettings implements ITableMaterializeSettings {

        /**
         * Constructs a new TableMaterializeSettings.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.ITableMaterializeSettings);

        /** TableMaterializeSettings target_table. */
        public target_table: string;

        /** TableMaterializeSettings source_expression. */
        public source_expression: string;

        /** TableMaterializeSettings create_ddl. */
        public create_ddl: string;

        /**
         * Creates a new TableMaterializeSettings instance using the specified properties.
         * @param [properties] Properties to set
         * @returns TableMaterializeSettings instance
         */
        public static create(properties?: vtctldata.ITableMaterializeSettings): vtctldata.TableMaterializeSettings;

        /**
         * Encodes the specified TableMaterializeSettings message. Does not implicitly {@link vtctldata.TableMaterializeSettings.verify|verify} messages.
         * @param message TableMaterializeSettings message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.ITableMaterializeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified TableMaterializeSettings message, length delimited. Does not implicitly {@link vtctldata.TableMaterializeSettings.verify|verify} messages.
         * @param message TableMaterializeSettings message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.ITableMaterializeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a TableMaterializeSettings message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns TableMaterializeSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.TableMaterializeSettings;

        /**
         * Decodes a TableMaterializeSettings message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns TableMaterializeSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.TableMaterializeSettings;

        /**
         * Verifies a TableMaterializeSettings message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a TableMaterializeSettings message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns TableMaterializeSettings
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.TableMaterializeSettings;

        /**
         * Creates a plain object from a TableMaterializeSettings message. Also converts values to other types if specified.
         * @param message TableMaterializeSettings
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.TableMaterializeSettings, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this TableMaterializeSettings to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }

    /** Properties of a MaterializeSettings. */
    interface IMaterializeSettings {

        /** MaterializeSettings workflow */
        workflow?: (string|null);

        /** MaterializeSettings source_keyspace */
        source_keyspace?: (string|null);

        /** MaterializeSettings target_keyspace */
        target_keyspace?: (string|null);

        /** MaterializeSettings stop_after_copy */
        stop_after_copy?: (boolean|null);

        /** MaterializeSettings table_settings */
        table_settings?: (vtctldata.ITableMaterializeSettings[]|null);

        /** MaterializeSettings cell */
        cell?: (string|null);

        /** MaterializeSettings tablet_types */
        tablet_types?: (string|null);
    }

    /** Represents a MaterializeSettings. */
    class MaterializeSettings implements IMaterializeSettings {

        /**
         * Constructs a new MaterializeSettings.
         * @param [properties] Properties to set
         */
        constructor(properties?: vtctldata.IMaterializeSettings);

        /** MaterializeSettings workflow. */
        public workflow: string;

        /** MaterializeSettings source_keyspace. */
        public source_keyspace: string;

        /** MaterializeSettings target_keyspace. */
        public target_keyspace: string;

        /** MaterializeSettings stop_after_copy. */
        public stop_after_copy: boolean;

        /** MaterializeSettings table_settings. */
        public table_settings: vtctldata.ITableMaterializeSettings[];

        /** MaterializeSettings cell. */
        public cell: string;

        /** MaterializeSettings tablet_types. */
        public tablet_types: string;

        /**
         * Creates a new MaterializeSettings instance using the specified properties.
         * @param [properties] Properties to set
         * @returns MaterializeSettings instance
         */
        public static create(properties?: vtctldata.IMaterializeSettings): vtctldata.MaterializeSettings;

        /**
         * Encodes the specified MaterializeSettings message. Does not implicitly {@link vtctldata.MaterializeSettings.verify|verify} messages.
         * @param message MaterializeSettings message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: vtctldata.IMaterializeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified MaterializeSettings message, length delimited. Does not implicitly {@link vtctldata.MaterializeSettings.verify|verify} messages.
         * @param message MaterializeSettings message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: vtctldata.IMaterializeSettings, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a MaterializeSettings message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns MaterializeSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): vtctldata.MaterializeSettings;

        /**
         * Decodes a MaterializeSettings message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns MaterializeSettings
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): vtctldata.MaterializeSettings;

        /**
         * Verifies a MaterializeSettings message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a MaterializeSettings message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns MaterializeSettings
         */
        public static fromObject(object: { [k: string]: any }): vtctldata.MaterializeSettings;

        /**
         * Creates a plain object from a MaterializeSettings message. Also converts values to other types if specified.
         * @param message MaterializeSettings
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: vtctldata.MaterializeSettings, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this MaterializeSettings to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Namespace logutil. */
export namespace logutil {

    /** Level enum. */
    enum Level {
        INFO = 0,
        WARNING = 1,
        ERROR = 2,
        CONSOLE = 3
    }

    /** Properties of an Event. */
    interface IEvent {

        /** Event time */
        time?: (vttime.ITime|null);

        /** Event level */
        level?: (logutil.Level|null);

        /** Event file */
        file?: (string|null);

        /** Event line */
        line?: (number|Long|null);

        /** Event value */
        value?: (string|null);
    }

    /** Represents an Event. */
    class Event implements IEvent {

        /**
         * Constructs a new Event.
         * @param [properties] Properties to set
         */
        constructor(properties?: logutil.IEvent);

        /** Event time. */
        public time?: (vttime.ITime|null);

        /** Event level. */
        public level: logutil.Level;

        /** Event file. */
        public file: string;

        /** Event line. */
        public line: (number|Long);

        /** Event value. */
        public value: string;

        /**
         * Creates a new Event instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Event instance
         */
        public static create(properties?: logutil.IEvent): logutil.Event;

        /**
         * Encodes the specified Event message. Does not implicitly {@link logutil.Event.verify|verify} messages.
         * @param message Event message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: logutil.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Event message, length delimited. Does not implicitly {@link logutil.Event.verify|verify} messages.
         * @param message Event message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: logutil.IEvent, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes an Event message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): logutil.Event;

        /**
         * Decodes an Event message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Event
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): logutil.Event;

        /**
         * Verifies an Event message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates an Event message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Event
         */
        public static fromObject(object: { [k: string]: any }): logutil.Event;

        /**
         * Creates a plain object from an Event message. Also converts values to other types if specified.
         * @param message Event
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: logutil.Event, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Event to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}

/** Namespace google. */
export namespace google {

    /** Namespace protobuf. */
    namespace protobuf {

        /** Properties of a Duration. */
        interface IDuration {

            /** Duration seconds */
            seconds?: (number|Long|null);

            /** Duration nanos */
            nanos?: (number|null);
        }

        /** Represents a Duration. */
        class Duration implements IDuration {

            /**
             * Constructs a new Duration.
             * @param [properties] Properties to set
             */
            constructor(properties?: google.protobuf.IDuration);

            /** Duration seconds. */
            public seconds: (number|Long);

            /** Duration nanos. */
            public nanos: number;

            /**
             * Creates a new Duration instance using the specified properties.
             * @param [properties] Properties to set
             * @returns Duration instance
             */
            public static create(properties?: google.protobuf.IDuration): google.protobuf.Duration;

            /**
             * Encodes the specified Duration message. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encode(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Encodes the specified Duration message, length delimited. Does not implicitly {@link google.protobuf.Duration.verify|verify} messages.
             * @param message Duration message or plain object to encode
             * @param [writer] Writer to encode to
             * @returns Writer
             */
            public static encodeDelimited(message: google.protobuf.IDuration, writer?: $protobuf.Writer): $protobuf.Writer;

            /**
             * Decodes a Duration message from the specified reader or buffer.
             * @param reader Reader or buffer to decode from
             * @param [length] Message length if known beforehand
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): google.protobuf.Duration;

            /**
             * Decodes a Duration message from the specified reader or buffer, length delimited.
             * @param reader Reader or buffer to decode from
             * @returns Duration
             * @throws {Error} If the payload is not a reader or valid buffer
             * @throws {$protobuf.util.ProtocolError} If required fields are missing
             */
            public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): google.protobuf.Duration;

            /**
             * Verifies a Duration message.
             * @param message Plain object to verify
             * @returns `null` if valid, otherwise the reason why it is not
             */
            public static verify(message: { [k: string]: any }): (string|null);

            /**
             * Creates a Duration message from a plain object. Also converts values to their respective internal types.
             * @param object Plain object
             * @returns Duration
             */
            public static fromObject(object: { [k: string]: any }): google.protobuf.Duration;

            /**
             * Creates a plain object from a Duration message. Also converts values to other types if specified.
             * @param message Duration
             * @param [options] Conversion options
             * @returns Plain object
             */
            public static toObject(message: google.protobuf.Duration, options?: $protobuf.IConversionOptions): { [k: string]: any };

            /**
             * Converts this Duration to JSON.
             * @returns JSON object
             */
            public toJSON(): { [k: string]: any };
        }
    }
}
