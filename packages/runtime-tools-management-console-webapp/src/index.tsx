/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import * as React from "react";
import * as ReactDOM from "react-dom";
import "@patternfly/patternfly/patternfly.css";
import "@patternfly/patternfly/patternfly-addons.css";
import "@patternfly/react-core/dist/styles/base.css";
import { initEnv } from "./env/Env";
import { ENV_PREFIX } from "./env/EnvConstants";
import "./styles.css";
import { App } from "./managementConsole";
import { EnvJson } from "./env/EnvJson";

declare global {
  interface Window {
    [key: string]: any;
  }
}

initEnv().then((env) => {
  if (env) {
    Object.keys(env).forEach((key) => {
      window[key.replace(`${ENV_PREFIX}_`, "")] = env[key as keyof EnvJson];
    });
  }
  ReactDOM.render(<App />, document.getElementById("root"));
});
