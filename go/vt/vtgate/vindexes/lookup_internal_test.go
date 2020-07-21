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

var (
	// ids we should use to resolve
	liTestK1 = sqltypes.NewUint64(1000)
	liTestK2 = sqltypes.NewUint64(2000)
	liTestK3 = sqltypes.NewUint64(3000)

	// how they'll be stored in cache
	liTestCK1 = liTestK1.String()
	liTestCK2 = liTestK2.String()
	liTestCK3 = liTestK3.String()

	expectedQuery = "select fromc, toc from t where fromc in ::fromc"
)

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
			bv, err := sqltypes.BuildBindVariable(v)
			if err != nil {
				t.Fatal(err)
			}
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

func TestLookupInternalLookupBatchWithoutCache(t *testing.T) {
	li := createLookupInternal(nil)
	if li == nil {
		t.Fatal("Unable to create a new lookupInternal")
	}

	cache := li.lookupCache
	if cache != nil {
		t.Errorf("Expected lookupInternal to have no cache; got non-nil")
	}

	vc := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK3, "value-1"},
				vcRow{liTestK3, "value-2"},
			),
			nil,
		},
	)
	r, err := li.Lookup(vc, []sqltypes.Value{liTestK3})
	assertNil(t, err)

	got := map[string]int{}
	for _, res := range r {
		for _, r := range res.Rows {
			got[r[0].ToString()]++
		}
	}

	want := map[string]int{
		"value-1": 1,
		"value-2": 1,
	}
	if !reflect.DeepEqual(got, want) {
		t.Errorf("Unexpected result; want %v, got %v", want, got)
	}
}

func TestLookupInternalLookupBatchWithCache(t *testing.T) {
	li := createLookupInternal(strPtr("lru"))
	if li == nil {
		t.Fatal("Unable to create a new lookupInternal")
	}

	cache := li.lookupCache
	if cache == nil {
		t.Errorf("Expected lookupInternal to have a cache; got nil")
	}
	assertCacheEmpty(t, cache)

	mkVC := func() *litVCursor {
		return newLitVCursor(
			execResult{
				newVCResult(
					vcRow{liTestK3, "value-1"},
					vcRow{liTestK3, "value-2"},
				),
				nil,
			},
		)
	}
	vc := mkVC()
	r, err := li.Lookup(vc, []sqltypes.Value{liTestK3})
	assertNil(t, err)

	assertCacheSized(t, cache, 1)
	assertCacheHasKeys(t, cache, liTestCK3)
	assertQueriesCorrect(t, vc, 1)
	assertQueryBinds(t, vc, []binds{
		binds{"fromc": []sqltypes.Value{liTestK3}},
	})

	nocacheli := createLookupInternal(nil)
	// we can reuse our vcursor here because the initial call didn't hit cache
	rUncached, _ := nocacheli.Lookup(mkVC(), []sqltypes.Value{liTestK3})

	if !reflect.DeepEqual(r, rUncached) {
		t.Errorf("Expected cached & uncached results to match:\ncached: %#v\nuncached:  %#v", r, rUncached)
		fmt.Printf("Cached\n------\n")
		debugPrintResults(r, "")
		fmt.Printf("Uncached\n-------\n")
		debugPrintResults(rUncached, "")
	}
}

func TestLookupInternalLookupBatchWithCacheUsed(t *testing.T) {
	li := createLookupInternal(strPtr("lru"))
	uncachedLI := createLookupInternal(nil)
	if li == nil {
		t.Fatal("Unable to create a new lookupInternal")
	}

	cache := li.lookupCache
	if cache == nil {
		t.Errorf("Expected lookupInternal to have a cache; got nil")
	}
	assertCacheEmpty(t, cache)

	cachedVC1 := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK2, "value-k2"},
				vcRow{liTestK3, "value-k3.a"},
				vcRow{liTestK3, "value-k3.b"},
			),
			nil,
		},
	)
	cachedVC2 := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK1, "value-k1.a"},
				vcRow{liTestK1, "value-k1.b"},
			),
			nil,
		},
	)
	// prime the cache with some values
	_, err := li.Lookup(cachedVC1, []sqltypes.Value{liTestK2, liTestK3})
	if err != nil {
		t.Fatal(err)
	}

	// assert cache is in expected state
	assertCacheSized(t, cache, 2)
	assertCacheHasKeys(t, cache, liTestCK2, liTestCK3)
	assertQueriesCorrect(t, cachedVC1, 1)
	assertQueryBinds(t, cachedVC1, []binds{
		binds{"fromc": []sqltypes.Value{liTestK2, liTestK3}},
	})

	// make a second query; use a new vcursor so we can track things independently
	r, err := li.Lookup(cachedVC2, []sqltypes.Value{liTestK2, liTestK1, liTestK3})
	if err != nil {
		t.Fatal(err)
	}

	// verify cache was updated
	assertCacheSized(t, cache, 3)
	assertCacheHasKeys(t, cache, liTestCK1, liTestCK2, liTestCK3)
	assertQueriesCorrect(t, cachedVC2, 1)
	assertQueryBinds(t, cachedVC2, []binds{
		binds{"fromc": []sqltypes.Value{liTestK1}},
	})

	unusedVC := newLitVCursor()
	r, err = li.Lookup(unusedVC, []sqltypes.Value{liTestK1, liTestK3})
	if err != nil {
		t.Fatal(err)
	}
	assertQueriesCorrect(t, unusedVC, 0)

	uncachedVC := newLitVCursor(
		execResult{
			newVCResult(
				vcRow{liTestK1, "value-k1.a"},
				vcRow{liTestK1, "value-k1.b"},
				vcRow{liTestK3, "value-k3.a"},
				vcRow{liTestK3, "value-k3.b"},
			),
			nil,
		},
	)
	rUncached, err := uncachedLI.Lookup(uncachedVC, []sqltypes.Value{liTestK1, liTestK3})
	if err != nil {
		t.Fatal(err)
	}

	if !reflect.DeepEqual(r, rUncached) {
		t.Errorf("Cached and uncached results differ\ncached: %v\nuncached: %v\n", r, rUncached)
	}
}

