# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements.  See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership.  The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License.  You may obtain a copy of the License at
#
#  http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied.  See the License for the
# specific language governing permissions and limitations
# under the License.

METADATA_PATH                 			:= github.com/apache/incubator-kie-tools/packages/extended-services/pkg/metadata
SET_EXTENDED_SERVICES_VERSION 			:= $(METADATA_PATH).Version=$(shell pnpm build-env extendedServices.version)
SET_EXTENDED_SERVICES_IP      			:= $(METADATA_PATH).Ip=$(shell build-env extendedServices.ip)
SET_EXTENDED_SERVICES_PORT    			:= $(METADATA_PATH).Port=$(shell build-env extendedServices.port)
SET_EXTENDED_SERVICES_KIE_SANDBOX_URL 	:= $(METADATA_PATH).KieSandboxUrl=$(shell build-env extendedServices.kieSandboxUrl)
LDFLAGS                       			:= "-X $(SET_EXTENDED_SERVICES_VERSION) -X $(SET_EXTENDED_SERVICES_IP) -X $(SET_EXTENDED_SERVICES_PORT) -X $(SET_EXTENDED_SERVICES_KIE_SANDBOX_URL)"

ARCH := $(shell uname -m)
ifeq ($(ARCH),x86_64)
	GOARCH = amd64
else
	GOARCH = arm64
endif

darwin:
	cross-env GOOS=darwin GOARCH=$(GOARCH) CGO_ENABLED=1 go build -ldflags $(LDFLAGS) -o dist/darwin/kie_sandbox_extended_services main.go

darwin-amd64:
	cross-env GOOS=darwin GOARCH=amd64 go build -ldflags $(LDFLAGS) -o dist/darwin/kie_sandbox_extended_services main.go

darwin-arm64:
	cross-env GOOS=darwin GOARCH=arm64 go build -ldflags $(LDFLAGS) -o dist/darwin/kie_sandbox_extended_services main.go

linux:
	cross-env GOOS=linux GOARCH=amd64 go build -ldflags $(LDFLAGS) -o dist/linux/kie_sandbox_extended_services main.go

linux-headless:
	cross-env GOOS=linux GOARCH=amd64 go build -ldflags $(LDFLAGS) -tags headless -o dist/linux/kie_sandbox_extended_services_headless main.go

win32:
	cross-env GOOS=windows GOARCH=amd64 go build -ldflags $(LDFLAGS) -o dist/win32/kie_sandbox_extended_services.exe main.go
	
start:
	go run -ldflags $(LDFLAGS) main.go