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

package org.jboss.errai.ui.rebind.chain;

import org.jboss.errai.ui.shared.chain.Command;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;

/**
 * @author edewit@redhat.com
 */
public class DummyRemover implements Command {

  @Override
  public void execute(Element element) {
    String dummy = element.getAttribute("data-role");

    if (dummy != null && "dummy".equals(dummy)) {
      final NodeList childNodes = element.getChildNodes();
      for (int i = 0, len = childNodes.getLength(); i < len; i++) {
        element.removeChild(childNodes.item(0));
      }
    }
  }
}