func TestLookupInternalLookupUnbatchedWithCache(t *testing.T) {
	// li := createLookupInternal(strPtr("lru"))
	// uncachedLI := createLookupInternal(nil)
	// if li == nil {
	// 	t.Fatal("Unable to create a new lookupInternal")
	// }

	// cache := li.lookupCache
	// if cache == nil {
	// 	t.Errorf("Expected lookupInternal to have a cache; got nil")
	// }
	// assertCacheEmpty(t, cache)

	// cachedVC1 := newLitVCursor(
	// 	execResult{
	// 		newVCResult(
	// 			vcRow{liTestK2, "value-k2"},
	// 			vcRow{liTestK3, "value-k3.a"},
	// 			vcRow{liTestK3, "value-k3.b"},
	// 		),
	// 		nil,
	// 	},
	// )
	// cachedVC2 := newLitVCursor(
	// 	execResult{
	// 		newVCResult(
	// 			vcRow{liTestK1, "value-k1.a"},
	// 			vcRow{liTestK1, "value-k1.b"},
	// 		),
	// 		nil,
	// 	},
	// )
	// // prime the cache with some values
	// _, err := li.Lookup(cachedVC1, []sqltypes.Value{liTestK2, liTestK3})
	// if err != nil {
	// 	t.Fatal(err)
	// }

	// // assert cache is in expected state
	// assertCacheSized(t, cache, 2)
	// assertCacheHasKeys(t, cache, liTestCK2, liTestCK3)
	// assertQueriesCorrect(t, cachedVC1, 1)
	// assertQueryBinds(t, cachedVC1, []binds{
	// 	binds{"fromc": []sqltypes.Value{liTestK2, liTestK3}},
	// })

	// // make a second query; use a new vcursor so we can track things independently
	// r, err := li.Lookup(cachedVC2, []sqltypes.Value{liTestK2, liTestK1, liTestK3})
	// if err != nil {
	// 	t.Fatal(err)
	// }

	// // verify cache was updated
	// assertCacheSized(t, cache, 3)
	// assertCacheHasKeys(t, cache, liTestCK1, liTestCK2, liTestCK3)
	// assertQueriesCorrect(t, cachedVC2, 1)
	// assertQueryBinds(t, cachedVC2, []binds{
	// 	binds{"fromc": []sqltypes.Value{liTestK1}},
	// })

	// unusedVC := newLitVCursor()
	// r, err = li.Lookup(unusedVC, []sqltypes.Value{liTestK1, liTestK3})
	// if err != nil {
	// 	t.Fatal(err)
	// }
	// assertQueriesCorrect(t, unusedVC, 0)

	// uncachedVC := newLitVCursor(
	// 	execResult{
	// 		newVCResult(
	// 			vcRow{liTestK1, "value-k1.a"},
	// 			vcRow{liTestK1, "value-k1.b"},
	// 			vcRow{liTestK3, "value-k3.a"},
	// 			vcRow{liTestK3, "value-k3.b"},
	// 		),
	// 		nil,
	// 	},
	// )
	// rUncached, err := uncachedLI.Lookup(uncachedVC, []sqltypes.Value{liTestK1, liTestK3})
	// if err != nil {
	// 	t.Fatal(err)
	// }

	// if !reflect.DeepEqual(r, rUncached) {
	// 	t.Errorf("Cached and uncached results differ\ncached: %v\nuncached: %v\n", r, rUncached)
	// }
}
