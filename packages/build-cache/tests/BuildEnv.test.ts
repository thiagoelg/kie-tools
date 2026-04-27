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

import { getBuildEnvHash } from "../src/inputs/BuildEnv";
import { writeFileSync, readFileSync } from "fs";
import { join } from "path";
import { createTestWorkspace } from "./helpers/testWorkspace";

// Create a unique working directory for this test run
const workingDir = join(__dirname, "..", "dist-tests", `fixtures-${Date.now()}`);
const workspace = createTestWorkspace(join(__dirname, "fixtures"), workingDir);

describe("getBuildEnvHash", () => {
  // Store original environment variables to restore after tests
  const originalEnv: Record<string, string | undefined> = {};

  beforeAll(() => {
    workspace.setup();
  });

  afterAll(() => {
    workspace.cleanup();
  });

  // Reset workspace and environment variables before each test
  beforeEach(() => {
    workspace.reset();

    // Store and clear test environment variables
    originalEnv.PACKAGE_A__testVarA = process.env.PACKAGE_A__testVarA;
    originalEnv.PACKAGE_A__testVarB = process.env.PACKAGE_A__testVarB;
    originalEnv.PACKAGE_B__testVarC = process.env.PACKAGE_B__testVarC;

    delete process.env.PACKAGE_A__testVarA;
    delete process.env.PACKAGE_A__testVarB;
    delete process.env.PACKAGE_B__testVarC;
  });

  // Restore environment variables after each test
  afterEach(() => {
    if (originalEnv.PACKAGE_A__testVarA !== undefined) {
      process.env.PACKAGE_A__testVarA = originalEnv.PACKAGE_A__testVarA;
    } else {
      delete process.env.PACKAGE_A__testVarA;
    }

    if (originalEnv.PACKAGE_A__testVarB !== undefined) {
      process.env.PACKAGE_A__testVarB = originalEnv.PACKAGE_A__testVarB;
    } else {
      delete process.env.PACKAGE_A__testVarB;
    }

    if (originalEnv.PACKAGE_B__testVarC !== undefined) {
      process.env.PACKAGE_B__testVarC = originalEnv.PACKAGE_B__testVarC;
    } else {
      delete process.env.PACKAGE_B__testVarC;
    }
  });

  describe("successful hash generation", () => {
    it("should generate a valid SHA-256 hash", async () => {
      const hash = await getBuildEnvHash(workspace.root, workspace.packageA);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Verify it's a valid hex string
    });

    it("should generate consistent hashes for the same environment", async () => {
      process.env.PACKAGE_A__testVarA = "deterministic-value";
      process.env.PACKAGE_A__testVarB = "another-deterministic-value";

      const hash1 = await getBuildEnvHash(workspace.root, workspace.packageA);
      const hash2 = await getBuildEnvHash(workspace.root, workspace.packageA);

      expect(hash1).toBe(hash2);
    });

    it("should generate different hashes for packages with different env configurations", async () => {
      // package-a has PACKAGE_A__testVarA and PACKAGE_A__testVarB
      const hashA = await getBuildEnvHash(workspace.root, workspace.packageA);

      // package-b has PACKAGE_B__testVarC
      const hashB = await getBuildEnvHash(workspace.root, workspace.packageB);

      // Hashes should be different (different env configurations)
      expect(hashA).not.toBe(hashB);
    });

    it("should handle package without env configuration", async () => {
      // package-c has no env directory
      const hash = await getBuildEnvHash(workspace.root, workspace.packageC);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);

      // Hash should be consistent
      const hash2 = await getBuildEnvHash(workspace.root, workspace.packageC);
      expect(hash).toBe(hash2);
    });
  });

  describe("hash sensitivity", () => {
    it("should detect changes when environment variables change", async () => {
      // Get hash with default values
      const defaultHash = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Change multiple variables
      process.env.PACKAGE_A__testVarA = "value1";
      const hash1 = await getBuildEnvHash(workspace.root, workspace.packageA);

      process.env.PACKAGE_A__testVarA = "value2";
      const hash2 = await getBuildEnvHash(workspace.root, workspace.packageA);

      process.env.PACKAGE_A__testVarB = "value-b";
      const hash3 = await getBuildEnvHash(workspace.root, workspace.packageA);

      // All hashes should be different
      expect(hash1).not.toBe(defaultHash);
      expect(hash2).not.toBe(hash1);
      expect(hash3).not.toBe(hash2);
    });

    it("should produce same hash when environment variable is set back to default", async () => {
      // Get hash with default values
      const defaultHash = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Set environment variable to its default value explicitly
      process.env.PACKAGE_A__testVarA = "default-value-a";
      const explicitDefaultHash = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Hashes should be the same
      expect(explicitDefaultHash).toBe(defaultHash);
    });

    it("should produce different hashes for different variable combinations", async () => {
      // Only PACKAGE_A__testVarA set
      process.env.PACKAGE_A__testVarA = "custom-a";
      const hashA = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Only PACKAGE_A__testVarB set
      delete process.env.PACKAGE_A__testVarA;
      process.env.PACKAGE_A__testVarB = "custom-b";
      const hashB = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Both set
      process.env.PACKAGE_A__testVarA = "custom-a";
      process.env.PACKAGE_A__testVarB = "custom-b";
      const hashBoth = await getBuildEnvHash(workspace.root, workspace.packageA);

      // All hashes should be different
      expect(hashA).not.toBe(hashB);
      expect(hashA).not.toBe(hashBoth);
      expect(hashB).not.toBe(hashBoth);
    });

    it("should remain stable when unrelated files change", async () => {
      // Get initial hash
      const initialHash = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Modify multiple unrelated files
      const indexPath = join(workspace.packageA, "src", "index.ts");
      const packageJsonPath = join(workspace.packageA, "package.json");
      const tsconfigPath = join(workspace.packageA, "tsconfig.json");

      const indexContent = readFileSync(indexPath, "utf-8");
      const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf-8"));
      const tsconfig = JSON.parse(readFileSync(tsconfigPath, "utf-8"));

      writeFileSync(indexPath, indexContent + "\n// Modified content\n");
      packageJson.version = "2.0.0";
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      tsconfig.compilerOptions = tsconfig.compilerOptions || {};
      tsconfig.compilerOptions.strict = true;
      writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));

      // Get new hash
      const newHash = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Hash should remain the same (env hasn't changed)
      expect(newHash).toBe(initialHash);
    });

    it("should independently track environment changes for different packages", async () => {
      // Set PACKAGE_A__testVarA for package-a
      process.env.PACKAGE_A__testVarA = "custom-a";
      const hashA1 = await getBuildEnvHash(workspace.root, workspace.packageA);

      // Set PACKAGE_B__testVarC for package-b (doesn't affect package-a)
      process.env.PACKAGE_B__testVarC = "custom-c";
      const hashA2 = await getBuildEnvHash(workspace.root, workspace.packageA);
      const hashB1 = await getBuildEnvHash(workspace.root, workspace.packageB);

      // package-a hash should remain the same (PACKAGE_B__testVarC doesn't affect it)
      expect(hashA2).toBe(hashA1);

      // Change PACKAGE_B__testVarC again
      process.env.PACKAGE_B__testVarC = "different-c";
      const hashB2 = await getBuildEnvHash(workspace.root, workspace.packageB);

      // package-b hash should change
      expect(hashB2).not.toBe(hashB1);
    });
  });

  describe("special cases", () => {
    it("should handle complex environment variable values", async () => {
      process.env.PACKAGE_A__testVarA = "value with spaces and special chars: @#$%";
      process.env.PACKAGE_A__testVarB = "multi\nline\nvalue";

      const hash = await getBuildEnvHash(workspace.root, workspace.packageA);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("should handle empty string environment variables", async () => {
      process.env.PACKAGE_A__testVarA = "";

      const hash = await getBuildEnvHash(workspace.root, workspace.packageA);

      expect(hash).toBeDefined();
      expect(hash).toHaveLength(64);
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });
  });

  describe("error handling", () => {
    it("should throw error for non-existent package", async () => {
      const nonExistentPkg = join(workspace.root, "packages", "non-existent-package");
      await expect(getBuildEnvHash(workspace.root, nonExistentPkg)).rejects.toThrow();
    });
  });
});
