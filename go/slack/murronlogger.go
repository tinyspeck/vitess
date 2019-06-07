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

package slack

import (
	"bytes"
	"flag"
	"fmt"
	"os"
	"time"

	"vitess.io/vitess/go/stats"
	"vitess.io/vitess/go/streamlog"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/servenv"

	murronlib "slack-github.com/slack/murron/pkg/lib"
	murronoutputs "slack-github.com/slack/murron/pkg/outputs"
	murronpb "slack-github.com/slack/murron/proto"
)

var (
	murronConfigFile = flag.String("murron_config_file", "", "If specified, enables murron logging using the agent configuration in the given file.")
	murronLogType    = flag.String("murron_querylog_type", "", "Type string for query logs sent to murron. Must be set if murron logging is enabled.")

	murronLogs   = stats.NewCounter("MurronLogs", "count of logs dispatched to the murron queue")
	murronErrors = stats.NewCountersWithSingleLabel("MurronErrors", "count of errors sending to murron by error type", "Type")

	hostname, _ = os.Hostname()
)

// MurronLoggerEnabled returns true if murron logging should be enabled
func MurronLoggerEnabled() bool {
	return *murronConfigFile != ""
}

// MurronLogger is a logger abstraction to send to murron
type MurronLogger struct {
	queue  chan *murronpb.MurronMessage
	client murronoutputs.OutputService
}

// InitMurronLogger creates a new logger to send to murron
// Should only be called with a valid config file and if log type is set
func InitMurronLogger() (*MurronLogger, error) {

	if *murronConfigFile == "" || *murronLogType == "" {
		return nil, fmt.Errorf("murron logging requires -murron_config_file and -murron_querylog_type to be set")
	}

	log.Infof("enabling %s query logging to murron", *murronLogType)

	/* Load murron configuration */
	config, err := murronlib.ReadConfig(*murronConfigFile)
	if err != nil {
		return nil, err
	}

	ml := &MurronLogger{
		queue: make(chan *murronpb.MurronMessage, config.QueueSize),
	}

	servenv.OnClose(func() {
		log.Infof("closing murron client")
		ml.client.Close()
		log.Infof("closed murron client")
	})

	ml.client = murronoutputs.NewMurronBatchClient(config.ServerAddress, config.OutboundConnections, config.ClientBatchCount, config.ClientBatchSize, config.ClientBatchTimeout, ml.queue)

	return ml, nil
}

// SendMessage sends the given message to murron
func (ml *MurronLogger) SendMessage(formatter streamlog.LogFormatter, message interface{}) {

	// TODO: this would be a great use case for a sync.Pool to avoid
	// thrashing the GC with these allocations / deallocations
	// but there's no indication from the murron client when it's done
	// processing a given message.

	var buf bytes.Buffer
	formatParams := map[string][]string{"full": {}}
	if err := formatter(&buf, formatParams, message); err != nil {
		murronErrors.Add("Format", 1)
		return
	}

	msg := &murronpb.MurronMessage{
		OriginHost: hostname,
		Timestamp:  time.Now().UnixNano(),
		Host:       hostname,
		Type:       *murronLogType,
		Message:    buf.Bytes(),
	}
	select {
	case ml.queue <- msg:
		murronLogs.Add(1)
	default:
		murronErrors.Add("QueueFull", 1)
	}
}
