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

import { createHash } from "crypto";
import { execSync } from "child_process";
import * as path from "path";
import type { HashInput } from "./HashInput";

/**
 * Generates a hash of the build environment variables for a specific package.
 *
 * The function executes the build-env script with --print-env-json to retrieve
 * the environment variables as a JSON object, then hashes the sorted JSON string
 * for deterministic results.
 *
 * @param root - The root directory of the workspace (typically process.cwd())
 * @param pkgDir - The package directory path (e.g., "packages/my-package")
 * @returns A SHA-256 hash of the build environment variables
 */
export const getBuildEnvHash: HashInput = async function (root: string, pkgDir: string): Promise<string> {
  // Execute build-env with --print-env-json from the package directory context
  const output = execSync(`pnpm exec build-env --print-env-json`, {
    cwd: pkgDir,
    encoding: "utf-8",
    stdio: ["pipe", "pipe", "pipe"], // Suppress output to terminal
    env: process.env, // Pass current environment variables to child process
  });

  // Parse the JSON output
  const envJson = JSON.parse(output);

  // Sort the keys for deterministic hashing
  const sortedKeys = Object.keys(envJson).sort();
  const sortedEnv: Record<string, any> = {};
  for (const key of sortedKeys) {
    sortedEnv[key] = envJson[key];
  }

  // Create hash from the sorted JSON string
  const hash = createHash("sha256").update(JSON.stringify(sortedEnv)).digest("hex");

  return hash;
};
