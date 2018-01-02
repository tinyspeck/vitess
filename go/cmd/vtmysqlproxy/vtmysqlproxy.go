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

// vt tablet server: Serves queries and performs housekeeping jobs.
package main

import (
	"flag"
	"os"

	log "github.com/golang/glog"
	"github.com/youtube/vitess/go/vt/dbconfigs"
	"github.com/youtube/vitess/go/vt/servenv"
	"github.com/youtube/vitess/go/vt/vtmysqlproxy"
	"github.com/youtube/vitess/go/vt/vttablet/tabletserver/tabletenv"
)

var (
	enforceTableACLConfig = flag.Bool("enforce-tableacl-config", false, "if this flag is true, vttablet will fail to start if a valid tableacl config does not exist")
	tableACLConfig        = flag.String("table-acl-config", "", "path to table access checker config file")

	mysqlSocketFile = flag.String("mysql-socket-file", "", "path to unix socket file to connect to mysql")
)

func init() {
	servenv.RegisterDefaultFlags()
}

func main() {
	dbconfigFlags := dbconfigs.AppConfig | dbconfigs.AppDebugConfig
	dbconfigs.RegisterFlags(dbconfigFlags)
	flag.Parse()

	if *servenv.Version {
		servenv.AppVersion.Print()
		os.Exit(0)
	}

	if len(flag.Args()) > 0 {
		flag.Usage()
		log.Exit("vtmysqlproxy doesn't take any positional arguments")
	}
	if err := tabletenv.VerifyConfig(); err != nil {
		log.Exitf("invalid config: %v", err)
	}

	tabletenv.Init()

	servenv.Init()

	dbcfgs, err := dbconfigs.Init(*mysqlSocketFile, dbconfigFlags)
	if err != nil {
		log.Fatal(err)
	}

	if *enforceTableACLConfig && *tableACLConfig != "" {
		log.Exit("table acl config has to be specified with table-acl-config flag because enforce-tableacl-config is set.")
	}

	err = vtmysqlproxy.Init(dbcfgs, *tableACLConfig)
	if err != nil {
		log.Exitf("error initializing proxy: %v", err)
	}

	servenv.RunDefault()
}
