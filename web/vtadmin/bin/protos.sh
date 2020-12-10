#!/bin/sh

set -e

rl="readlink"
if [ "$(uname)" = "Darwin" ]; then
  rl="$(which greadlink)"
  if [ "${rl}" = "" ]; then
    echo "Either install greadlink or set vtadmin_web_root environment variable"
    exit 1
  fi
fi

if [ "${vtadmin_web_root}" = "" ]; then
  vtadmin_web_root="$(dirname "$(dirname "$(${rl} -f "$0")")")"
fi

proto_dir="$(${rl} -f $vtadmin_web_root/../../proto/)"
output_dir="${vtadmin_web_root}/src/proto"

./node_modules/.bin/pbjs \
	-p "$proto_dir" \
	-t static-module \
	-w commonjs \
	-o "$output_dir/compiled.js" \
	vreplication.proto --keep-case 

./node_modules/.bin/pbts \
	-o "$output_dir/compiled.d.ts" \
	"$output_dir/compiled.js"
