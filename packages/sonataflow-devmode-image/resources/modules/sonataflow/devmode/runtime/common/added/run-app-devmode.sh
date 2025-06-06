#!/usr/bin/env bash
#
# Licensed to the Apache Software Foundation (ASF) under one
# or more contributor license agreements. See the NOTICE file
# distributed with this work for additional information
# regarding copyright ownership. The ASF licenses this file
# to you under the Apache License, Version 2.0 (the
# "License"); you may not use this file except in compliance
# with the License. You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing,
# software distributed under the License is distributed on an
# "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
# KIND, either express or implied. See the License for the
# specific language governing permissions and limitations
# under the License.
#

set -e

script_dir_path="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck source=/dev/null
source "${script_dir_path}/logging.sh"

if [ "${SCRIPT_DEBUG}" = "true" ]; then
    set -x
    export MAVEN_ARGS_APPEND="${MAVEN_ARGS_APPEND} -X --batch-mode"
    log_info "Script debugging is enabled, allowing bash commands and their arguments to be printed as they are executed"
    printenv
fi

# Optional override for Quarkus registry config
if [ -n "$QUARKUS_REGISTRY_CONFIG_PATH" ] && [ -f "$QUARKUS_REGISTRY_CONFIG_PATH" ]; then
    log_info "-> Using custom Quarkus registry config: $QUARKUS_REGISTRY_CONFIG_PATH"
    cp -v "$QUARKUS_REGISTRY_CONFIG_PATH" "${KOGITO_HOME}/.quarkus/config.yaml"
fi

# Copy .mvn/jvm.config if provided
find . -maxdepth 5 -name 'jvm.config' -exec echo "--> found {}" \; -exec mkdir -p .mvn \; -exec cp -v {} .mvn/ \;

# Configure memory and JVM/Maven settings
source "${script_dir_path}/configure-jvm-mvn.sh"

# Determine if we run offline
offline_param="-o"
if [ -n "${QUARKUS_EXTENSIONS}" ]; then
    ${KOGITO_HOME}/launch/add-extension.sh "${QUARKUS_EXTENSIONS}" "true"
    offline_param=""
fi

CMD="\"${MAVEN_CMD}\" -B ${MAVEN_ARGS_APPEND} \
    ${offline_param} \
    -s \"${MAVEN_SETTINGS_PATH}\" \
    -DskipTests \
    -Dquarkus.http.host=0.0.0.0 \
    -Dquarkus.test.continuous-testing=${QUARKUS_CONTINUOUS_TESTING:-disabled} \
    -Dquarkus.analytics.disabled=${QUARKUS_ANALYTICS_DISABLED:-true} \
    clean compile quarkus:dev"

# Run the Quarkus app
log_info "Running application start mvn command"
echo "$CMD"
eval "$CMD"
