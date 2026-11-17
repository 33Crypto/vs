// go.os — Go sample for Go-Orbit-Programmers-Pro / vs.
// LOCK33 Development Organization's vscode action tool for lock33.dev.
package main

import (
	"fmt"
	"os"
)

func main() {
	tool := "vs"
	if len(os.Args) > 1 {
		tool = os.Args[1]
	}
	fmt.Printf("%s · Go-Orbit-Programmers-Pro\n", tool)
	if dir, err := os.Getwd(); err == nil {
		fmt.Println(dir)
	}
}
