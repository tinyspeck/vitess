/*
Copyright 2021 The Vitess Authors.

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

package vtgate

import (
	"context"
	"errors"
	"testing"

	"github.com/golang/mock/gomock"
	"github.com/stretchr/testify/assert"
)

// TestWaitForTabletsNoError tests for no errors in the happy path
func TestWaitForTabletsNoError(t *testing.T) {
	m := mkMockGateway(t)
	m.EXPECT().WaitForTablets(gomock.Any(), gomock.Any()).Return(nil)
	res := WaitForTablets(m, nil)
	assert.Nil(t, res)
}

// TestWaitForTabletsPassesThroughError tests for non-DeadlineExceeded errors
func TestWaitForTabletsPassesThroughError(t *testing.T) {
	m := mkMockGateway(t)
	err := errors.New("whoops")
	m.EXPECT().WaitForTablets(gomock.Any(), gomock.Any()).Return(err)
	res := WaitForTablets(m, nil)
	assert.Equal(t, res, err)
}

// TestWaitForTabletsReturnsNilWhenSpecified tests default behavior when wait times out
func TestWaitForTabletsReturnsNilWhenSpecified(t *testing.T) {
	*errorOnInitialTabletTimeout = false
	m := mkMockGateway(t)
	m.EXPECT().WaitForTablets(gomock.Any(), gomock.Any()).Return(context.DeadlineExceeded)
	res := WaitForTablets(m, nil)
	assert.Nil(t, res)
}

// TestWaitForTabletsReturnsErrorWhenSpecified tests that error is returned when underlying
// wait for tablets times out
func TestWaitForTabletsReturnsErrorWhenSpecified(t *testing.T) {
	*errorOnInitialTabletTimeout = true
	m := mkMockGateway(t)
	m.EXPECT().WaitForTablets(gomock.Any(), gomock.Any()).Return(context.DeadlineExceeded)
	res := WaitForTablets(m, nil)
	assert.NotNil(t, res)
}

func mkMockGateway(t *testing.T) *MockGateway {
	ctrl := gomock.NewController(t)
	return NewMockGateway(ctrl)
}
