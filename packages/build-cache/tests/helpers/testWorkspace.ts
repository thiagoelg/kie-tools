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

import { execSync } from "child_process";
import { existsSync, rmSync } from "fs";
import { join } from "path";

/**
 * Test workspace helper for managing the test fixture workspace.
 * Provides paths and setup/cleanup utilities for tests.
 */
export class TestWorkspace {
  public readonly root: string;
  public readonly packageA: string;
  public readonly packageB: string;
  public readonly packageC: string;
  public readonly lockfilePath: string;

  constructor(fixturesDir: string) {
    this.root = join(fixturesDir, "test-workspace");
    this.packageA = join(this.root, "packages", "package-a");
    this.packageB = join(this.root, "packages", "package-b");
    this.packageC = join(this.root, "packages", "package-c");
    this.lockfilePath = join(this.root, "pnpm-lock.yaml");
  }

  /**
   * Sets up the test workspace by installing dependencies if needed.
   * This generates a real pnpm-lock.yaml file.
   */
  setup(): void {
    if (!existsSync(this.lockfilePath)) {
      console.log("Setting up test workspace...");
      execSync("pnpm install --frozen-lockfile=false", {
        cwd: this.root,
        stdio: "inherit",
      });
    }
  }

  /**
   * Cleans up the test workspace by removing node_modules and lockfile.
   */
  cleanup(): void {
    const nodeModulesPath = join(this.root, "node_modules");
    if (existsSync(nodeModulesPath)) {
      rmSync(nodeModulesPath, { recursive: true, force: true });
    }
    if (existsSync(this.lockfilePath)) {
      rmSync(this.lockfilePath, { force: true });
    }
  }

  /**
   * Reinstalls dependencies to update the lockfile.
   * Useful for tests that modify package.json files.
   */
  reinstall(): void {
    execSync("pnpm install --frozen-lockfile=false", {
      cwd: this.root,
      stdio: "pipe",
    });
  }

  /**
   * Checks if the workspace is set up (lockfile exists).
   */
  isSetup(): boolean {
    return existsSync(this.lockfilePath);
  }
}

/**
 * Creates a TestWorkspace instance for the given fixtures directory.
 * @param fixturesDir - Path to the fixtures directory (typically __dirname + '/fixtures')
 */
export function createTestWorkspace(fixturesDir: string): TestWorkspace {
  return new TestWorkspace(fixturesDir);
}

// Made with Bob
