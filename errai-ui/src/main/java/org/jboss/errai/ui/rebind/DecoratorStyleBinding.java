/*
 * Copyright 2012 JBoss, by Red Hat, Inc
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jboss.errai.ui.rebind;

import com.google.gwt.dom.client.Style;
import com.google.gwt.user.client.Element;
import org.jboss.errai.bus.client.api.builder.MessageBuildParms;
import org.jboss.errai.codegen.Parameter;
import org.jboss.errai.codegen.Statement;
import org.jboss.errai.codegen.builder.impl.ObjectBuilder;
import org.jboss.errai.codegen.meta.MetaClass;
import org.jboss.errai.codegen.meta.MetaClassFactory;
import org.jboss.errai.codegen.meta.MetaConstructor;
import org.jboss.errai.codegen.meta.MetaMethod;
import org.jboss.errai.codegen.meta.MetaParameter;
import org.jboss.errai.codegen.util.Refs;
import org.jboss.errai.codegen.util.Stmt;
import org.jboss.errai.ioc.client.api.CodeDecorator;
import org.jboss.errai.ioc.client.container.InitializationCallback;
import org.jboss.errai.ioc.rebind.ioc.extension.IOCDecoratorExtension;
import org.jboss.errai.ioc.rebind.ioc.injector.InjectUtil;
import org.jboss.errai.ioc.rebind.ioc.injector.api.InjectableInstance;
import org.jboss.errai.ui.shared.api.annotations.AutoBound;
import org.jboss.errai.ui.shared.api.annotations.style.StyleBinding;
import org.jboss.errai.ui.shared.api.style.StyleBindingChangeHandler;
import org.jboss.errai.ui.shared.api.style.StyleBindingExecutor;
import org.jboss.errai.ui.shared.api.style.StyleBindingsRegistry;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;

/**
 * @author Mike Brock
 */
@CodeDecorator
public class DecoratorStyleBinding extends IOCDecoratorExtension<StyleBinding> {
  private static final String DATA_BINDING_CONFIG_ATTR = "StyleBinding:DataBinderConfigured";

  public DecoratorStyleBinding(Class<StyleBinding> decoratesWith) {
    super(decoratesWith);
  }

  @Override
  public List<? extends Statement> generateDecorator(InjectableInstance<StyleBinding> ctx) {
    final Statement valueAccessor;

    switch (ctx.getTaskType()) {
      case Method:
      case PrivateMethod:
        final MetaParameter[] parameters = ctx.getMethod().getParameters();
        if (!ctx.getMethod().getReturnType().isVoid() && parameters.length == 0) {
          valueAccessor = InjectUtil.invokePublicOrPrivateMethod(
              ctx.getInjectionContext(),
              Refs.get(ctx.getInjector().getInstanceVarName()),
              ctx.getMethod());
        }
        else if (ctx.getMethod().getReturnType().isVoid() && parameters.length == 1) {
          // this method returns void and accepts exactly one parm. assume it's a handler method.
          return bindHandlingMethod(ctx, parameters[0]);
        }
        else {
          throw new RuntimeException("problem with style binding. method is not a valid binding " + ctx.getMethod());
        }
        break;

      case Field:
      case PrivateField:
        valueAccessor = InjectUtil.getPublicOrPrivateFieldValue(ctx.getInjectionContext(),
            Refs.get(ctx.getInjector().getInstanceVarName()), ctx.getField());
        break;

      default:
        throw new RuntimeException("problem with style binding. element target type is invalid: " + ctx.getTaskType());
    }

    final List<Statement> stmts = new ArrayList<Statement>();

    final DataBindingUtil.DataBinderLookup dataBinder = DataBindingUtil.getDataBinder(ctx);

    if (dataBinder != null) {
      if (!ctx.getInjector().hasAttribute(DATA_BINDING_CONFIG_ATTR))  {
        ctx.getInjector().setAttribute(DATA_BINDING_CONFIG_ATTR, Boolean.TRUE);

        stmts.add(Stmt.nestedCall(
            dataBinder.getValueAccessor()).invoke("addPropertyChangeHandler",
                Stmt.newObject(StyleBindingChangeHandler.class))
        );
      }
    }

    stmts.add(Stmt.invokeStatic(StyleBindingsRegistry.class, "get")
        .invoke("addElementBinding", ctx.getRawAnnotation().annotationType(),
            Stmt.nestedCall(valueAccessor).invoke("getElement")));

    if (!ctx.getInjector().hasAttribute(DecoratorStyleBinding.class.getName())) {

      final MetaClass initCallbackType = MetaClassFactory.parameterizedAs(InitializationCallback.class,
          MetaClassFactory.typeParametersOf(ctx.getEnclosingType()));

      final ObjectBuilder initCallback = Stmt.newObject(initCallbackType).extend()
          .publicOverridesMethod("init", Parameter.of(ctx.getEnclosingType(), "obj"))
          .append(Stmt.invokeStatic(StyleBindingsRegistry.class, "get").invoke("updateStyles"))
          .finish().finish();

      stmts.add(Stmt.loadVariable("context")
          .invoke("addInitializationCallback", Refs.get(ctx.getInjector().getInstanceVarName()), initCallback));

      ctx.getInjector().setAttribute(DecoratorStyleBinding.class.getName(), Boolean.TRUE);
    }

    return stmts;
  }

  private static List<? extends Statement> bindHandlingMethod(final InjectableInstance ctx, final MetaParameter parameter) {
    final Statement elementAccessor;
    if (MetaClassFactory.get(Element.class).isAssignableFrom(parameter.getType())) {
      elementAccessor = Refs.get("element");
    }
    else if (MetaClassFactory.get(Style.class).isAssignableFrom(parameter.getType())) {
      elementAccessor = Stmt.loadVariable("element").invoke("getStyle");
    }
    else {
      throw new RuntimeException("illegal target type for style binding method: " + parameter.getType() +
          "; expected Element or Style");
    }

    final ObjectBuilder bindExec = Stmt.newObject(StyleBindingExecutor.class)
        .extend()
        .publicOverridesMethod("invokeBinding", Parameter.of(Element.class, "element"))
        .append(InjectUtil.invokePublicOrPrivateMethod(
            ctx.getInjectionContext(),
            Refs.get(ctx.getTargetInjector().getInstanceVarName()),
            ctx.getMethod(),
            elementAccessor))
        .finish()
        .finish();

    return Collections.singletonList(Stmt.invokeStatic(StyleBindingsRegistry.class, "get")
            .invoke("addStyleBinding", ctx.getRawAnnotation().annotationType(), bindExec));
  }
}
