#!/bin/sh

#
# Clone the php bindings to create the hh ones
#
if [ ! -d php ] ; then
        echo "Script must be run in the root source directory"
        exit 1
fi

mkdir -p hh
rsync -rav php/ hh/

for f in `find hh -name \*.php` ; do
        fnew=$(echo $f | sed 's/.php$/.hh/')
        mv $f $fnew
        sed -i '' 's/<?php/<?hh/' $fnew
done