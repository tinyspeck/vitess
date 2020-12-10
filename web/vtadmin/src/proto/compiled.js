/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.vreplication = (function() {

    /**
     * Namespace vreplication.
     * @exports vreplication
     * @namespace
     */
    var vreplication = {};

    /**
     * VRepStreamState enum.
     * @name vreplication.VRepStreamState
     * @enum {number}
     * @property {number} RUNNING=0 RUNNING value
     * @property {number} STOPPED=1 STOPPED value
     */
    vreplication.VRepStreamState = (function() {
        var valuesById = {}, values = Object.create(valuesById);
        values[valuesById[0] = "RUNNING"] = 0;
        values[valuesById[1] = "STOPPED"] = 1;
        return values;
    })();

    vreplication.VRepStream = (function() {

        /**
         * Properties of a VRepStream.
         * @memberof vreplication
         * @interface IVRepStream
         * @property {number|Long|null} [id] VRepStream id
         * @property {string|null} [workflow] VRepStream workflow
         * @property {string|null} [source] VRepStream source
         * @property {string|null} [pos] VRepStream pos
         * @property {string|null} [stop_pos] VRepStream stop_pos
         * @property {number|Long|null} [max_tps] VRepStream max_tps
         * @property {number|Long|null} [max_replication_lag] VRepStream max_replication_lag
         * @property {string|null} [cell] VRepStream cell
         * @property {Array.<string>|null} [tablet_types] VRepStream tablet_types
         * @property {number|Long|null} [time_updated] VRepStream time_updated
         * @property {number|Long|null} [transaction_timestamp] VRepStream transaction_timestamp
         * @property {vreplication.VRepStreamState|null} [state] VRepStream state
         * @property {string|null} [message] VRepStream message
         * @property {string|null} [db_name] VRepStream db_name
         * @property {string|null} [cluster] VRepStream cluster
         * @property {string|null} [keyspace] VRepStream keyspace
         * @property {string|null} [shard] VRepStream shard
         * @property {string|null} [tablet_alias] VRepStream tablet_alias
         */

        /**
         * Constructs a new VRepStream.
         * @memberof vreplication
         * @classdesc Represents a VRepStream.
         * @implements IVRepStream
         * @constructor
         * @param {vreplication.IVRepStream=} [properties] Properties to set
         */
        function VRepStream(properties) {
            this.tablet_types = [];
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * VRepStream id.
         * @member {number|Long} id
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.id = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream workflow.
         * @member {string} workflow
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.workflow = "";

        /**
         * VRepStream source.
         * @member {string} source
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.source = "";

        /**
         * VRepStream pos.
         * @member {string} pos
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.pos = "";

        /**
         * VRepStream stop_pos.
         * @member {string} stop_pos
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.stop_pos = "";

        /**
         * VRepStream max_tps.
         * @member {number|Long} max_tps
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.max_tps = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream max_replication_lag.
         * @member {number|Long} max_replication_lag
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.max_replication_lag = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream cell.
         * @member {string} cell
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.cell = "";

        /**
         * VRepStream tablet_types.
         * @member {Array.<string>} tablet_types
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.tablet_types = $util.emptyArray;

        /**
         * VRepStream time_updated.
         * @member {number|Long} time_updated
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.time_updated = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream transaction_timestamp.
         * @member {number|Long} transaction_timestamp
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.transaction_timestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream state.
         * @member {vreplication.VRepStreamState} state
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.state = 0;

        /**
         * VRepStream message.
         * @member {string} message
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.message = "";

        /**
         * VRepStream db_name.
         * @member {string} db_name
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.db_name = "";

        /**
         * VRepStream cluster.
         * @member {string} cluster
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.cluster = "";

        /**
         * VRepStream keyspace.
         * @member {string} keyspace
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.keyspace = "";

        /**
         * VRepStream shard.
         * @member {string} shard
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.shard = "";

        /**
         * VRepStream tablet_alias.
         * @member {string} tablet_alias
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.tablet_alias = "";

        /**
         * Creates a new VRepStream instance using the specified properties.
         * @function create
         * @memberof vreplication.VRepStream
         * @static
         * @param {vreplication.IVRepStream=} [properties] Properties to set
         * @returns {vreplication.VRepStream} VRepStream instance
         */
        VRepStream.create = function create(properties) {
            return new VRepStream(properties);
        };

        /**
         * Encodes the specified VRepStream message. Does not implicitly {@link vreplication.VRepStream.verify|verify} messages.
         * @function encode
         * @memberof vreplication.VRepStream
         * @static
         * @param {vreplication.IVRepStream} message VRepStream message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VRepStream.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.id != null && Object.hasOwnProperty.call(message, "id"))
                writer.uint32(/* id 1, wireType 0 =*/8).int64(message.id);
            if (message.workflow != null && Object.hasOwnProperty.call(message, "workflow"))
                writer.uint32(/* id 2, wireType 2 =*/18).string(message.workflow);
            if (message.source != null && Object.hasOwnProperty.call(message, "source"))
                writer.uint32(/* id 3, wireType 2 =*/26).string(message.source);
            if (message.pos != null && Object.hasOwnProperty.call(message, "pos"))
                writer.uint32(/* id 4, wireType 2 =*/34).string(message.pos);
            if (message.stop_pos != null && Object.hasOwnProperty.call(message, "stop_pos"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.stop_pos);
            if (message.max_tps != null && Object.hasOwnProperty.call(message, "max_tps"))
                writer.uint32(/* id 6, wireType 0 =*/48).int64(message.max_tps);
            if (message.max_replication_lag != null && Object.hasOwnProperty.call(message, "max_replication_lag"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.max_replication_lag);
            if (message.cell != null && Object.hasOwnProperty.call(message, "cell"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.cell);
            if (message.tablet_types != null && message.tablet_types.length)
                for (var i = 0; i < message.tablet_types.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.tablet_types[i]);
            if (message.time_updated != null && Object.hasOwnProperty.call(message, "time_updated"))
                writer.uint32(/* id 10, wireType 0 =*/80).int64(message.time_updated);
            if (message.transaction_timestamp != null && Object.hasOwnProperty.call(message, "transaction_timestamp"))
                writer.uint32(/* id 11, wireType 0 =*/88).int64(message.transaction_timestamp);
            if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                writer.uint32(/* id 12, wireType 0 =*/96).int32(message.state);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.message);
            if (message.db_name != null && Object.hasOwnProperty.call(message, "db_name"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.db_name);
            if (message.cluster != null && Object.hasOwnProperty.call(message, "cluster"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.cluster);
            if (message.keyspace != null && Object.hasOwnProperty.call(message, "keyspace"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.keyspace);
            if (message.shard != null && Object.hasOwnProperty.call(message, "shard"))
                writer.uint32(/* id 17, wireType 2 =*/138).string(message.shard);
            if (message.tablet_alias != null && Object.hasOwnProperty.call(message, "tablet_alias"))
                writer.uint32(/* id 18, wireType 2 =*/146).string(message.tablet_alias);
            return writer;
        };

        /**
         * Encodes the specified VRepStream message, length delimited. Does not implicitly {@link vreplication.VRepStream.verify|verify} messages.
         * @function encodeDelimited
         * @memberof vreplication.VRepStream
         * @static
         * @param {vreplication.IVRepStream} message VRepStream message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        VRepStream.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a VRepStream message from the specified reader or buffer.
         * @function decode
         * @memberof vreplication.VRepStream
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {vreplication.VRepStream} VRepStream
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VRepStream.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.vreplication.VRepStream();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.id = reader.int64();
                    break;
                case 2:
                    message.workflow = reader.string();
                    break;
                case 3:
                    message.source = reader.string();
                    break;
                case 4:
                    message.pos = reader.string();
                    break;
                case 5:
                    message.stop_pos = reader.string();
                    break;
                case 6:
                    message.max_tps = reader.int64();
                    break;
                case 7:
                    message.max_replication_lag = reader.int64();
                    break;
                case 8:
                    message.cell = reader.string();
                    break;
                case 9:
                    if (!(message.tablet_types && message.tablet_types.length))
                        message.tablet_types = [];
                    message.tablet_types.push(reader.string());
                    break;
                case 10:
                    message.time_updated = reader.int64();
                    break;
                case 11:
                    message.transaction_timestamp = reader.int64();
                    break;
                case 12:
                    message.state = reader.int32();
                    break;
                case 13:
                    message.message = reader.string();
                    break;
                case 14:
                    message.db_name = reader.string();
                    break;
                case 15:
                    message.cluster = reader.string();
                    break;
                case 16:
                    message.keyspace = reader.string();
                    break;
                case 17:
                    message.shard = reader.string();
                    break;
                case 18:
                    message.tablet_alias = reader.string();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a VRepStream message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof vreplication.VRepStream
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {vreplication.VRepStream} VRepStream
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        VRepStream.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a VRepStream message.
         * @function verify
         * @memberof vreplication.VRepStream
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        VRepStream.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.id != null && message.hasOwnProperty("id"))
                if (!$util.isInteger(message.id) && !(message.id && $util.isInteger(message.id.low) && $util.isInteger(message.id.high)))
                    return "id: integer|Long expected";
            if (message.workflow != null && message.hasOwnProperty("workflow"))
                if (!$util.isString(message.workflow))
                    return "workflow: string expected";
            if (message.source != null && message.hasOwnProperty("source"))
                if (!$util.isString(message.source))
                    return "source: string expected";
            if (message.pos != null && message.hasOwnProperty("pos"))
                if (!$util.isString(message.pos))
                    return "pos: string expected";
            if (message.stop_pos != null && message.hasOwnProperty("stop_pos"))
                if (!$util.isString(message.stop_pos))
                    return "stop_pos: string expected";
            if (message.max_tps != null && message.hasOwnProperty("max_tps"))
                if (!$util.isInteger(message.max_tps) && !(message.max_tps && $util.isInteger(message.max_tps.low) && $util.isInteger(message.max_tps.high)))
                    return "max_tps: integer|Long expected";
            if (message.max_replication_lag != null && message.hasOwnProperty("max_replication_lag"))
                if (!$util.isInteger(message.max_replication_lag) && !(message.max_replication_lag && $util.isInteger(message.max_replication_lag.low) && $util.isInteger(message.max_replication_lag.high)))
                    return "max_replication_lag: integer|Long expected";
            if (message.cell != null && message.hasOwnProperty("cell"))
                if (!$util.isString(message.cell))
                    return "cell: string expected";
            if (message.tablet_types != null && message.hasOwnProperty("tablet_types")) {
                if (!Array.isArray(message.tablet_types))
                    return "tablet_types: array expected";
                for (var i = 0; i < message.tablet_types.length; ++i)
                    if (!$util.isString(message.tablet_types[i]))
                        return "tablet_types: string[] expected";
            }
            if (message.time_updated != null && message.hasOwnProperty("time_updated"))
                if (!$util.isInteger(message.time_updated) && !(message.time_updated && $util.isInteger(message.time_updated.low) && $util.isInteger(message.time_updated.high)))
                    return "time_updated: integer|Long expected";
            if (message.transaction_timestamp != null && message.hasOwnProperty("transaction_timestamp"))
                if (!$util.isInteger(message.transaction_timestamp) && !(message.transaction_timestamp && $util.isInteger(message.transaction_timestamp.low) && $util.isInteger(message.transaction_timestamp.high)))
                    return "transaction_timestamp: integer|Long expected";
            if (message.state != null && message.hasOwnProperty("state"))
                switch (message.state) {
                default:
                    return "state: enum value expected";
                case 0:
                case 1:
                    break;
                }
            if (message.message != null && message.hasOwnProperty("message"))
                if (!$util.isString(message.message))
                    return "message: string expected";
            if (message.db_name != null && message.hasOwnProperty("db_name"))
                if (!$util.isString(message.db_name))
                    return "db_name: string expected";
            if (message.cluster != null && message.hasOwnProperty("cluster"))
                if (!$util.isString(message.cluster))
                    return "cluster: string expected";
            if (message.keyspace != null && message.hasOwnProperty("keyspace"))
                if (!$util.isString(message.keyspace))
                    return "keyspace: string expected";
            if (message.shard != null && message.hasOwnProperty("shard"))
                if (!$util.isString(message.shard))
                    return "shard: string expected";
            if (message.tablet_alias != null && message.hasOwnProperty("tablet_alias"))
                if (!$util.isString(message.tablet_alias))
                    return "tablet_alias: string expected";
            return null;
        };

        /**
         * Creates a VRepStream message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof vreplication.VRepStream
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {vreplication.VRepStream} VRepStream
         */
        VRepStream.fromObject = function fromObject(object) {
            if (object instanceof $root.vreplication.VRepStream)
                return object;
            var message = new $root.vreplication.VRepStream();
            if (object.id != null)
                if ($util.Long)
                    (message.id = $util.Long.fromValue(object.id)).unsigned = false;
                else if (typeof object.id === "string")
                    message.id = parseInt(object.id, 10);
                else if (typeof object.id === "number")
                    message.id = object.id;
                else if (typeof object.id === "object")
                    message.id = new $util.LongBits(object.id.low >>> 0, object.id.high >>> 0).toNumber();
            if (object.workflow != null)
                message.workflow = String(object.workflow);
            if (object.source != null)
                message.source = String(object.source);
            if (object.pos != null)
                message.pos = String(object.pos);
            if (object.stop_pos != null)
                message.stop_pos = String(object.stop_pos);
            if (object.max_tps != null)
                if ($util.Long)
                    (message.max_tps = $util.Long.fromValue(object.max_tps)).unsigned = false;
                else if (typeof object.max_tps === "string")
                    message.max_tps = parseInt(object.max_tps, 10);
                else if (typeof object.max_tps === "number")
                    message.max_tps = object.max_tps;
                else if (typeof object.max_tps === "object")
                    message.max_tps = new $util.LongBits(object.max_tps.low >>> 0, object.max_tps.high >>> 0).toNumber();
            if (object.max_replication_lag != null)
                if ($util.Long)
                    (message.max_replication_lag = $util.Long.fromValue(object.max_replication_lag)).unsigned = false;
                else if (typeof object.max_replication_lag === "string")
                    message.max_replication_lag = parseInt(object.max_replication_lag, 10);
                else if (typeof object.max_replication_lag === "number")
                    message.max_replication_lag = object.max_replication_lag;
                else if (typeof object.max_replication_lag === "object")
                    message.max_replication_lag = new $util.LongBits(object.max_replication_lag.low >>> 0, object.max_replication_lag.high >>> 0).toNumber();
            if (object.cell != null)
                message.cell = String(object.cell);
            if (object.tablet_types) {
                if (!Array.isArray(object.tablet_types))
                    throw TypeError(".vreplication.VRepStream.tablet_types: array expected");
                message.tablet_types = [];
                for (var i = 0; i < object.tablet_types.length; ++i)
                    message.tablet_types[i] = String(object.tablet_types[i]);
            }
            if (object.time_updated != null)
                if ($util.Long)
                    (message.time_updated = $util.Long.fromValue(object.time_updated)).unsigned = false;
                else if (typeof object.time_updated === "string")
                    message.time_updated = parseInt(object.time_updated, 10);
                else if (typeof object.time_updated === "number")
                    message.time_updated = object.time_updated;
                else if (typeof object.time_updated === "object")
                    message.time_updated = new $util.LongBits(object.time_updated.low >>> 0, object.time_updated.high >>> 0).toNumber();
            if (object.transaction_timestamp != null)
                if ($util.Long)
                    (message.transaction_timestamp = $util.Long.fromValue(object.transaction_timestamp)).unsigned = false;
                else if (typeof object.transaction_timestamp === "string")
                    message.transaction_timestamp = parseInt(object.transaction_timestamp, 10);
                else if (typeof object.transaction_timestamp === "number")
                    message.transaction_timestamp = object.transaction_timestamp;
                else if (typeof object.transaction_timestamp === "object")
                    message.transaction_timestamp = new $util.LongBits(object.transaction_timestamp.low >>> 0, object.transaction_timestamp.high >>> 0).toNumber();
            switch (object.state) {
            case "RUNNING":
            case 0:
                message.state = 0;
                break;
            case "STOPPED":
            case 1:
                message.state = 1;
                break;
            }
            if (object.message != null)
                message.message = String(object.message);
            if (object.db_name != null)
                message.db_name = String(object.db_name);
            if (object.cluster != null)
                message.cluster = String(object.cluster);
            if (object.keyspace != null)
                message.keyspace = String(object.keyspace);
            if (object.shard != null)
                message.shard = String(object.shard);
            if (object.tablet_alias != null)
                message.tablet_alias = String(object.tablet_alias);
            return message;
        };

        /**
         * Creates a plain object from a VRepStream message. Also converts values to other types if specified.
         * @function toObject
         * @memberof vreplication.VRepStream
         * @static
         * @param {vreplication.VRepStream} message VRepStream
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        VRepStream.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.arrays || options.defaults)
                object.tablet_types = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.workflow = "";
                object.source = "";
                object.pos = "";
                object.stop_pos = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.max_tps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.max_tps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.max_replication_lag = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.max_replication_lag = options.longs === String ? "0" : 0;
                object.cell = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.time_updated = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.time_updated = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.transaction_timestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transaction_timestamp = options.longs === String ? "0" : 0;
                object.state = options.enums === String ? "RUNNING" : 0;
                object.message = "";
                object.db_name = "";
                object.cluster = "";
                object.keyspace = "";
                object.shard = "";
                object.tablet_alias = "";
            }
            if (message.id != null && message.hasOwnProperty("id"))
                if (typeof message.id === "number")
                    object.id = options.longs === String ? String(message.id) : message.id;
                else
                    object.id = options.longs === String ? $util.Long.prototype.toString.call(message.id) : options.longs === Number ? new $util.LongBits(message.id.low >>> 0, message.id.high >>> 0).toNumber() : message.id;
            if (message.workflow != null && message.hasOwnProperty("workflow"))
                object.workflow = message.workflow;
            if (message.source != null && message.hasOwnProperty("source"))
                object.source = message.source;
            if (message.pos != null && message.hasOwnProperty("pos"))
                object.pos = message.pos;
            if (message.stop_pos != null && message.hasOwnProperty("stop_pos"))
                object.stop_pos = message.stop_pos;
            if (message.max_tps != null && message.hasOwnProperty("max_tps"))
                if (typeof message.max_tps === "number")
                    object.max_tps = options.longs === String ? String(message.max_tps) : message.max_tps;
                else
                    object.max_tps = options.longs === String ? $util.Long.prototype.toString.call(message.max_tps) : options.longs === Number ? new $util.LongBits(message.max_tps.low >>> 0, message.max_tps.high >>> 0).toNumber() : message.max_tps;
            if (message.max_replication_lag != null && message.hasOwnProperty("max_replication_lag"))
                if (typeof message.max_replication_lag === "number")
                    object.max_replication_lag = options.longs === String ? String(message.max_replication_lag) : message.max_replication_lag;
                else
                    object.max_replication_lag = options.longs === String ? $util.Long.prototype.toString.call(message.max_replication_lag) : options.longs === Number ? new $util.LongBits(message.max_replication_lag.low >>> 0, message.max_replication_lag.high >>> 0).toNumber() : message.max_replication_lag;
            if (message.cell != null && message.hasOwnProperty("cell"))
                object.cell = message.cell;
            if (message.tablet_types && message.tablet_types.length) {
                object.tablet_types = [];
                for (var j = 0; j < message.tablet_types.length; ++j)
                    object.tablet_types[j] = message.tablet_types[j];
            }
            if (message.time_updated != null && message.hasOwnProperty("time_updated"))
                if (typeof message.time_updated === "number")
                    object.time_updated = options.longs === String ? String(message.time_updated) : message.time_updated;
                else
                    object.time_updated = options.longs === String ? $util.Long.prototype.toString.call(message.time_updated) : options.longs === Number ? new $util.LongBits(message.time_updated.low >>> 0, message.time_updated.high >>> 0).toNumber() : message.time_updated;
            if (message.transaction_timestamp != null && message.hasOwnProperty("transaction_timestamp"))
                if (typeof message.transaction_timestamp === "number")
                    object.transaction_timestamp = options.longs === String ? String(message.transaction_timestamp) : message.transaction_timestamp;
                else
                    object.transaction_timestamp = options.longs === String ? $util.Long.prototype.toString.call(message.transaction_timestamp) : options.longs === Number ? new $util.LongBits(message.transaction_timestamp.low >>> 0, message.transaction_timestamp.high >>> 0).toNumber() : message.transaction_timestamp;
            if (message.state != null && message.hasOwnProperty("state"))
                object.state = options.enums === String ? $root.vreplication.VRepStreamState[message.state] : message.state;
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.db_name != null && message.hasOwnProperty("db_name"))
                object.db_name = message.db_name;
            if (message.cluster != null && message.hasOwnProperty("cluster"))
                object.cluster = message.cluster;
            if (message.keyspace != null && message.hasOwnProperty("keyspace"))
                object.keyspace = message.keyspace;
            if (message.shard != null && message.hasOwnProperty("shard"))
                object.shard = message.shard;
            if (message.tablet_alias != null && message.hasOwnProperty("tablet_alias"))
                object.tablet_alias = message.tablet_alias;
            return object;
        };

        /**
         * Converts this VRepStream to JSON.
         * @function toJSON
         * @memberof vreplication.VRepStream
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        VRepStream.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return VRepStream;
    })();

    return vreplication;
})();

module.exports = $root;
