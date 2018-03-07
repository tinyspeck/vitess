package prombackend

import (
	"net/http"

	log "github.com/golang/glog"

	prom "github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

// A registry of promCounters keyed by metric name
var promCounters = make(map[string]*prom.CounterVec)

func init() {
	http.Handle("/metrics", promhttp.Handler())
}

func NewCounter(name string, help string, labels []string) *prom.CounterVec {
	counter := prom.NewCounterVec(prom.CounterOpts{
		Name: name,
		Help: help,
	}, labels)

	// TODO: What about concurrent calls? :/
	// add lock around MustRegister / and managing internal registry
	if _, ok := promCounters[name]; ok {
		log.Fatalf("Counter with name %v already exists", name)
	}
	prom.MustRegister(counter)

	promCounters[name] = counter

	return counter
}

func Add(name string, label_values []string, value int64) {
	// TODO: figure out how to support int64 (expvar) => float64 conversion here
	promCounters[name].WithLabelValues(label_values...).Add(1)
}
