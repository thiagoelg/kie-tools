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

/**
 * Common type for all hash input functions in the build cache system.
 * Each implementation generates a hash based on different aspects of the build.
 *
 * The type allows each function to extend the base parameters (root, pkgDir)
 * with additional custom parameters specific to their hashing logic.
 *
 * @template TArgs - Additional arguments specific to the hash input function
 * @param root - The root directory of the workspace
 * @param pkgDir - The package directory path
 * @param args - Additional custom arguments for the specific hash input
 * @returns A promise that resolves to a hash string
 */
export type HashInput<TArgs extends any[] = []> = (root: string, pkgDir: string, ...args: TArgs) => Promise<string>;

// Made with Bob
