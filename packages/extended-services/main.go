/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

package main

import (
	_ "embed"
	"flag"

	"github.com/apache/incubator-kie-tools/packages/extended-services/pkg"
	"github.com/apache/incubator-kie-tools/packages/extended-services/pkg/metadata"
)

// Embed the jitrunner into the runner variable, to produce a self-contained binary.
//
//go:embed jitexecutor
var jitexecutor []byte

func main() {
	port := flag.String("p", metadata.Port, "Extended Services Port")
	flag.Parse()

	server := pkg.NewProxy(*port, jitexecutor)
	view := &pkg.Systray{}

	server.View = view
	view.Server = server

	view.Run()
}
