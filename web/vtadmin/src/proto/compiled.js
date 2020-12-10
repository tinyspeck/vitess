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
         * @property {string|null} [stopPos] VRepStream stopPos
         * @property {number|Long|null} [maxTps] VRepStream maxTps
         * @property {number|Long|null} [maxReplicationLag] VRepStream maxReplicationLag
         * @property {string|null} [cell] VRepStream cell
         * @property {Array.<string>|null} [tabletTypes] VRepStream tabletTypes
         * @property {number|Long|null} [timeUpdated] VRepStream timeUpdated
         * @property {number|Long|null} [transactionTimestamp] VRepStream transactionTimestamp
         * @property {vreplication.VRepStreamState|null} [state] VRepStream state
         * @property {string|null} [message] VRepStream message
         * @property {string|null} [dbName] VRepStream dbName
         * @property {string|null} [cluster] VRepStream cluster
         * @property {string|null} [keyspace] VRepStream keyspace
         * @property {string|null} [shard] VRepStream shard
         * @property {string|null} [tabletAlias] VRepStream tabletAlias
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
            this.tabletTypes = [];
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
         * VRepStream stopPos.
         * @member {string} stopPos
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.stopPos = "";

        /**
         * VRepStream maxTps.
         * @member {number|Long} maxTps
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.maxTps = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream maxReplicationLag.
         * @member {number|Long} maxReplicationLag
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.maxReplicationLag = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream cell.
         * @member {string} cell
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.cell = "";

        /**
         * VRepStream tabletTypes.
         * @member {Array.<string>} tabletTypes
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.tabletTypes = $util.emptyArray;

        /**
         * VRepStream timeUpdated.
         * @member {number|Long} timeUpdated
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.timeUpdated = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

        /**
         * VRepStream transactionTimestamp.
         * @member {number|Long} transactionTimestamp
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.transactionTimestamp = $util.Long ? $util.Long.fromBits(0,0,false) : 0;

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
         * VRepStream dbName.
         * @member {string} dbName
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.dbName = "";

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
         * VRepStream tabletAlias.
         * @member {string} tabletAlias
         * @memberof vreplication.VRepStream
         * @instance
         */
        VRepStream.prototype.tabletAlias = "";

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
            if (message.stopPos != null && Object.hasOwnProperty.call(message, "stopPos"))
                writer.uint32(/* id 5, wireType 2 =*/42).string(message.stopPos);
            if (message.maxTps != null && Object.hasOwnProperty.call(message, "maxTps"))
                writer.uint32(/* id 6, wireType 0 =*/48).int64(message.maxTps);
            if (message.maxReplicationLag != null && Object.hasOwnProperty.call(message, "maxReplicationLag"))
                writer.uint32(/* id 7, wireType 0 =*/56).int64(message.maxReplicationLag);
            if (message.cell != null && Object.hasOwnProperty.call(message, "cell"))
                writer.uint32(/* id 8, wireType 2 =*/66).string(message.cell);
            if (message.tabletTypes != null && message.tabletTypes.length)
                for (var i = 0; i < message.tabletTypes.length; ++i)
                    writer.uint32(/* id 9, wireType 2 =*/74).string(message.tabletTypes[i]);
            if (message.timeUpdated != null && Object.hasOwnProperty.call(message, "timeUpdated"))
                writer.uint32(/* id 10, wireType 0 =*/80).int64(message.timeUpdated);
            if (message.transactionTimestamp != null && Object.hasOwnProperty.call(message, "transactionTimestamp"))
                writer.uint32(/* id 11, wireType 0 =*/88).int64(message.transactionTimestamp);
            if (message.state != null && Object.hasOwnProperty.call(message, "state"))
                writer.uint32(/* id 12, wireType 0 =*/96).int32(message.state);
            if (message.message != null && Object.hasOwnProperty.call(message, "message"))
                writer.uint32(/* id 13, wireType 2 =*/106).string(message.message);
            if (message.dbName != null && Object.hasOwnProperty.call(message, "dbName"))
                writer.uint32(/* id 14, wireType 2 =*/114).string(message.dbName);
            if (message.cluster != null && Object.hasOwnProperty.call(message, "cluster"))
                writer.uint32(/* id 15, wireType 2 =*/122).string(message.cluster);
            if (message.keyspace != null && Object.hasOwnProperty.call(message, "keyspace"))
                writer.uint32(/* id 16, wireType 2 =*/130).string(message.keyspace);
            if (message.shard != null && Object.hasOwnProperty.call(message, "shard"))
                writer.uint32(/* id 17, wireType 2 =*/138).string(message.shard);
            if (message.tabletAlias != null && Object.hasOwnProperty.call(message, "tabletAlias"))
                writer.uint32(/* id 18, wireType 2 =*/146).string(message.tabletAlias);
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
                    message.stopPos = reader.string();
                    break;
                case 6:
                    message.maxTps = reader.int64();
                    break;
                case 7:
                    message.maxReplicationLag = reader.int64();
                    break;
                case 8:
                    message.cell = reader.string();
                    break;
                case 9:
                    if (!(message.tabletTypes && message.tabletTypes.length))
                        message.tabletTypes = [];
                    message.tabletTypes.push(reader.string());
                    break;
                case 10:
                    message.timeUpdated = reader.int64();
                    break;
                case 11:
                    message.transactionTimestamp = reader.int64();
                    break;
                case 12:
                    message.state = reader.int32();
                    break;
                case 13:
                    message.message = reader.string();
                    break;
                case 14:
                    message.dbName = reader.string();
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
                    message.tabletAlias = reader.string();
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
            if (message.stopPos != null && message.hasOwnProperty("stopPos"))
                if (!$util.isString(message.stopPos))
                    return "stopPos: string expected";
            if (message.maxTps != null && message.hasOwnProperty("maxTps"))
                if (!$util.isInteger(message.maxTps) && !(message.maxTps && $util.isInteger(message.maxTps.low) && $util.isInteger(message.maxTps.high)))
                    return "maxTps: integer|Long expected";
            if (message.maxReplicationLag != null && message.hasOwnProperty("maxReplicationLag"))
                if (!$util.isInteger(message.maxReplicationLag) && !(message.maxReplicationLag && $util.isInteger(message.maxReplicationLag.low) && $util.isInteger(message.maxReplicationLag.high)))
                    return "maxReplicationLag: integer|Long expected";
            if (message.cell != null && message.hasOwnProperty("cell"))
                if (!$util.isString(message.cell))
                    return "cell: string expected";
            if (message.tabletTypes != null && message.hasOwnProperty("tabletTypes")) {
                if (!Array.isArray(message.tabletTypes))
                    return "tabletTypes: array expected";
                for (var i = 0; i < message.tabletTypes.length; ++i)
                    if (!$util.isString(message.tabletTypes[i]))
                        return "tabletTypes: string[] expected";
            }
            if (message.timeUpdated != null && message.hasOwnProperty("timeUpdated"))
                if (!$util.isInteger(message.timeUpdated) && !(message.timeUpdated && $util.isInteger(message.timeUpdated.low) && $util.isInteger(message.timeUpdated.high)))
                    return "timeUpdated: integer|Long expected";
            if (message.transactionTimestamp != null && message.hasOwnProperty("transactionTimestamp"))
                if (!$util.isInteger(message.transactionTimestamp) && !(message.transactionTimestamp && $util.isInteger(message.transactionTimestamp.low) && $util.isInteger(message.transactionTimestamp.high)))
                    return "transactionTimestamp: integer|Long expected";
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
            if (message.dbName != null && message.hasOwnProperty("dbName"))
                if (!$util.isString(message.dbName))
                    return "dbName: string expected";
            if (message.cluster != null && message.hasOwnProperty("cluster"))
                if (!$util.isString(message.cluster))
                    return "cluster: string expected";
            if (message.keyspace != null && message.hasOwnProperty("keyspace"))
                if (!$util.isString(message.keyspace))
                    return "keyspace: string expected";
            if (message.shard != null && message.hasOwnProperty("shard"))
                if (!$util.isString(message.shard))
                    return "shard: string expected";
            if (message.tabletAlias != null && message.hasOwnProperty("tabletAlias"))
                if (!$util.isString(message.tabletAlias))
                    return "tabletAlias: string expected";
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
            if (object.stopPos != null)
                message.stopPos = String(object.stopPos);
            if (object.maxTps != null)
                if ($util.Long)
                    (message.maxTps = $util.Long.fromValue(object.maxTps)).unsigned = false;
                else if (typeof object.maxTps === "string")
                    message.maxTps = parseInt(object.maxTps, 10);
                else if (typeof object.maxTps === "number")
                    message.maxTps = object.maxTps;
                else if (typeof object.maxTps === "object")
                    message.maxTps = new $util.LongBits(object.maxTps.low >>> 0, object.maxTps.high >>> 0).toNumber();
            if (object.maxReplicationLag != null)
                if ($util.Long)
                    (message.maxReplicationLag = $util.Long.fromValue(object.maxReplicationLag)).unsigned = false;
                else if (typeof object.maxReplicationLag === "string")
                    message.maxReplicationLag = parseInt(object.maxReplicationLag, 10);
                else if (typeof object.maxReplicationLag === "number")
                    message.maxReplicationLag = object.maxReplicationLag;
                else if (typeof object.maxReplicationLag === "object")
                    message.maxReplicationLag = new $util.LongBits(object.maxReplicationLag.low >>> 0, object.maxReplicationLag.high >>> 0).toNumber();
            if (object.cell != null)
                message.cell = String(object.cell);
            if (object.tabletTypes) {
                if (!Array.isArray(object.tabletTypes))
                    throw TypeError(".vreplication.VRepStream.tabletTypes: array expected");
                message.tabletTypes = [];
                for (var i = 0; i < object.tabletTypes.length; ++i)
                    message.tabletTypes[i] = String(object.tabletTypes[i]);
            }
            if (object.timeUpdated != null)
                if ($util.Long)
                    (message.timeUpdated = $util.Long.fromValue(object.timeUpdated)).unsigned = false;
                else if (typeof object.timeUpdated === "string")
                    message.timeUpdated = parseInt(object.timeUpdated, 10);
                else if (typeof object.timeUpdated === "number")
                    message.timeUpdated = object.timeUpdated;
                else if (typeof object.timeUpdated === "object")
                    message.timeUpdated = new $util.LongBits(object.timeUpdated.low >>> 0, object.timeUpdated.high >>> 0).toNumber();
            if (object.transactionTimestamp != null)
                if ($util.Long)
                    (message.transactionTimestamp = $util.Long.fromValue(object.transactionTimestamp)).unsigned = false;
                else if (typeof object.transactionTimestamp === "string")
                    message.transactionTimestamp = parseInt(object.transactionTimestamp, 10);
                else if (typeof object.transactionTimestamp === "number")
                    message.transactionTimestamp = object.transactionTimestamp;
                else if (typeof object.transactionTimestamp === "object")
                    message.transactionTimestamp = new $util.LongBits(object.transactionTimestamp.low >>> 0, object.transactionTimestamp.high >>> 0).toNumber();
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
            if (object.dbName != null)
                message.dbName = String(object.dbName);
            if (object.cluster != null)
                message.cluster = String(object.cluster);
            if (object.keyspace != null)
                message.keyspace = String(object.keyspace);
            if (object.shard != null)
                message.shard = String(object.shard);
            if (object.tabletAlias != null)
                message.tabletAlias = String(object.tabletAlias);
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
                object.tabletTypes = [];
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.id = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.id = options.longs === String ? "0" : 0;
                object.workflow = "";
                object.source = "";
                object.pos = "";
                object.stopPos = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.maxTps = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxTps = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.maxReplicationLag = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.maxReplicationLag = options.longs === String ? "0" : 0;
                object.cell = "";
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.timeUpdated = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.timeUpdated = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, false);
                    object.transactionTimestamp = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.transactionTimestamp = options.longs === String ? "0" : 0;
                object.state = options.enums === String ? "RUNNING" : 0;
                object.message = "";
                object.dbName = "";
                object.cluster = "";
                object.keyspace = "";
                object.shard = "";
                object.tabletAlias = "";
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
            if (message.stopPos != null && message.hasOwnProperty("stopPos"))
                object.stopPos = message.stopPos;
            if (message.maxTps != null && message.hasOwnProperty("maxTps"))
                if (typeof message.maxTps === "number")
                    object.maxTps = options.longs === String ? String(message.maxTps) : message.maxTps;
                else
                    object.maxTps = options.longs === String ? $util.Long.prototype.toString.call(message.maxTps) : options.longs === Number ? new $util.LongBits(message.maxTps.low >>> 0, message.maxTps.high >>> 0).toNumber() : message.maxTps;
            if (message.maxReplicationLag != null && message.hasOwnProperty("maxReplicationLag"))
                if (typeof message.maxReplicationLag === "number")
                    object.maxReplicationLag = options.longs === String ? String(message.maxReplicationLag) : message.maxReplicationLag;
                else
                    object.maxReplicationLag = options.longs === String ? $util.Long.prototype.toString.call(message.maxReplicationLag) : options.longs === Number ? new $util.LongBits(message.maxReplicationLag.low >>> 0, message.maxReplicationLag.high >>> 0).toNumber() : message.maxReplicationLag;
            if (message.cell != null && message.hasOwnProperty("cell"))
                object.cell = message.cell;
            if (message.tabletTypes && message.tabletTypes.length) {
                object.tabletTypes = [];
                for (var j = 0; j < message.tabletTypes.length; ++j)
                    object.tabletTypes[j] = message.tabletTypes[j];
            }
            if (message.timeUpdated != null && message.hasOwnProperty("timeUpdated"))
                if (typeof message.timeUpdated === "number")
                    object.timeUpdated = options.longs === String ? String(message.timeUpdated) : message.timeUpdated;
                else
                    object.timeUpdated = options.longs === String ? $util.Long.prototype.toString.call(message.timeUpdated) : options.longs === Number ? new $util.LongBits(message.timeUpdated.low >>> 0, message.timeUpdated.high >>> 0).toNumber() : message.timeUpdated;
            if (message.transactionTimestamp != null && message.hasOwnProperty("transactionTimestamp"))
                if (typeof message.transactionTimestamp === "number")
                    object.transactionTimestamp = options.longs === String ? String(message.transactionTimestamp) : message.transactionTimestamp;
                else
                    object.transactionTimestamp = options.longs === String ? $util.Long.prototype.toString.call(message.transactionTimestamp) : options.longs === Number ? new $util.LongBits(message.transactionTimestamp.low >>> 0, message.transactionTimestamp.high >>> 0).toNumber() : message.transactionTimestamp;
            if (message.state != null && message.hasOwnProperty("state"))
                object.state = options.enums === String ? $root.vreplication.VRepStreamState[message.state] : message.state;
            if (message.message != null && message.hasOwnProperty("message"))
                object.message = message.message;
            if (message.dbName != null && message.hasOwnProperty("dbName"))
                object.dbName = message.dbName;
            if (message.cluster != null && message.hasOwnProperty("cluster"))
                object.cluster = message.cluster;
            if (message.keyspace != null && message.hasOwnProperty("keyspace"))
                object.keyspace = message.keyspace;
            if (message.shard != null && message.hasOwnProperty("shard"))
                object.shard = message.shard;
            if (message.tabletAlias != null && message.hasOwnProperty("tabletAlias"))
                object.tabletAlias = message.tabletAlias;
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
