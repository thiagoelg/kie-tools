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

import isEven from "is-even";
import isNumber from "is-number";

export function checkEven(num: number): boolean {
  return isEven(num);
}

export function getEvenNumbers(max: number): number[] {
  const result: number[] = [];
  for (let i = 0; i <= max; i++) {
    if (checkEven(i)) {
      result.push(i);
    }
  }
  return result;
}

export function validateNumber(value: any): boolean {
  return isNumber(value);
}
