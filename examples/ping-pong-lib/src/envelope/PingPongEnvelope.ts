/*
 * Copyright 2020 Red Hat, Inc. and/or its affiliates.
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

import { EnvelopeBus } from "@kie-tooling-core/envelope-bus/dist/api";
import { Envelope, EnvelopeDivConfig, EnvelopeIFrameConfig } from "@kie-tooling-core/envelope";
import { PingPongChannelApi, PingPongEnvelopeApi } from "../api";
import { PingPongFactory } from "./PingPongFactory";
import { PingPongEnvelopeApiImpl } from "./PingPongEnvelopeApiImpl";

export function init(args: {
  config: EnvelopeDivConfig | EnvelopeIFrameConfig;
  container: HTMLElement;
  bus: EnvelopeBus;
  pingPongViewFactory: PingPongFactory;
  viewReady: () => Promise<() => HTMLElement>;
}) {
  const envelope = new Envelope<PingPongEnvelopeApi, PingPongChannelApi, HTMLElement, {}>(args.bus, args.config);

  return envelope.start(
    args.viewReady,
    {},
    {
      create: (apiFactoryArgs) => new PingPongEnvelopeApiImpl(apiFactoryArgs, args.pingPongViewFactory),
    }
  );
}
