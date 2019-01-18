/*
Copyright 2018 Turbine Labs, Inc.

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

// Package stack is used to produce user friendly stack traces.
//
// Usage:
//   s := stack.New()
//   stackStr := s.Format(true)
//   fmt.Println(stackStr)
package stack

import (
	"bytes"
	"fmt"
	"runtime"
	"strings"
	"text/tabwriter"
)

type frame struct {
	filepath string
	function string
	line     int
}

// Stack is a series of function calls ordered most-to-least recent.
type Stack []frame

// New generates a new stack trace. This function will not appear in
// the trace.
func NewStack() Stack {
	var results Stack

	for i := 0; ; i++ {
		pc, file, line, ok := runtime.Caller(i)
		if !ok {
			break
		}

		// Ignore this function.
		if i == 0 {
			continue
		}

		fn := runtime.FuncForPC(pc)
		if fn != nil {
			name := fn.Name()

			s := strings.Split(name, "/")
			s = strings.Split(s[len(s)-1], ".")

			i := 0
			if len(s) > 1 {
				i = 1
			}

			name = strings.Join(s[i:], ".")

			results = append(results, frame{strings.TrimSpace(file), name, line})
		}
	}

	return results
}

// Pop removes frames from the top of the stack.
func (s *Stack) Pop(n int) error {
	if l := len(*s); l < n {
		return fmt.Errorf("Attempting to pop too many frames from stack; %d deep", l)
	}

	*s = (*s)[n:]

	return nil
}

// PopFrames removes frames from the top of the stack whose file paths
// match some prefix. Useful when the stack depth in a certain library
// may not be consistent. Removal of frames stops when the first
// non-matching frame is encountered.
//
// NB: Because it's prefix matching you should be cognizant of its interplay
// with TrimPaths.
func (s *Stack) PopFrames(prefixes ...string) {
	newStack := *s

	for _, f := range *s {
		prefixHit := false

		for _, p := range prefixes {
			if strings.HasPrefix(f.filepath, p) {
				prefixHit = true
				break
			}
		}

		if prefixHit {
			if len(newStack) > 0 {
				newStack = newStack[1:]
			}
		} else {
			break
		}
	}

	*s = newStack
}

// TrimPaths examines filepaths and strips common path prefixes. For
// each stack frame, the frame's filepath is compared to each of the
// given prefixes. If a prefix matches, it is removed from
// filepath. Note that after a match, the remaining prefixes are
// compared against the modified path, and if they match another strip
// operation occurs.
func (s Stack) TrimPaths(prefixes ...string) {
	for i := range s {
		for _, pfx := range prefixes {
			if strings.HasPrefix(s[i].filepath, pfx) {
				s[i].filepath = s[i].filepath[len(pfx):]
			}
		}
	}
}

// Format produces a string containing the stack trace formatted for
// consumption. If includeHeader is set, it will include a column
// header for function, line, and file.
//
// Example output (with includeHeader set to true):
//   		function                            file:line
//   		TestClusterConstraintsEqualsSuccess api/cluster_constraint_test.go:16
//   		tRunner                             go/src/testing/testing.go:456
//   		goexit                              go/src/runtime/asm_amd64.s:1696
func (s Stack) Format(includeHeader bool) string {
	buf := new(bytes.Buffer)
	w := new(tabwriter.Writer)

	w.Init(buf, 0, 8, 1, ' ', 0)
	if includeHeader {
		fmt.Fprintln(w, "function\tfile:line")
	}
	for _, f := range s {
		line := fmt.Sprintf("%s\t%s:%d", f.function, f.filepath, f.line)
		fmt.Fprintln(w, line)
	}
	w.Flush()

	return buf.String()
}

// Frames returns an array of stack frames formatted as strings. Each
// frame contains the function name and a file:line reference to the
// code's location in parentheses. May return an empty slice.
//
// Example stack frame:
//   "TestClusterConstraintsEqualsSuccess (api/cluster_constraint_test.go:16)"
func (s Stack) Frames() []string {
	frames := make([]string, 0, len(s))
	for _, f := range s {
		frames = append(frames, fmt.Sprintf("%s (%s:%d)", f.function, f.filepath, f.line))
	}
	return frames
}
