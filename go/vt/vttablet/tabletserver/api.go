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
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"strings"

	"vitess.io/vitess/go/acl"
	"vitess.io/vitess/go/vt/log"
	"vitess.io/vitess/go/vt/topo"
	"vitess.io/vitess/go/vt/vtctl"
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

func handleCollection(collection string, getFunc func(*http.Request) (interface{}, error)) {
	handleAPI(collection+"/", func(w http.ResponseWriter, r *http.Request) error {
		// Get the requested object.
		obj, err := getFunc(r)
		if err != nil {
			if topo.IsErrType(err, topo.NoNode) {
				http.NotFound(w, r)
				return nil
			}
			return fmt.Errorf("can't get %v: %v", collection, err)
		}

		// JSON encode response.
		data, err := vtctl.MarshalJSON(obj)
		if err != nil {
			return fmt.Errorf("cannot marshal data: %v", err)
		}
		w.Header().Set("Content-Type", jsonContentType)
		w.Write(data)
		return nil
	})
}

func getItemPath(url string) string {
	// Strip API prefix.
	if !strings.HasPrefix(url, apiPrefix) {
		return ""
	}
	url = url[len(apiPrefix):]

	// Strip collection name.
	parts := strings.SplitN(url, "/", 2)
	if len(parts) != 2 {
		return ""
	}
	return parts[1]
}

func unmarshalRequest(r *http.Request, v interface{}) error {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, v)
}

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
