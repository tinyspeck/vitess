#!/bin/bash

if [ "$(id -u)" -ne 0 ];
then
  exec sudo -E "$0" "$@"
fi

echo "Hello from vtadmin-api"

exec /usr/local/bin/vtadmin
