/*
Copyright 2017 Google Inc.

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
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"os/signal"
	"syscall"
	"time"

	log "github.com/golang/glog"
	"github.com/youtube/vitess/go/exit"
	"github.com/youtube/vitess/go/vt/logutil"
	"github.com/youtube/vitess/go/vt/servenv"
	"github.com/youtube/vitess/go/vt/vtexplain"
	"golang.org/x/net/context"
)

var (
	waitTime        = flag.Duration("wait-time", 24*time.Hour, "time to wait on an action")
	sqlFlag         = flag.String("sql", "", "A list of semicolon-delimited SQL commands to analyze")
	sqlFileFlag     = flag.String("sql-file", "", "Identifies the file that contains the SQL commands to analyze")
	schemaFlag      = flag.String("schema", "", "The SQL table schema")
	schemaFileFlag  = flag.String("schema_file", "", "Identifies the file that contains the SQL table schema")
	vschemaFlag     = flag.String("vschema", "", "Identifies the VTGate routing schema")
	vschemaFileFlag = flag.String("vschema_file", "", "Identifies the VTGate routing schema file")
)

func init() {
	logger := logutil.NewConsoleLogger()
	flag.CommandLine.SetOutput(logutil.NewLoggerWriter(logger))
}

// signal handling, centralized here
func installSignalHandlers(cancel func()) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-sigChan
		// we got a signal, cancel the current ctx
		cancel()
	}()
}

// getFileParam returns a string containing either flag is not "",
// or the content of the file named flagFile
func getFileParam(flag, flagFile, name string) (string, error) {
	if flag != "" {
		if flagFile != "" {
			return "", fmt.Errorf("action requires only one of %v or %v-file", name, name)
		}
		return flag, nil
	}

	if flagFile == "" {
		return "", fmt.Errorf("action requires one of %v or %v-file", name, name)
	}
	data, err := ioutil.ReadFile(flagFile)
	if err != nil {
		return "", fmt.Errorf("Cannot read file %v: %v", flagFile, err)
	}
	return string(data), nil
}

func main() {
	defer exit.RecoverAll()
	defer logutil.Flush()

	flag.Parse()

	if *servenv.Version {
		servenv.AppVersion.Print()
		os.Exit(0)
	}

	args := flag.Args()

	if len(args) != 0 {
		flag.Usage()
		exit.Return(1)
	}

	err := parseAndRun()
	if err != nil {
		fmt.Printf("ERROR: %s\n", err)
		exit.Return(1)
	}
}

func parseAndRun() error {
	sql, err := getFileParam(*sqlFlag, *sqlFileFlag, "sql")
	if err != nil {
		return err
	}

	schema, err := getFileParam(*schemaFlag, *schemaFileFlag, "schema")
	if err != nil {
		return err
	}

	vschema, err := getFileParam(*vschemaFlag, *vschemaFileFlag, "vschema")
	if err != nil {
		return err
	}

	servenv.FireRunHooks()

	log.V(100).Infof("sql %s\n", sql)
	log.V(100).Infof("schema %s\n", schema)
	log.V(100).Infof("vschema %s\n", vschema)

	_, cancel := context.WithTimeout(context.Background(), *waitTime)
	installSignalHandlers(cancel)

	vtexplain.Init(vschema)

	plans, err := vtexplain.Run(sql, schema)
	if err != nil {
		return err
	}

	planJson, err := json.MarshalIndent(plans, "", "    ")
	if err != nil {
		return err
	}
	fmt.Printf(string(planJson))
	//	fmt.Printf("%d", plans[0].Route.Opcode)

	cancel()
	return nil
}
