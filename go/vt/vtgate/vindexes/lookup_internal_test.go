package vindexes

import (
	"fmt"
	"reflect"
	"testing"

	"vitess.io/vitess/go/cache"
	"vitess.io/vitess/go/sqltypes"
	querypb "vitess.io/vitess/go/vt/proto/query"
)

func createLookupInternal(cc *string) *lookupInternal {
	li := &lookupInternal{}

	params := map[string]string{
		"table": "t",
		"from":  "fromc",
		"to":    "toc",
	}
	if cc != nil {
		params["cache_config"] = *cc
	}

	li.Init(params, false, false)
	return li
}

func strPtr(s string) *string { return &s }

func assertCacheEmpty(t *testing.T, c *cache.LRUCache) {
	assertCacheSized(t, c, 0)
}

func assertCacheSized(t *testing.T, c *cache.LRUCache, sz int) {
	if c.Size() != int64(sz) {
		t.Errorf("Expected cache to have %v elements; had %v elements", sz, c.Size())
	}
}

func assertCacheHasKeys(t *testing.T, c *cache.LRUCache, keys ...string) {
	for _, k := range keys {
		if _, ok := c.Peek(k); !ok {
			t.Errorf("Expected Cache to have %v but it did not", k)
		}
	}
	assertCacheSized(t, c, len(keys))
}

func assertNil(t *testing.T, i interface{}) {
	if i != nil {
		t.Errorf("Expected nil, got %v", i)
	}
}

func debugPrintResult(result *sqltypes.Result, spacer string) {
	fmt.Printf("%sRows {\n", spacer)
	for _, row := range result.Rows {
		fmt.Printf("%s  [", spacer)
		for i, v := range row {
			if i != 0 {
				fmt.Printf(", ")
			}
			fmt.Printf("%v", v.String())
		}
		fmt.Printf("]\n")
	}
	fmt.Printf("%s}\n", spacer)

}

func debugPrintResults(result []*sqltypes.Result, spacer string) {
	for _, ele := range result {
		debugPrintResult(ele, spacer)
	}
}

func debugDumpCache(c *cache.LRUCache) {
	fmt.Printf("Cache {\n")
	for _, k := range c.Keys() {
		fmt.Printf("  - %s:\n", k)
		v, _ := c.Peek(k)
		c := v.(cacheItem).content
		debugPrintResult(c, "    ")
	}
	fmt.Printf("}\n")
}

func assertQueriesCorrect(t *testing.T, vc *litVCursor, wantCnt int) {
	matches := 0
	mismatched := []string{}
	for _, q := range vc.queries {
		if q != expectedQuery {
			mismatched = append(mismatched, q)
		} else {
			matches++
		}
	}

	if matches != wantCnt {
		t.Errorf("Expected %v queries, got %v", wantCnt, matches)
	}
	for _, q := range mismatched {
		t.Errorf("Unexpected Query: %v", q)
	}
}

type binds map[string][]sqltypes.Value

func assertQueryBinds(t *testing.T, vc *litVCursor, wantBinds []binds) {
	wantBindsArr := []map[string]*querypb.BindVariable{}

	for _, b := range wantBinds {
		bound := map[string]*querypb.BindVariable{}
		for k, v := range b {
			bv := sqltypes.ValueBindVariable(v[0])
			bound[k] = bv
		}
		wantBindsArr = append(wantBindsArr, bound)
	}

	if len(vc.bindvars) != len(wantBinds) {
		t.Errorf("Expected %v bindvars got %v", len(vc.bindvars), len(wantBinds))
	}
	for i, bv := range vc.bindvars {
		if !reflect.DeepEqual(bv, wantBindsArr[i]) {
			t.Errorf("Bind %v: want %v, got %v", i, wantBindsArr[i], bv)
		}
	}
}

