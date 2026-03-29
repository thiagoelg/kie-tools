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
import { existsSync, rmSync, cpSync, mkdirSync } from "fs";
import { join, dirname } from "path";

/**
 * Test workspace helper for managing the test fixture workspace.
 * Provides paths and setup/cleanup utilities for tests.
 *
 * This class creates an immutable fixtures approach by:
 * 1. Copying fixtures from the source directory to a temporary working directory
 * 2. Running all tests against the copy
 * 3. Cleaning up the temporary directory after tests
 */
export class TestWorkspace {
  public readonly root: string;
  public readonly packageA: string;
  public readonly packageB: string;
  public readonly packageC: string;
  public readonly lockfilePath: string;

  private readonly fixturesSource: string;
  private readonly workingDir: string;

  constructor(fixturesDir: string, workingDir: string) {
    this.fixturesSource = join(fixturesDir, "test-workspace");
    this.workingDir = workingDir;
    this.root = join(workingDir, "test-workspace");
    this.packageA = join(this.root, "packages", "package-a");
    this.packageB = join(this.root, "packages", "package-b");
    this.packageC = join(this.root, "packages", "package-c");
    this.lockfilePath = join(this.root, "pnpm-lock.yaml");
  }

  /**
   * Sets up the test workspace by:
   * 1. Copying fixtures from source to working directory
   * 2. Installing dependencies using the committed lockfile
   */
  setup(): void {
    // Create working directory if it doesn't exist
    if (!existsSync(this.workingDir)) {
      mkdirSync(this.workingDir, { recursive: true });
    }

    // Copy fixtures to working directory
    if (existsSync(this.root)) {
      rmSync(this.root, { recursive: true, force: true });
    }

    console.log(`Copying fixtures from ${this.fixturesSource} to ${this.root}...`);
    cpSync(this.fixturesSource, this.root, { recursive: true });

    // Install dependencies using the committed lockfile
    // This ensures consistent initial state across all test runs
    console.log("Installing dependencies in test workspace...");
    execSync("pnpm install --frozen-lockfile", {
      cwd: this.root,
      stdio: "inherit",
    });
  }

  /**
   * Cleans up the test workspace by removing the entire working directory.
   * This ensures the original fixtures remain untouched.
   */
  cleanup(): void {
    if (existsSync(this.workingDir)) {
      rmSync(this.workingDir, { recursive: true, force: true });
    }
  }

  /**
   * Resets the workspace to a fresh copy of the fixtures.
   * This is useful for ensuring test isolation.
   */
  reset(): void {
    // Remove the current workspace
    if (existsSync(this.root)) {
      rmSync(this.root, { recursive: true, force: true });
    }

    // Copy fresh fixtures
    console.log(`Resetting workspace from ${this.fixturesSource}...`);
    cpSync(this.fixturesSource, this.root, { recursive: true });

    // Reinstall dependencies using the committed lockfile
    console.log("Reinstalling dependencies...");
    execSync("pnpm install --frozen-lockfile", {
      cwd: this.root,
      stdio: "pipe",
    });
  }

  /**
   * Reinstalls dependencies to update the lockfile.
   * Useful for tests that modify package.json files.
   */
  reinstall(): void {
    try {
      execSync("pnpm install --frozen-lockfile=false", {
        cwd: this.root,
        stdio: "pipe",
      });
    } catch (error: any) {
      // If pnpm install fails, throw a more descriptive error
      const stderr = error.stderr?.toString() || "";
      const stdout = error.stdout?.toString() || "";
      throw new Error(
        `Failed to reinstall dependencies in test workspace.\n` +
          `Command: pnpm install --frozen-lockfile=false\n` +
          `Exit code: ${error.status}\n` +
          `Stdout: ${stdout}\n` +
          `Stderr: ${stderr}`
      );
    }
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
 * @param workingDir - Path to the temporary working directory (typically __dirname + '/../dist-tests/fixtures-{timestamp}')
 */
export function createTestWorkspace(fixturesDir: string, workingDir: string): TestWorkspace {
  return new TestWorkspace(fixturesDir, workingDir);
}
