package sync2

import (
	"fmt"
	"sync"
	"testing"
	"time"
)

func TestWait(t *testing.T) {
	pw := NewPrioritizedWaiter(3, 0*time.Second)
	if pw.Size() != 0 {
		t.Fatalf("Non-empty waiter")
	}
	w := sync.WaitGroup{}

	w.Add(10)
	for i := 0; i < 10; i++ {
		go func() {
			pw.Acquire(10)
			time.Sleep(1 * time.Second)
			pw.Release()
			fmt.Printf("Released pri 10\n")
			w.Add(-1)
		}()
	}
	fmt.Printf("Next!\n")

	w.Add(10)
	for i := 0; i < 10; i++ {
		go func() {
			pw.Acquire(5)
			time.Sleep(5 * time.Second)
			pw.Release()
			fmt.Printf("Released pri 5\n")
			w.Add(-1)
		}()
	}

	fmt.Printf("Next Next!\n")
	w.Add(10)
	for i := 0; i < 10; i++ {
		go func() {
			pw.Acquire(3)
			time.Sleep(1 * time.Second)
			pw.Release()
			fmt.Printf("Released pri 3\n")
			w.Add(-1)
		}()
	}

	fmt.Println("Wrapping up")
	w.Wait()
	fmt.Println("Done!", pw.inUse)
}