var (
	// ids we should use to resolve
	liTestK4 = sqltypes.NewFloat64(float64(4000))
	liTestK5 = sqltypes.NewFloat64(float64(5000))
	liTestK6 = sqltypes.NewFloat64(float64(6000))

	// how they'll be stored in cache
	liTestCK4 = liTestK4.String()
	liTestCK5 = liTestK5.String()
	liTestCK6 = liTestK6.String()

	expectedQuery = "select toc from t where fromc = :fromc"
)

func TestLookupInternalLookupUnbatchedWithCache(t *testing.T) {
	uncachedLI := createLookupInternal(nil)
	if uncachedLI == nil || uncachedLI.lookupCache != nil {
		t.Fatal("Expected uncached lookupInternal but failed to create one")
	}
	li := createLookupInternal(strPtr("lru"))
	if li == nil {
		t.Fatal("Unable to create a new lookupInternal")
	}

	cache := li.lookupCache
	if cache == nil {
		t.Errorf("Expected lookupInternal to have a cache; got nil")
	}
	assertCacheEmpty(t, cache)

	// queried with liTestK4 and liTestK6
	cachedVC1 := newLitVCursor(
		execResult{
			newVCResult(vcRow{liTestK4, "value-k4"}),
			nil,
		},
		execResult{
			newVCResult(
				vcRow{liTestK6, "value-k6.a"},
				vcRow{liTestK6, "value-k6.b"},
			),
			nil,
		},
	)

	// prime the cache with some values
	_, err := li.Lookup(cachedVC1, []sqltypes.Value{liTestK4, liTestK6})
	if err != nil {
		t.Fatal(err)
	}

	// assert cache is in expected state
	assertCacheSized(t, cache, 2)
	assertCacheHasKeys(t, cache, liTestCK4, liTestCK6)
	assertQueriesCorrect(t, cachedVC1, 2)
	assertQueryBinds(t, cachedVC1, []binds{
		binds{"fromc": []sqltypes.Value{liTestK4}},
		binds{"fromc": []sqltypes.Value{liTestK6}},
	})

	// queried with liTestK4 (cached), liTestK5, liTestK6 (cached)
	cachedVC2 := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK5, "value-k5.a"},
				vcRow{liTestK5, "value-k5.b"},
			),
			nil,
		},
	)

	// make a second query; use a new vcursor so we can track things independently
	r, err := li.Lookup(cachedVC2, []sqltypes.Value{liTestK4, liTestK5, liTestK6})
	if err != nil {
		t.Fatal(err)
	}

	// verify cache was updated
	assertCacheSized(t, cache, 3)
	assertCacheHasKeys(t, cache, liTestCK4, liTestCK5, liTestCK6)
	assertQueriesCorrect(t, cachedVC2, 1)
	assertQueryBinds(t, cachedVC2, []binds{
		binds{"fromc": []sqltypes.Value{liTestK5}},
	})

	unusedVC := newLitVCursor()
	r, err = li.Lookup(unusedVC, []sqltypes.Value{liTestK4, liTestK6})
	if err != nil {
		t.Fatal(err)
	}
	assertQueriesCorrect(t, unusedVC, 0)

	// queried with liTestK4, liTestK6
	uncachedVC := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK4, "value-k4"},
			),
			nil,
		},
		execResult{
			newVCResult(
				vcRow{liTestK6, "value-k6.a"},
				vcRow{liTestK6, "value-k6.b"},
			),
			nil,
		},
	)
	rUncached, err := uncachedLI.Lookup(uncachedVC, []sqltypes.Value{liTestK4, liTestK6})
	if err != nil {
		t.Fatal(err)
	}
	assertQueryBinds(t, uncachedVC, []binds{
		binds{"fromc": []sqltypes.Value{liTestK4}},
		binds{"fromc": []sqltypes.Value{liTestK6}},
	})

	if !reflect.DeepEqual(r, rUncached) {
		t.Errorf("Cached and uncached results differ\ncached: %v\nuncached: %v\n", r, rUncached)
		fmt.Printf("Cached\n")
		debugPrintResults(r, "  ")
		fmt.Printf("\nUncached\n")
		debugPrintResults(rUncached, "  ")
	}
}
