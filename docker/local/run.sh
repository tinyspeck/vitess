#!/bin/bash

docker run -p 15000-15200:15000-15200 -p 15991:15991 -p 15999:15999 --rm -it vitess/local
