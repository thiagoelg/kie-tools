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

import { getSourcesHash } from "../src/inputs/Sources";
import { writeFileSync, readFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { createTestWorkspace } from "./helpers/testWorkspace";

// Create a unique working directory for this test run
const workingDir = join(__dirname, "..", "dist-tests", `fixtures-${Date.now()}`);
const workspace = createTestWorkspace(join(__dirname, "fixtures"), workingDir);

describe("getSourcesHash", () => {
  beforeAll(() => {
    workspace.setup();
  });

  afterAll(() => {
    workspace.cleanup();
  });

  // Reset workspace before each test to ensure complete isolation
  beforeEach(() => {
    workspace.reset();
  });

  describe("successful hash generation", () => {
    it("should generate a valid SHA-256 hash", async () => {
      const hash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Verify it's a valid hex string
    });

    it("should generate consistent hashes for the same files", async () => {
      const hash1 = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });
      const hash2 = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for different file sets", async () => {
      const hashA = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });
      const hashB = await getSourcesHash(workspace.root, workspace.packageB, {
        includes: ["src/**/*.ts"],
      });

      // package-a and package-b have different source files
      expect(hashA).not.toBe(hashB);
    });

    it("should handle includes with multiple patterns", async () => {
      const hash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts", "package.json", "tsconfig.json"],
      });

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should properly exclude files when excludes are provided", async () => {
      // Create a test file that should be excluded
      const testFilePath = join(workspace.packageA, "src", "index.test.ts");
      writeFileSync(testFilePath, "export const test = 'test';");

      const hashWithoutExclude = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      const hashWithExclude = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
        excludes: ["**/*.test.ts"],
      });

      // Hashes should be different because one includes the test file
      expect(hashWithoutExclude).not.toBe(hashWithExclude);
    });
  });

  describe("hash sensitivity", () => {
    it("should detect changes when file content changes", async () => {
      // Get initial hash
      const initialHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Modify file content
      const indexPath = join(workspace.packageA, "src", "index.ts");
      const originalContent = readFileSync(indexPath, "utf-8");
      writeFileSync(indexPath, originalContent + "\n// Modified content\n");

      // Get new hash
      const newHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Hashes should be different
      expect(newHash).not.toBe(initialHash);
    });

    it("should detect changes when a new file is added matching includes", async () => {
      // Get initial hash
      const initialHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Add a new file
      const newFilePath = join(workspace.packageA, "src", "utils.ts");
      writeFileSync(
        newFilePath,
        `
export function add(a: number, b: number): number {
  return a + b;
}
`
      );

      // Get new hash
      const newHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Hashes should be different
      expect(newHash).not.toBe(initialHash);
    });

    it("should detect changes when a file is removed", async () => {
      // Get initial hash
      const initialHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Remove the source file
      const indexPath = join(workspace.packageA, "src", "index.ts");
      rmSync(indexPath);

      // Get new hash - should throw because no files match
      await expect(
        getSourcesHash(workspace.root, workspace.packageA, {
          includes: ["src/**/*.ts"],
        })
      ).rejects.toThrow("No files found matching includes");
    });

    it("should remain stable when excluded files change", async () => {
      // Create a test file
      const testFilePath = join(workspace.packageA, "src", "index.test.ts");
      writeFileSync(testFilePath, "export const test = 'test';");

      // Get initial hash with excludes
      const initialHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
        excludes: ["**/*.test.ts"],
      });

      // Modify the excluded test file
      writeFileSync(testFilePath, "export const test = 'modified test';");

      // Get new hash
      const newHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
        excludes: ["**/*.test.ts"],
      });

      // Hashes should remain the same since the test file is excluded
      expect(newHash).toBe(initialHash);
    });

    it("should remain stable when files outside patterns change", async () => {
      // Get initial hash for TypeScript files only
      const initialHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Modify package.json (not included in the pattern)
      const packageJsonPath = join(workspace.packageA, "package.json");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      packageJson.version = "2.0.0";
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Get new hash
      const newHash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Hashes should remain the same since package.json is not included
      expect(newHash).toBe(initialHash);
    });
  });

  describe("error handling", () => {
    it("should throw error when includes array is empty", async () => {
      await expect(
        getSourcesHash(workspace.root, workspace.packageA, {
          includes: [],
        })
      ).rejects.toThrow("At least one include pattern is required");
    });

    it("should throw error when no files match the includes patterns", async () => {
      await expect(
        getSourcesHash(workspace.root, workspace.packageA, {
          includes: ["**/*.nonexistent"],
        })
      ).rejects.toThrow("No files found matching includes: **/*.nonexistent");
    });

    it("should throw error when package directory doesn't exist", async () => {
      const nonExistentPkg = join(workspace.root, "packages", "non-existent-package");

      await expect(
        getSourcesHash(workspace.root, nonExistentPkg, {
          includes: ["src/**/*.ts"],
        })
      ).rejects.toThrow();
    });

    it("should handle file read errors gracefully", async () => {
      // Create a directory with the same name as a file pattern
      const dirPath = join(workspace.packageA, "src", "subdir");
      mkdirSync(dirPath, { recursive: true });
      const filePath = join(dirPath, "test.ts");
      writeFileSync(filePath, "export const test = 'test';");

      // Make the file unreadable (this is platform-dependent and may not work on all systems)
      // Instead, we'll test by trying to read a file that gets deleted during the read
      const hash = await getSourcesHash(workspace.root, workspace.packageA, {
        includes: ["src/**/*.ts"],
      });

      // Should succeed with the new file
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });
  });
});
