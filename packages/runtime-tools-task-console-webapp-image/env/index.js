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

const { varsWithName, composeEnv, getOrDefault } = require("@kie-tools-scripts/build-env");

module.exports = composeEnv([require("@kie-tools/root-env/env")], {
  vars: varsWithName({
    RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__registry: {
      default: "quay.io",
      description: "The image registry.",
    },
    RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__account: {
      default: "kie-tools",
      description: "The image registry account.",
    },
    RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__name: {
      default: "runtime-tools-task-console-webapp-image",
      description: "The image name.",
    },
    RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__buildTags: {
      default: "daily-dev",
      description: "The image tag.",
    },
    RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__port: {
      default: 8080,
      description: "The default container port.",
    },
  }),
  get env() {
    return {
      runtimeToolsTaskConsoleWebappImage: {
        registry: getOrDefault(this.vars.RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__registry),
        account: getOrDefault(this.vars.RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__account),
        name: getOrDefault(this.vars.RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__name),
        tags: getOrDefault(this.vars.RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__buildTags),
        port: getOrDefault(this.vars.RUNTIME_TOOLS_TASK_CONSOLE_WEBAPP_IMAGE__port),
        version: require("../package.json").version,
      },
    };
  },
});
