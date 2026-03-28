<!--
   Licensed to the Apache Software Foundation (ASF) under one
   or more contributor license agreements.  See the NOTICE file
   distributed with this work for additional information
   regarding copyright ownership.  The ASF licenses this file
   to you under the Apache License, Version 2.0 (the
   "License"); you may not use this file except in compliance
   with the License.  You may obtain a copy of the License at
     http://www.apache.org/licenses/LICENSE-2.0
   Unless required by applicable law or agreed to in writing,
   software distributed under the License is distributed on an
   "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
   KIND, either express or implied.  See the License for the
   specific language governing permissions and limitations
   under the License.
-->

# @kie-tools/build-cache :: TESTS

## Overview

Unit tests are located in the `tests` folder and use Jest with real pnpm libraries (no mocks).

## Running Tests

```bash
pnpm test
```

## Test Structure

### Test Helper

The `tests/helpers/testWorkspace.ts` module provides a reusable `TestWorkspace` class for managing test fixtures:

```typescript
import { createTestWorkspace } from "./helpers/testWorkspace";

const workspace = createTestWorkspace(join(__dirname, "fixtures"));

beforeAll(() => {
  workspace.setup(); // Installs dependencies and generates lockfile
});

afterAll(() => {
  workspace.cleanup(); // Removes node_modules and lockfile
});
```

**TestWorkspace API:**

- `workspace.root` - Path to test workspace root
- `workspace.packageA` - Path to package-a
- `workspace.packageB` - Path to package-b
- `workspace.packageC` - Path to package-c
- `workspace.lockfilePath` - Path to pnpm-lock.yaml
- `workspace.setup()` - Initialize workspace
- `workspace.cleanup()` - Clean up workspace
- `workspace.reinstall()` - Reinstall dependencies (useful after modifying package.json)
- `workspace.isSetup()` - Check if workspace is ready

### Test Fixtures

The `tests/fixtures/test-workspace` directory contains a minimal pnpm monorepo for testing:

```
test-workspace/
├── pnpm-workspace.yaml
├── package.json
└── packages/
    ├── package-a/       # Has dependency: is-odd@3.0.1
    ├── package-b/       # Has dependencies: is-even@1.0.0, devDependencies: is-number@7.0.0
    └── package-c/       # No dependencies
```

The workspace uses minimal, stable npm packages with few transitive dependencies, making tests fast and reliable.

## Test Coverage

### Lockfile.test.ts

Tests for the `getLockfileHash` function:

- **Hash Generation**: Validates SHA-256 hash format and consistency
- **Hash Sensitivity**: Ensures hashes change when dependencies change
- **Hash Stability**: Verifies hashes remain stable when unrelated packages change
- **Error Handling**: Tests error cases (missing lockfile, invalid paths)
- **Path Handling**: Validates correct handling of absolute and nested paths

## Adding New Tests

1. Import the test workspace helper:

   ```typescript
   import { createTestWorkspace } from "./helpers/testWorkspace";
   ```

2. Create a workspace instance:

   ```typescript
   const workspace = createTestWorkspace(join(__dirname, "fixtures"));
   ```

3. Use `beforeAll` and `afterAll` hooks for setup/cleanup

4. Access workspace paths via the helper properties

The test workspace is shared across all tests, so setup is only performed once per test run.
