package vindexes

import (
	"fmt"
	"testing"

	"vitess.io/vitess/go/cache"
	"vitess.io/vitess/go/sqltypes"
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

func assertQueryBinds(t *testing.T, vc *litVCursor, wantBinds map[string]interface{}) {
	bound, err := sqltypes.BuildBindVariables(wantBinds)
	if err != nil {
		t.Fatal(err)
	}
}

func TestLookupInternalLookupWithoutCache(t *testing.T) {
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
	debugPrintResults(r, "")
}

func TestLookupInternalLookupWithCache(t *testing.T) {
	li := createLookupInternal(strPtr("lru"))
	if li == nil {
		t.Fatal("Unable to create a new lookupInternal")
	}

	cache := li.lookupCache
	if cache == nil {
		t.Errorf("Expected lookupInternal to have a cache; got nil")
	}
	assertCacheEmpty(t, cache)

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

	assertCacheSized(t, cache, 1)
	assertCacheHasKeys(t, cache, liTestCK3)
	assertQueriesCorrect(t, vc, 1)

	for i, q := range vc.queries {
		fmt.Printf("query: %q\n", q)
		fmt.Printf("binds: %v\n", vc.bindvars[i])
	}

	debugDumpCache(cache)
	debugPrintResults(r, "")
}
