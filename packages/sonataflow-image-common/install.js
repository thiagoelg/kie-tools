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

const { execSync } = require("child_process");

const buildEnv = require("./env");
const path = require("path");
const pythonVenvDir = path.dirname(require.resolve("@kie-tools/python-venv/package.json"));

const activateCmd =
  process.platform === "win32"
    ? `${pythonVenvDir}\\venv\\Scripts\\Activate.bat`
    : `. ${pythonVenvDir}/venv/bin/activate`;

execSync(
  `${activateCmd} && \
  python3 ./resources/scripts/versions_manager.py --bump-to ${buildEnv.env.root.streamName} --source-folder ./resources`,
  { stdio: "inherit" }
);

// Install bats
if (process.platform !== "win32") {
  execSync(`. ./resources/scripts/install_bats.sh`, { stdio: "inherit" });
}
