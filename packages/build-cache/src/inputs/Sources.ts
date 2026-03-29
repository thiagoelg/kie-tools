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
import { readFile, glob } from "fs/promises";
import * as path from "path";
import type { HashInput } from "./HashInput";

/**
 * Options for configuring which source files to include in the hash.
 */
export interface SourcesHashOptions {
  /**
   * Array of file paths or glob patterns to include.
   * @example ["src/**\/*.ts", "package.json", "tsconfig.json"]
   */
  includes: string[];

  /**
   * Optional array of file paths or glob patterns to exclude.
   * @example ["**\/*.test.ts", "**\/__tests__/**"]
   */
  excludes?: string[];
}

/**
 * Generates a hash of source files based on include and exclude patterns.
 * This hash can be used for build caching to detect when source files have changed.
 * Implements the HashInput type with an additional options parameter.
 *
 * @param root - The root directory of the workspace (typically process.cwd())
 * @param pkgDir - The package directory path (e.g., "packages/my-package")
 * @param options - Configuration object with includes and optional excludes patterns
 * @returns A SHA-256 hash of the combined content of all matching files
 *
 * @example
 * ```typescript
 * // Include all TypeScript files, exclude tests
 * const hash1 = await getSourceHash(process.cwd(), "packages/my-package", {
 *   includes: ["src/**\/*.ts", "package.json"],
 *   excludes: ["**\/*.test.ts", "**\/__tests__/**"]
 * });
 *
 * // Include specific files only
 * const hash2 = await getSourceHash(process.cwd(), "packages/my-package", {
 *   includes: ["src/index.ts", "package.json", "tsconfig.json"]
 * });
 * ```
 */
export const getSourcesHash: HashInput<[SourcesHashOptions]> = async function (
  root: string,
  pkgDir: string,
  options: SourcesHashOptions
): Promise<string> {
  if (!options.includes || options.includes.length === 0) {
    throw new Error("At least one include pattern is required");
  }

  // Find all files matching the include patterns
  const allMatchedFiles: string[] = [];

  // Process each include pattern separately
  for (const pattern of options.includes) {
    const matches = glob(pattern, {
      cwd: pkgDir,
      exclude: options.excludes,
    });

    for await (const match of matches) {
      allMatchedFiles.push(match);
    }
  }

  if (allMatchedFiles.length === 0) {
    throw new Error(
      `No files found matching includes: ${options.includes.join(", ")}` +
        (options.excludes ? ` (excludes: ${options.excludes.join(", ")})` : "")
    );
  }

  // Remove duplicates and sort for deterministic hashing
  const uniqueFiles = Array.from(new Set(allMatchedFiles)).sort();

  // Read all file contents and combine them
  const hash = createHash("sha256");

  for (const file of uniqueFiles) {
    const fullPath = path.join(pkgDir, file);
    try {
      const content = await readFile(fullPath, "utf-8");
      // Include the file path in the hash for uniqueness
      hash.update(`${file}\n`);
      hash.update(content);
      hash.update("\n");
    } catch (error) {
      throw new Error(`Failed to read file ${fullPath}: ${error}`);
    }
  }

  return hash.digest("hex");
};
