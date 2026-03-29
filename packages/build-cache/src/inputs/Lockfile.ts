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

import { readWantedLockfile } from "@pnpm/lockfile.fs";
import { filterLockfileByImporters } from "@pnpm/lockfile.filtering";
import type { ProjectId } from "@pnpm/types";
import { createHash } from "crypto";
import { relative } from "path";
import type { HashInput } from "./HashInput";

/**
 * Generates a hash of the lockfile dependencies for a specific package.
 * This hash can be used for build caching to detect when dependencies have changed.
 * Implements the HashInput type.
 *
 * @param root - The root directory of the workspace (typically process.cwd())
 * @param pkgDir - The package directory path (e.g., "packages/my-package")
 * @returns A SHA-256 hash of the filtered lockfile packages
 */
export const getLockfileHash: HashInput = async function (root: string, pkgDir: string): Promise<string> {
  const lockfile = await readWantedLockfile(root, { ignoreIncompatible: false });

  if (!lockfile) {
    throw new Error(`No lockfile found in ${root}`);
  }

  const relativePath = relative(root, pkgDir) as ProjectId;

  // Check if the package exists in the lockfile's importers
  // If not, we'll still generate a hash (of empty packages) rather than throwing
  // This allows the function to work for packages that don't have dependencies yet
  if (lockfile.importers && !lockfile.importers[relativePath]) {
    // Package doesn't exist in lockfile, return hash of empty packages
    const hash = createHash("sha256").update(JSON.stringify({})).digest("hex");
    return hash;
  }

  const filtered = filterLockfileByImporters(lockfile, [relativePath], {
    failOnMissingDependencies: false,
    include: {
      dependencies: true,
      devDependencies: true,
      optionalDependencies: true,
    },
    skipped: new Set(),
  });

  const hash = createHash("sha256").update(JSON.stringify(filtered.packages)).digest("hex");

  return hash;
};
