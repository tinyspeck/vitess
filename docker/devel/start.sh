#!/bin/sh

set -x
set -e

# Go to the top level Vitess dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../..

# Stop and clean up
docker/devel/stop.sh

docker build -t vitess:devel docker/devel

docker run \
    -dt \
    --memory=4g --memory-swap=4g \
    --name vitess-devel \
    vitess:devel

# Sync the source tree from local into docker and the install binaries back
mkdir -p `pwd`/dist/linux
mutagen sync create `pwd`/go docker://vitess-devel/vt/src/vitess.io/vitess/go -n vitess-devel-src --ignore-vcs -m one-way-safe
mutagen sync create docker://vitess-devel/go/bin `pwd`/dist/linux -n vitess-devel-bin -m one-way-safe

docker exec -it vitess-devel bash