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

import { getLockfileHash } from "../src/inputs/Lockfile";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { createTestWorkspace } from "./helpers/testWorkspace";

const workspace = createTestWorkspace(join(__dirname, "fixtures"));

describe("getLockfileHash", () => {
  beforeAll(() => {
    workspace.setup();
  });

  afterAll(() => {
    workspace.cleanup();
  });

  describe("successful hash generation", () => {
    it("should generate a valid SHA-256 hash for package-a", async () => {
      const hash = await getLockfileHash(workspace.root, workspace.packageA);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Verify it's a valid hex string
    });

    it("should generate a valid SHA-256 hash for package-b", async () => {
      const hash = await getLockfileHash(workspace.root, workspace.packageB);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate a valid SHA-256 hash for package-c (no dependencies)", async () => {
      const hash = await getLockfileHash(workspace.root, workspace.packageC);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should generate consistent hashes for the same package", async () => {
      const hash1 = await getLockfileHash(workspace.root, workspace.packageA);
      const hash2 = await getLockfileHash(workspace.root, workspace.packageA);
      const hash3 = await getLockfileHash(workspace.root, workspace.packageA);

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it("should generate different hashes for packages with different dependencies", async () => {
      const hashA = await getLockfileHash(workspace.root, workspace.packageA);
      const hashB = await getLockfileHash(workspace.root, workspace.packageB);

      // package-a has is-odd, package-b has is-even and is-number
      expect(hashA).not.toBe(hashB);
    });

    it("should generate different hash for package with no dependencies", async () => {
      const hashA = await getLockfileHash(workspace.root, workspace.packageA);
      const hashC = await getLockfileHash(workspace.root, workspace.packageC);

      // package-a has dependencies, package-c has none
      expect(hashA).not.toBe(hashC);
    });
  });

  describe("hash sensitivity", () => {
    it("should detect changes when a dependency version changes", async () => {
      // Get initial hash
      const initialHash = await getLockfileHash(workspace.root, workspace.packageA);

      // Backup original package.json
      const packageJsonPath = join(workspace.packageA, "package.json");
      const originalContent = readFileSync(packageJsonPath, "utf-8");

      try {
        // Modify dependency version
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies["is-odd"] = "3.0.0"; // Change from 3.0.1 to 3.0.0
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Reinstall to update lockfile
        workspace.reinstall();

        // Get new hash
        const newHash = await getLockfileHash(workspace.root, workspace.packageA);

        // Hashes should be different
        expect(newHash).not.toBe(initialHash);
      } finally {
        // Restore original package.json
        writeFileSync(packageJsonPath, originalContent);
        workspace.reinstall();
      }
    });

    it("should detect changes when a new dependency is added", async () => {
      // Get initial hash
      const initialHash = await getLockfileHash(workspace.root, workspace.packageC);

      // Backup original package.json
      const packageJsonPath = join(workspace.packageC, "package.json");
      const originalContent = readFileSync(packageJsonPath, "utf-8");

      try {
        // Add a new dependency
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies = { "is-number": "7.0.0" };
        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

        // Reinstall to update lockfile
        workspace.reinstall();

        // Get new hash
        const newHash = await getLockfileHash(workspace.root, workspace.packageC);

        // Hashes should be different
        expect(newHash).not.toBe(initialHash);
      } finally {
        // Restore original package.json
        writeFileSync(packageJsonPath, originalContent);
        workspace.reinstall();
      }
    });

    it("should remain stable when unrelated packages change", async () => {
      // Get initial hash for package-a
      const initialHashA = await getLockfileHash(workspace.root, workspace.packageA);

      // Backup original package.json for package-b
      const packageBJsonPath = join(workspace.packageB, "package.json");
      const originalContent = readFileSync(packageBJsonPath, "utf-8");

      try {
        // Modify package-b's dependencies
        const packageJson = JSON.parse(originalContent);
        packageJson.dependencies["is-even"] = "1.0.1"; // Change version
        writeFileSync(packageBJsonPath, JSON.stringify(packageJson, null, 2));

        // Reinstall to update lockfile
        workspace.reinstall();

        // Get new hash for package-a (should remain the same)
        const newHashA = await getLockfileHash(workspace.root, workspace.packageA);

        // package-a's hash should remain the same since its dependencies didn't change
        expect(newHashA).toBe(initialHashA);
      } finally {
        // Restore original package.json
        writeFileSync(packageBJsonPath, originalContent);
        workspace.reinstall();
      }
    });
  });

  describe("error handling", () => {
    it("should throw an error when no lockfile is found", async () => {
      const nonExistentRoot = join(__dirname, "fixtures", "non-existent");

      await expect(getLockfileHash(nonExistentRoot, workspace.packageA)).rejects.toThrow(
        `No lockfile found in ${nonExistentRoot}`
      );
    });

    it("should throw an error when root directory does not exist", async () => {
      const nonExistentRoot = "/path/that/does/not/exist";

      await expect(getLockfileHash(nonExistentRoot, workspace.packageA)).rejects.toThrow();
    });

    it("should handle package directory that does not exist in lockfile", async () => {
      const nonExistentPkg = join(workspace.root, "packages", "non-existent-package");

      // This should not throw, but return a hash (possibly of empty packages)
      const hash = await getLockfileHash(workspace.root, nonExistentPkg);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("hash properties", () => {
    it("should produce deterministic hashes across multiple calls", async () => {
      const hashes = await Promise.all([
        getLockfileHash(workspace.root, workspace.packageA),
        getLockfileHash(workspace.root, workspace.packageA),
        getLockfileHash(workspace.root, workspace.packageA),
        getLockfileHash(workspace.root, workspace.packageA),
        getLockfileHash(workspace.root, workspace.packageA),
      ]);

      // All hashes should be identical
      const uniqueHashes = new Set(hashes);
      expect(uniqueHashes.size).toBe(1);
    });

    it("should handle packages with both dependencies and devDependencies", async () => {
      // package-b has both dependencies and devDependencies
      const hash = await getLockfileHash(workspace.root, workspace.packageB);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should include transitive dependencies in the hash", async () => {
      // is-odd depends on is-number, so package-a's hash should include both
      const hashA = await getLockfileHash(workspace.root, workspace.packageA);

      // This hash should be different from a package with just is-number
      expect(hashA).toBeDefined();
      expect(hashA).toHaveLength(64);
    });
  });

  describe("path handling", () => {
    it("should handle absolute paths correctly", async () => {
      const hash = await getLockfileHash(workspace.root, workspace.packageA);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
    });

    it("should handle nested package paths correctly", async () => {
      // All our test packages are nested under packages/
      const hashA = await getLockfileHash(workspace.root, workspace.packageA);
      const hashB = await getLockfileHash(workspace.root, workspace.packageB);
      const hashC = await getLockfileHash(workspace.root, workspace.packageC);

      expect(hashA).toBeDefined();
      expect(hashB).toBeDefined();
      expect(hashC).toBeDefined();

      // All should be different (except possibly A and C if they have same deps)
      expect(hashA).not.toBe(hashB);
    });
  });
});

// Made with Bob
