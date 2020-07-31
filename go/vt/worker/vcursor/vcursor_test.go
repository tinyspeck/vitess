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

package vcursor

import (
	"testing"

	gomock "github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
	"golang.org/x/net/context"

	"vitess.io/vitess/go/sqltypes"
	"vitess.io/vitess/go/vt/vtgate/vindexes"
	"vitess.io/vitess/go/vt/vtgate/vtgateconn"

	vtgatepb "vitess.io/vitess/go/vt/proto/vtgate"
)

// Since we're not invoking the package registration, we mimic it here.
func registerGrpcDialer(t *testing.T, expectedAddr string, impl vtgateconn.Impl) {
	vtgateconn.RegisterDialer(
		"grpc",
		func(c context.Context, address string) (vtgateconn.Impl, error) {
			assert.Equal(t, expectedAddr, address)
			assert.Equal(t, context.Background(), c)

			return impl, nil
		},
	)
}

// Make some basic assertions on a call to NewVCursor that expected to return non-error
// results
func getAndAssertNewVCursor(
	t *testing.T,
	ctx context.Context,
	hostPortString, targetString string,
) (vindexes.VCursor, CleanupFunc) {
	vcursor, closeFn, err := NewVCursor(ctx, hostPortString, targetString)
	assert.Nil(t, err)
	assert.NotNil(t, vcursor)
	assert.NotNil(t, closeFn)

	return vcursor, closeFn
}

func TestVCursorWithNoDialer(t *testing.T) {
	_, _, err := NewVCursor(context.Background(), "doesn't matter", "really doesn't matter")
	assert.NotNil(t, err)
	assert.Contains(t, err.Error(), "no dialer registered")
}

func TestVCursorCloseFn(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mi := vtgateconn.NewMockImpl(ctrl)

	expectedAddr := "255.255.255.255"
	registerGrpcDialer(t, expectedAddr, mi)
	_, closeFn := getAndAssertNewVCursor(
		t,
		context.Background(),
		"255.255.255.255",
		"really doesn't matter",
	)

	mi.EXPECT().Close()
	closeFn()
}

func TestVCursorExecuteKeyspaceIDReturnsErr(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mi := vtgateconn.NewMockImpl(ctrl)

	expectedAddr := "255.255.255.255"
	registerGrpcDialer(t, expectedAddr, mi)
	vc, _ := getAndAssertNewVCursor(
		t,
		context.Background(),
		"255.255.255.255",
		"really doesn't matter",
	)

	res, err := vc.ExecuteKeyspaceID(
		"keyspace",
		nil,
		"query",
		nil,
		false,
		false,
	)

	assert.Nil(t, res)
	assert.Contains(
		t,
		err.Error(),
		"Unexpected call to `ExecuteKeyspaceId` for keyspace keyspace",
	)
}

func TestVCursorExecute(t *testing.T) {
	ctrl := gomock.NewController(t)
	defer ctrl.Finish()
	mi := vtgateconn.NewMockImpl(ctrl)

	registerGrpcDialer(t, "255.255.255.255", mi)
	vc, _ := getAndAssertNewVCursor(
		t,
		context.Background(),
		"255.255.255.255",
		"really doesn't matter",
	)

	expectedRes := &sqltypes.Result{
		RowsAffected: 100,
		InsertID:     123,
	}
	mi.EXPECT().Execute(
		gomock.Eq(context.Background()),
		gomock.Any(),
		gomock.Eq("query"),
		nil,
	).Return(nil, expectedRes, nil)

	actualRes, err := vc.Execute(
		"method",
		"query",
		nil,   // bindVars map[string]*querypb.BindVariable,
		false, // isDML
		vtgatepb.CommitOrder_NORMAL,
	)

	assert.NotNil(t, actualRes)
	assert.Nil(t, err)
	assert.Same(t, expectedRes, actualRes)
}
