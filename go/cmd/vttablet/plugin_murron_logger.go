/*
Copyright 2018 Slack Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package main

import (
	"flag"
	"fmt"

	"vitess.io/vitess/go/streamlog"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/servenv"
	"vitess.io/vitess/go/vt/vttablet/tabletserver/tabletenv"
)

var (
	murronServerName = flag.String("murron_server", "", "Enable query logging to the specified murron server")
)

func init() {
	servenv.OnRun(func() {
		if *murronServerName != "" {
			initMurron(*murronServerName)
		}
	})
}

func initMurron(server string) {
	log.Infof("enabling query logging to murron server %s", server)

	// TODO: initialize murron connection here

	logChan := tabletenv.StatsLogger.Subscribe("Murron")
	formatParams := map[string][]string{"full": {}}
	formatter := streamlog.GetFormatter(tabletenv.StatsLogger)

	go func() {
		for {
			record := <-logChan
			message := formatter(formatParams, record)

			// TODO: actually send logs to murron here
			fmt.Printf("SENDING TO MURRON: %s\n", message)
		}
	}()
}
