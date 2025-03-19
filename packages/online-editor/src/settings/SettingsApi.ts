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

import { LfsFsCache } from "@kie-tools-core/workspaces-git-fs/dist/lfs/LfsFsCache";
import { LfsStorageService } from "@kie-tools-core/workspaces-git-fs/dist/lfs/LfsStorageService";

export const settingsFsCache = new LfsFsCache();
export const settingsFsService = new LfsStorageService();
export const settingsBroadcastChannel = new BroadcastChannel("settings");

export const SETTINGS_FILE_PATH = "/settings.json";
export const SETTINGS_FS_NAME = "settings";

export const SETTINGS_VERSION_NUMBER = 0;
export const SETTINGS_FS_NAME_WITH_VERSION = `${SETTINGS_FS_NAME}_v${SETTINGS_VERSION_NUMBER.toString()}`;

export function mapSerializer(_: string, value: any) {
  if (value instanceof Map) {
    return {
      __$$jsClassName: "Map",
      value: Array.from(value.entries()),
    };
  }
  return value;
}

export function mapDeSerializer(_: string, value: any) {
  if (typeof value === "object" && value) {
    if (value.__$$jsClassName === "Map") {
      return new Map(value.value);
    }
  }
  return value;
}
