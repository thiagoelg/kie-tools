/*
 * Copyright (C) 2015 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jboss.errai.ioc.rebind.ioc.graph.impl;

import org.jboss.errai.codegen.meta.MetaClass;
import org.jboss.errai.ioc.rebind.ioc.graph.api.DependencyGraphBuilder.InjectableType;
import org.jboss.errai.ioc.rebind.ioc.graph.api.ProvidedInjectable;

/**
 * @see ProvidedInjectable
 * @author Max Barkley <mbarkley@redhat.com>
 */
class ProvidedInjectableImpl extends ConcreteInjectable implements ProvidedInjectable {

  final InjectionSite site;
  final ExtensionInjectable injectable;

  ProvidedInjectableImpl(final ExtensionInjectable injectable, final InjectionSite site) {
    super(injectable.type, injectable.qualifier, injectable.getFactoryNameForInjectionSite(site),
            injectable.literalScope, InjectableType.ExtensionProvided, injectable.wiringTypes);
    this.site = site;
    this.injectable = injectable;
  }

  @Override
  public InjectionSite getInjectionSite() {
    return site;
  }

  @Override
  public MetaClass getInjectedType() {
    return site.getExactType();
  }

}
