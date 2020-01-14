/*
Copyright 2019 The Vitess Authors.

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

package tabletserver

import (
	"fmt"
	"net/http"

	"vitess.io/vitess/go/acl"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/vttablet/tabletmanager/vreplication"
)

// This file implements a REST-style API for the vtctld web interface.

const (
	apiPrefix = "/api/"

	jsonContentType = "application/json; charset=utf-8"
)

func httpErrorf(w http.ResponseWriter, r *http.Request, format string, args ...interface{}) {
	errMsg := fmt.Sprintf(format, args...)
	log.Errorf("HTTP error on %v: %v, request: %#v", r.URL.Path, errMsg, r)
	http.Error(w, errMsg, http.StatusInternalServerError)
}

func handleAPI(apiPath string, handlerFunc func(w http.ResponseWriter, r *http.Request) error) {
	http.HandleFunc(apiPrefix+apiPath, func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if x := recover(); x != nil {
				httpErrorf(w, r, "uncaught panic: %v", x)
			}
		}()
		if err := handlerFunc(w, r); err != nil {
			httpErrorf(w, r, "%v", err)
		}
	})
}

// InitAPI initializes api for tabletserver
func InitAPI(vrEngine *vreplication.Engine) {
	handleAPI("vdiff/start", func(w http.ResponseWriter, r *http.Request) error {
		vrEngine.RunVdiff()
		return nil
	})

	handleAPI("vdiff/abort", func(w http.ResponseWriter, r *http.Request) error {
		vrEngine.AbortVdiff()
		return nil
	})

	// Features
	handleAPI("vdiff/status", func(w http.ResponseWriter, r *http.Request) error {
		if err := acl.CheckAccessHTTP(r, acl.ADMIN); err != nil {
			http.Error(w, "403 Forbidden", http.StatusForbidden)
			return nil
		}
		resp, err := vrEngine.VDiffReportStatus()
		if err != nil {
			return fmt.Errorf("json error: %v", err)
		}
		w.Header().Set("Content-Type", jsonContentType)
		w.Write(resp)
		return nil
	})
}
