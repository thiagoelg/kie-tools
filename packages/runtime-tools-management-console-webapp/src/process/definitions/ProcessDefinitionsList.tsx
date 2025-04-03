/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React, { useEffect, useMemo } from "react";
import {
  ProcessDefinitionsFilter,
  ProcessDefinitionsListState,
} from "@kie-tools/runtime-tools-process-gateway-api/dist/types";
import { EmbeddedProcessDefinitionsList } from "@kie-tools/runtime-tools-process-enveloped-components/dist/processDefinitionsList";
import { useHistory } from "react-router";
import { useQueryParam, useQueryParams } from "../../navigation/queryParams/QueryParamsContext";
import { QueryParams } from "../../navigation/Routes";
import { RuntimePathSearchParamsRoutes, useRuntimeDispatch } from "../../runtime/RuntimeContext";

import {
  ProcessDefinitionsListGatewayApi,
  useProcessDefinitionsListGatewayApi,
} from "@kie-tools/runtime-tools-process-webapp-components/dist/ProcessDefinitionsList";
import { ProcessDefinition } from "@kie-tools/runtime-tools-process-gateway-api/dist/types";

const defaultFilters = {
  processNames: [],
};

interface Props {
  onNavigateToProcessDefinitionForm: (processName: string) => void;
}

export const ProcessDefinitionsList: React.FC<Props> = ({ onNavigateToProcessDefinitionForm }) => {
  const gatewayApi: ProcessDefinitionsListGatewayApi = useProcessDefinitionsListGatewayApi();
  const history = useHistory();
  const filters = useQueryParam(QueryParams.FILTERS);
  const queryParams = useQueryParams();
  const { setRuntimePathSearchParams } = useRuntimeDispatch();

  const initialState: ProcessDefinitionsListState = useMemo(() => {
    return {
      filters: filters ? (JSON.parse(filters) as ProcessDefinitionsFilter) : defaultFilters,
    };
  }, [filters]);

  useEffect(() => {
    const newSearchParams = {
      [QueryParams.FILTERS]: JSON.stringify(initialState.filters),
    };
    setRuntimePathSearchParams((currentRuntimePathSearchParams) => {
      return currentRuntimePathSearchParams.set(RuntimePathSearchParamsRoutes.PROCESS_DEFINITIONS, newSearchParams);
    });
  }, [initialState, setRuntimePathSearchParams]);

  useEffect(() => {
    const onOpenInstanceUnsubscriber = gatewayApi.onOpenProcessDefinitionListen({
      onOpen(processDefinition: ProcessDefinition) {
        onNavigateToProcessDefinitionForm(processDefinition.processName);
      },
    });

    return () => {
      onOpenInstanceUnsubscriber.unSubscribe();
    };
  }, [gatewayApi, onNavigateToProcessDefinitionForm]);

  useEffect(() => {
    const unsubscriber = gatewayApi.onUpdateProcessDefinitionsListState({
      onUpdate(processDefinitionsListState: ProcessDefinitionsListState) {
        const newSearchParams = {
          [QueryParams.FILTERS]: JSON.stringify(processDefinitionsListState.filters),
        };
        setRuntimePathSearchParams((currentRuntimePathSearchParams) => {
          return currentRuntimePathSearchParams.set(RuntimePathSearchParamsRoutes.PROCESS_DEFINITIONS, newSearchParams);
        });
        const newQueryParams = queryParams.with(QueryParams.FILTERS, newSearchParams[QueryParams.FILTERS]);
        history.replace({ pathname: history.location.pathname, search: newQueryParams.toString() });
      },
    });

    return () => {
      unsubscriber.unSubscribe();
    };
  }, [gatewayApi, history, queryParams, setRuntimePathSearchParams]);

  return (
    <EmbeddedProcessDefinitionsList
      driver={gatewayApi}
      targetOrigin={window.location.origin}
      singularProcessLabel={"Process Definition"}
      initialState={initialState}
    />
  );
};
