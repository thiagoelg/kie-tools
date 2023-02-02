/*
 * Copyright 2023 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package pkg

import (
	"strings"

	"github.com/kiegroup/kie-tools/examples/commit-message-validation-service/pkg/metadata"
	"github.com/kiegroup/kie-tools/examples/commit-message-validation-service/pkg/validators"
)

var validatorsMap = map[string]validators.ValidationFunction{
	"Length":      validators.Length,
	"IssuePrefix": validators.IssuePrefix,
}

var enabledValidators = strings.Split(metadata.Validators, ";")

type ValidationResult struct {
	Result  bool     `json:"result"`
	Reasons []string `json:"reasons,omitempty"`
}

func Validate(message string) *ValidationResult {
	var result bool = true
	var reasons []string

	for _, validatorNameAndOptions := range enabledValidators {
		var validator = strings.Split(validatorNameAndOptions, ":")
		var validationResult = validatorsMap[validator[0]](message, validator[1])

		if !validationResult.Result {
			result = validationResult.Result
			reasons = append(reasons, validationResult.Reason)
		}
	}

	return &ValidationResult{
		Result:  result,
		Reasons: reasons,
	}
}
