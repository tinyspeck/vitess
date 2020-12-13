#!/bin/bash

set -e

vtadmin_root="$VTROOT/web/vtadmin"
vitess_proto_root="$VTROOT/proto"

pbjs_bin="$vtadmin_root/node_modules/.bin/pbjs"
pbts_bin="$vtadmin_root/node_modules/.bin/pbts"

proto_targets="vtadmin.proto"
output_filename="vtadmin"
output_dir="$vtadmin_root/src/proto"

mkdir -p "$output_dir"

$pbjs_bin \
	--keep-case \
	-p "$vitess_proto_root" \
	-t static-module \
	-w commonjs \
	-o "$output_dir/$output_filename.js" \
	"$proto_targets"

$pbts_bin \
 	-o "$output_dir/$output_filename.d.ts" \
 	"$output_dir/$output_filename.js"
