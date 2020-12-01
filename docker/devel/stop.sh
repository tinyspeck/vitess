#!/bin/sh

# Go to the top level Vitess dir
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd $DIR/../..

# Clean up existing container
ps=`docker ps -a | grep vitess-devel`
if [ ! -z "$ps" ] ; then
    docker kill vitess-devel
    docker rm vitess-devel
fi

# Clean up existing syncs
mutagen=`mutagen list | grep vitess-devel-src`
if [ ! -z "$mutagen" ] ; then
    mutagen terminate vitess-devel-src
fi

mutagen=`mutagen list | grep vitess-devel-bin`
if [ ! -z "$mutagen" ] ; then
    mutagen terminate vitess-devel-bin
fi
