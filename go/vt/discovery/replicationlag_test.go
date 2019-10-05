/*
Copyright 2017 Google Inc.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreedto in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

package discovery

import (
	"fmt"
	"testing"

	querypb "vitess.io/vitess/go/vt/proto/query"
	"vitess.io/vitess/go/vt/topo"
)

// testSetMinNumTablets is a test helper function, if this is used by a production code path, something is wrong.
func testSetMinNumTablets(newMin int) {
	*minNumTablets = newMin
}

func TestFilterByReplicationLagUnhealthy(t *testing.T) {
	// 1 healthy serving tablet, 1 not healhty
	ts1 := &TabletStats{
		Tablet:  topo.NewTablet(1, "cell", "host1"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{},
	}
	ts2 := &TabletStats{
		Tablet:  topo.NewTablet(2, "cell", "host2"),
		Serving: false,
		Stats:   &querypb.RealtimeStats{},
	}
	got := FilterByReplicationLag([]*TabletStats{ts1, ts2})
	if len(got) != 1 {
		t.Errorf("len(FilterByReplicationLag([{Tablet: {Uid: 1}, Serving: true}, {Tablet: {Uid: 2}, Serving: false}])) = %v, want 1", len(got))
	}
	if len(got) > 0 && !got[0].DeepEqual(ts1) {
		t.Errorf("FilterByReplicationLag([{Tablet: {Uid: 1}, Serving: true}, {Tablet: {Uid: 2}, Serving: false}]) = %+v, want %+v", got[0], ts1)
	}
}

func TestFilterByReplicationLag(t *testing.T) {
	cases := []struct {
		description string
		input       []uint32
		output      []uint32
	}{
		{
			"0 tablet",
			[]uint32{},
			[]uint32{},
		},
		{
			"1 serving tablet",
			[]uint32{10},
			[]uint32{10},
		},
		{
			"lag of (3h) -- but only one so we return it",
			[]uint32{60 * 60 * 3},
			[]uint32{60 * 60 * 3},
		},
		{
			"lags of (10s 15s 25s) -- all within low watermark",
			[]uint32{10, 15, 25},
			[]uint32{10, 15, 25},
		},
		{
			"lags of (2m, 3m, 1h) -- a single very lagged replica",
			[]uint32{60 * 2, 60 * 3, 60 * 60},
			[]uint32{60 * 2, 60 * 3},
		},
		{
			"lags of (2m, 50m, 2h) -- more of a distribution of lag. worst one removed",
			[]uint32{60 * 2, 60 * 50, 60 * 60 * 2},
			[]uint32{60 * 2, 60 * 50},
		},
		{
			"lags of (2m, 50m, 50m) -- two pretty lagged but no outliers",
			[]uint32{60 * 2, 60 * 50, 60 * 50},
			[]uint32{60 * 2, 60 * 50, 60 * 50},
		},
		{
			"lags of (1h, 2h, 3h) -- all severely lagged but not outliers",
			[]uint32{60 * 60, 60 * 60 * 2, 60 * 60 * 3},
			[]uint32{60 * 60, 60 * 60 * 2, 60 * 60 * 3},
		},
		{
			"lags of (1m, 3h) -- one considerably lagged, below minNumThreshold",
			[]uint32{1 * 60, 3 * 60 * 60},
			[]uint32{1 * 60},
		},
		{
			"lags of (1m, 100m) -- one considerably lagged but would result in minNumThreshold violation and below high threshold",
			[]uint32{1 * 60, 100 * 60},
			[]uint32{1 * 60, 100 * 60},
		},
		{
			"lags of (1m, 3h) - one considerably lagged would result in minNumThreshold but above high threshold",
			[]uint32{1 * 60, 3 * 60 * 60},
			[]uint32{1 * 60},
		},
		{
			"lags of (3h, 4h) -- all considerably lagged but removing would result in 0 left so returning all",
			[]uint32{3 * 60 * 60, 4 * 60 * 60},
			[]uint32{3 * 60 * 60, 4 * 60 * 60},
		},
		{
			"lags of (3h, 30h) - all above high watermark and vastly different but removing would result in 0 left so returning all",
			[]uint32{3 * 60 * 60, 30 * 60 * 60},
			[]uint32{3 * 60 * 60, 30 * 60 * 60},
		},
	}

	for _, tc := range cases {
		lts := make([]*TabletStats, len(tc.input))
		for i, lag := range tc.input {
			lts[i] = &TabletStats{
				Tablet:  topo.NewTablet(uint32(i+1), "cell", fmt.Sprintf("host-%vs-behind", lag)),
				Serving: true,
				Stats:   &querypb.RealtimeStats{SecondsBehindMaster: lag},
			}
		}
		got := FilterByReplicationLag(lts)
		if len(got) != len(tc.output) {
			t.Errorf("FilterByReplicationLag(%v) failed: got output:\n%v\nExpected: %v", tc.description, got, tc.output)
			continue
		}
		for i, elag := range tc.output {
			if got[i].Stats.SecondsBehindMaster != elag {
				t.Errorf("FilterByReplicationLag(%v) failed: got output:\n%v\nExpected value index %v to be %v", tc.description, got, i, elag)
			}
		}
	}
}

func TestFilterByReplicationLagThreeTabletMin(t *testing.T) {
	// Use at least 3 tablets if possible
	testSetMinNumTablets(3)
	// lags of (1s, 1s, 10m, 11m) - returns at least32 items where the slightly delayed ones that are returned are the 10m and 11m ones.
	ts1 := &TabletStats{
		Tablet:  topo.NewTablet(1, "cell", "host1"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1},
	}
	ts2 := &TabletStats{
		Tablet:  topo.NewTablet(2, "cell", "host2"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1},
	}
	ts3 := &TabletStats{
		Tablet:  topo.NewTablet(3, "cell", "host3"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 10 * 60},
	}
	ts4 := &TabletStats{
		Tablet:  topo.NewTablet(4, "cell", "host4"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 11 * 60},
	}
	got := FilterByReplicationLag([]*TabletStats{ts1, ts2, ts3, ts4})
	if len(got) != 3 || !got[0].DeepEqual(ts1) || !got[1].DeepEqual(ts2) || !got[2].DeepEqual(ts3) {
		t.Errorf("FilterByReplicationLag([1s, 1s, 10m, 11m]) = %+v, want [1s, 1s, 10m]", got)
	}
	// lags of (11m, 10m, 1s, 1s) - reordered tablets returns the same 3 items where the slightly delayed one that is returned is the 10m and 11m ones.
	ts1 = &TabletStats{
		Tablet:  topo.NewTablet(1, "cell", "host1"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 11 * 60},
	}
	ts2 = &TabletStats{
		Tablet:  topo.NewTablet(2, "cell", "host2"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 10 * 60},
	}
	ts3 = &TabletStats{
		Tablet:  topo.NewTablet(3, "cell", "host3"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1},
	}
	ts4 = &TabletStats{
		Tablet:  topo.NewTablet(4, "cell", "host4"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1},
	}
	got = FilterByReplicationLag([]*TabletStats{ts1, ts2, ts3, ts4})
	if len(got) != 3 || !got[0].DeepEqual(ts3) || !got[1].DeepEqual(ts4) || !got[2].DeepEqual(ts2) {
		t.Errorf("FilterByReplicationLag([1s, 1s, 10m, 11m]) = %+v, want [1s, 1s, 10m]", got)
	}
	// Reset to the default
	testSetMinNumTablets(2)
}

func TestFilterByReplicationLagOneTabletMin(t *testing.T) {
	// Use at least 1 tablets if possible
	testSetMinNumTablets(1)
	// lags of (1s, 100m) - return only healthy tablet if that is all that is available.
	ts1 := &TabletStats{
		Tablet:  topo.NewTablet(1, "cell", "host1"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1},
	}
	ts2 := &TabletStats{
		Tablet:  topo.NewTablet(2, "cell", "host2"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 100 * 60},
	}
	got := FilterByReplicationLag([]*TabletStats{ts1, ts2})
	if len(got) != 1 || !got[0].DeepEqual(ts1) {
		t.Errorf("FilterByReplicationLag([1s, 100m]) = %+v, want [1s]", got)
	}
	// lags of (1m, 100m) - return only healthy tablet if that is all that is healthy enough.
	ts1 = &TabletStats{
		Tablet:  topo.NewTablet(1, "cell", "host1"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 1 * 60},
	}
	ts2 = &TabletStats{
		Tablet:  topo.NewTablet(2, "cell", "host2"),
		Serving: true,
		Stats:   &querypb.RealtimeStats{SecondsBehindMaster: 100 * 60},
	}
	got = FilterByReplicationLag([]*TabletStats{ts1, ts2})
	if len(got) != 1 || !got[0].DeepEqual(ts1) {
		t.Errorf("FilterByReplicationLag([1m, 100m]) = %+v, want [1m]", got)
	}
	// Reset to the default
	testSetMinNumTablets(2)
}

func TestTrivialStatsUpdate(t *testing.T) {
	// Note the healthy threshold is set to 30s.
	cases := []struct {
		o        uint32
		n        uint32
		expected bool
	}{
		// both are under 30s
		{o: 0, n: 1, expected: true},
		{o: 15, n: 20, expected: true},

		// one is under 30s, the other isn't
		{o: 2, n: 40, expected: false},
		{o: 40, n: 10, expected: false},

		// both are over 30s, but close enough
		{o: 100, n: 100, expected: true},
		{o: 100, n: 105, expected: true},
		{o: 105, n: 100, expected: true},

		// both are over 30s, but too far
		{o: 100, n: 120, expected: false},
		{o: 120, n: 100, expected: false},
	}

	for _, c := range cases {
		o := &TabletStats{
			Stats: &querypb.RealtimeStats{
				SecondsBehindMaster: c.o,
			},
		}
		n := &TabletStats{
			Stats: &querypb.RealtimeStats{
				SecondsBehindMaster: c.n,
			},
		}
		got := TrivialStatsUpdate(o, n)
		if got != c.expected {
			t.Errorf("TrivialStatsUpdate(%v, %v) = %v, expected %v", c.o, c.n, got, c.expected)
		}
	}
}
