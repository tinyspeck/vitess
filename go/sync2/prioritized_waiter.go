/*
Copyright 2017 Google Inc.

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

package sync2

// What's in a name? Channels have all you need to emulate a counting
// semaphore with a boatload of extra functionality. However, in some
// cases, you just want a familiar API.

import (
	"container/heap"
	"fmt"
	"sync"
	"time"

	"github.com/aerospike/aerospike-client-go/types/atomic"
)

type waiter struct {
	wake     chan bool
	priority int
}

func (w waiter) String() string {
	return fmt.Sprintf("%v", w.priority)
}

type PriorityQueue []*waiter

func (pq PriorityQueue) Len() int { return len(pq) }

func (pq PriorityQueue) Less(i, j int) bool {
	return pq[i].priority < pq[j].priority
}

func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}

func (pq *PriorityQueue) Push(x interface{}) {
	item := x.(*waiter)
	*pq = append(*pq, item)
}

func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	item := old[n-1]
	*pq = old[0 : n-1]
	return item
}

type PrioritizedWaiter struct {
	timeout  time.Duration
	waiters  PriorityQueue
	mu       sync.Mutex
	capacity int
	inUse    atomic.AtomicInt
}

// NewSemaphore creates a Semaphore. The count parameter must be a positive
// number. A timeout of zero means that there is no timeout.
func NewPrioritizedWaiter(count int, timeout time.Duration) *PrioritizedWaiter {
	pw := &PrioritizedWaiter{
		timeout:  timeout,
		capacity: count,
		waiters:  make(PriorityQueue, 0),
	}
	pw.inUse.Set(0)
	heap.Init(&pw.waiters)

	return pw
}

// Acquire returns true on successful acquisition, and
// false on a timeout.
func (pw *PrioritizedWaiter) Acquire(priority int) bool {
	pw.mu.Lock()
	w := waiter{
		wake:     make(chan bool, 1),
		priority: priority,
	}

	if pw.inUse.Get() < pw.capacity {
		w.wake <- true
	} else {
		heap.Push(&pw.waiters, &w)
	}
	pw.mu.Unlock()

	if pw.timeout == 0 {
		<-w.wake
		pw.inUse.IncrementAndGet()
		return true
	}
	tm := time.NewTimer(pw.timeout)
	defer tm.Stop()
	select {
	case <-w.wake:
		pw.inUse.IncrementAndGet()
		return true
	case <-tm.C:
		return false
	}
}

// TryAcquire acquires a semaphore if it's immediately available.
// It returns false otherwise.
func (pw *PrioritizedWaiter) TryAcquire() bool {
	pw.mu.Lock()
	defer pw.mu.Unlock()
	return pw.inUse.Get() <= pw.capacity
}

// Release releases the acquired semaphore. You must
// not release more than the number of semaphores you've
// acquired.
func (pw *PrioritizedWaiter) Release() {
	pw.mu.Lock()
	defer pw.mu.Unlock()
	pw.inUse.DecrementAndGet()

	if pw.waiters.Len() > 0 {
		next := heap.Pop(&pw.waiters).(*waiter)
		next.wake <- true
	}
}

// Size returns the current number of available slots.
func (pw *PrioritizedWaiter) Size() int {
	return pw.waiters.Len()
}
