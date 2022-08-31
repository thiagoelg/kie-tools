#!/usr/bin/env node

/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const buildEnv = require("./index");
const { spawnSync } = require("child_process");

async function main() {
  const opt = process.argv[2];
  const flags = process.argv[3];

  if (opt === "--print-cli-tools-check") {
    console.info(`[build-env] CLI Tools:`);
    const checks = {
      ...checkCliTool("node", ["-v"]),
      ...checkCliTool("npm", ["-v"]),
      ...checkCliTool("pnpm", ["-v"]),
      ...checkCliTool("go", ["version"]),
      ...checkCliTool("mvn", ["-v"]),
    };
    console.info(checks);
    process.exit(0);
  }

  if (opt === "--print-env") {
    const result = {};
    const vars = buildEnv.vars().ENV_VARS;

    for (const v in vars) {
      result[vars[v].name] = buildEnv.vars().getOrDefault(vars[v]);
      if (vars[v].default === undefined && result[vars[v].name]) {
        result[vars[v].name] += " <- CHANGED 👀️ ";
      } else if (result[vars[v].name] === undefined) {
        result[vars[v].name] = "[unset] Default value may vary ⚠️ ";
      } else if (result[vars[v].name] !== vars[v].default) {
        result[vars[v].name] += " <- CHANGED 👀️ ";
      }
    }

    console.log("[build-env] Environment variables:");
    console.log(JSON.stringify(flattenObj(result), undefined, 2));
    process.exit(0);
  }

  if (opt === "--print-vars") {
    const vars = buildEnv.vars().ENV_VARS;
    for (const key in vars) {
      console.log(vars[key].name);
    }
    process.exit(0);
  }

  if (opt === "--print-config") {
    console.log("[build-env] CLI-accessible config:");
    console.log(JSON.stringify(flattenObj(buildEnv), undefined, 2));
    process.exit(0);
  }

  const propertyPath = opt;
  if (!propertyPath) {
    console.error("Please provide a config property path.");
    console.error(`See all config properties with 'build-env --print-config'`);
    process.exit(1);
  }

  let configPropertyValue = buildEnv;
  for (const p of propertyPath.split(".")) {
    configPropertyValue = configPropertyValue[p];
    if (configPropertyValue === undefined || typeof configPropertyValue === "function") {
      console.error(`Config property '${propertyPath}' not found. `);
      console.error(`See all config properties with 'build-env --print-config'`);
      process.exit(1);
    }
  }

  if (flags === "--not") {
    const isBoolean = `${configPropertyValue}` === "true" || `${configPropertyValue}` === "false";
    if (isBoolean) {
      console.log(!(`${configPropertyValue}` === "true"));
      process.exit(0);
    } else {
      console.error(`Cannot negate non-boolean value '${configPropertyValue}'`);
      process.exit(0);
    }
  }

  console.log(configPropertyValue);
}

function checkCliTool(bin, args) {
  const shell = process.platform === "win32" ? { shell: "powershell.exe" } : {};
  const checkingCommand = spawnSync(bin, args, { stdio: "pipe", ...shell });

  let ret = {};
  if (checkingCommand.status !== 0) {
    const check = `[❌] ${bin}`;
    ret[check] = "Not found. Problems may occur during the build.";
  } else {
    const check = `[✅] ${bin}`;
    ret[check] = `${checkingCommand.stdout}`.trim();
  }

  return ret;
}

function flattenObj(obj, parent, res = {}) {
  for (const key in obj) {
    let propName = parent ? parent + "." + key : key;
    if (typeof obj[key] == "object") {
      flattenObj(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
}

main();