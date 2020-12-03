package main

import (
	"encoding/json"
	"net/http"
	"strconv"

	_ "vitess.io/vitess/go/vt/servenv"
	"vitess.io/vitess/go/vt/vtadmin/fakecluster"
)

type API struct {
	clusters map[string]*fakecluster.VRepStreamFactory
}

func (api *API) getStream(w http.ResponseWriter, req *http.Request) {
	id := req.URL.Query().Get("id")
	iid, err := strconv.Atoi(id)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	cn := req.URL.Query().Get("cluster")
	cluster, ok := api.clusters[cn]
	if !ok {
		http.NotFound(w, req)
		return
	}

	stream := cluster.Streams()[iid-1]
	if stream == nil {
		http.NotFound(w, req)
		return
	}

	data, err := json.Marshal(&stream)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Add("content-type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Write(data)
}

func (api *API) getStreams(w http.ResponseWriter, req *http.Request) {
	name := req.URL.Query().Get("cluster")
	cluster, ok := api.clusters[name]
	if !ok {
		http.NotFound(w, req)
		return
	}

	streams := cluster.Streams()
	data, err := json.Marshal(&streams)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("content-type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Write(data)
}

func (api *API) getClusters(w http.ResponseWriter, req *http.Request) {
	names := make([]string, len(api.clusters))
	i := 0
	for k := range api.clusters {
		names[i] = k
		i++
	}

	data, err := json.Marshal(&names)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Add("content-type", "application/json")
	w.Header().Add("Access-Control-Allow-Origin", "*")
	w.Write(data)
}

func main() {

	api := &API{
		clusters: map[string]*fakecluster.VRepStreamFactory{
			"dev": &fakecluster.VRepStreamFactory{
				Cluster:               "dev",
				DefaultKeyspaceShards: []string{"-"},
				Keyspaces:             []string{"users", "messages"},
			},
			"prod": &fakecluster.VRepStreamFactory{
				Cluster:               "prod",
				DefaultKeyspaceShards: []string{"-40", "40-80", "80-c0", "c0-"},
				Keyspaces:             []string{"users", "messages"},
			},
		},
	}

	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) { w.Write([]byte("ok")) })
	http.HandleFunc("/clusters", api.getClusters)
	http.HandleFunc("/vrep/streams", api.getStreams)
	http.HandleFunc("/vrep/stream", api.getStream)
	http.ListenAndServe(":80", nil)
}
