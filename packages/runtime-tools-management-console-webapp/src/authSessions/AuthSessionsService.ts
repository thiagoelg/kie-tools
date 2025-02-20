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

import * as client from "openid-client";
import {
  AUTH_SESSION_RUNTIME_AUTH_SERVER_URL_ENDPOINT,
  AUTH_SESSION_TEMP_OPENID_AUTH_DATA_STORAGE_KEY,
  AUTH_SESSIONS_VERSION_NUMBER,
  AuthSession,
  AuthSessionStatus,
  AuthSessionType,
  isUnauthenticatedAuthSession,
  OidcAuthUrlParameters,
  OpenIDConnectAuthSession,
  TemporaryAuthSessionData,
  UnauthenticatedAuthSession,
} from "./AuthSessionApi";
import path from "path";
import { v4 as uuid } from "uuid";

export class AuthSessionsService {
  static async getIdentityProviderConfig(args: { authServerUrl: string; clientId: string }) {
    const authUrl = new URL(args.authServerUrl);
    const options = authUrl.protocol === "http:" ? { execute: [client.allowInsecureRequests] } : {};
    const config: client.Configuration = await client.discovery(authUrl, args.clientId, undefined, undefined, options);
    return config;
  }

  static async buildAuthParameters(args: {
    config: client.Configuration;
    loginSuccessRoute: string;
    forceLoginPrompt?: boolean;
  }) {
    const code_challenge_method = "S256";
    /**
     * The following (code_verifier and potentially nonce) MUST be generated for
     * every redirect to the authorization_endpoint. You must store the
     * code_verifier and nonce in the end-user session such that it can be recovered
     * as the user gets redirected from the authorization server back to your
     * application.
     */
    const code_verifier = client.randomPKCECodeVerifier();
    const code_challenge = await client.calculatePKCECodeChallenge(code_verifier);
    let nonce: string | undefined = undefined;

    // redirect user to as.authorization_endpoint
    const parameters: OidcAuthUrlParameters = {
      redirect_uri: args.loginSuccessRoute,
      scope: "openid email",
      code_verifier,
      code_challenge,
      code_challenge_method,
      state: uuid(),
      ...(args.forceLoginPrompt ? { prompt: "login" } : {}),
    };

    /**
     * We cannot be sure the AS supports PKCE so we're going to use nonce too. Use
     * of PKCE is backwards compatible even if the AS doesn't support it which is
     * why we're using it regardless.
     */
    if (!args.config.serverMetadata().supportsPKCE()) {
      nonce = client.randomNonce();
      parameters.nonce = nonce;
    }

    return parameters;
  }

  static async redirectToIdentityProviderLogin(args: {
    name: string;
    runtimeUrl: string;
    clientId: string;
    config: client.Configuration;
    parameters: OidcAuthUrlParameters;
  }) {
    const redirectTo = client.buildAuthorizationUrl(args.config, args.parameters);

    const tempOpenIdAuthData: TemporaryAuthSessionData = {
      isAuthenticationRequired: true,
      runtimeUrl: args.runtimeUrl,
      clientId: args.clientId,
      name: args.name,
      parameters: args.parameters,
      serverMetadata: args.config.serverMetadata(),
    };

    window.localStorage.setItem(AUTH_SESSION_TEMP_OPENID_AUTH_DATA_STORAGE_KEY, JSON.stringify(tempOpenIdAuthData));

    window.location.href = redirectTo.href;
  }

  static async getIdentityProviderUrl(runtimeUrl: string) {
    const newPath = path.join(new URL(runtimeUrl).pathname, AUTH_SESSION_RUNTIME_AUTH_SERVER_URL_ENDPOINT);
    const oidcUrl = new URL(newPath, runtimeUrl);
    const response = await fetch(oidcUrl);
    if (response.status !== 200) {
      throw new Error("No authentication endpoint found.");
    }
    return oidcUrl;
  }

  static async checkIfAuthenticationRequired(runtimeUrl: string): Promise<
    | {
        isAuthenticationRequired: true;
        authServerUrl: string;
      }
    | { isAuthenticationRequired: false }
  > {
    try {
      const oidcUrl = await AuthSessionsService.getIdentityProviderUrl(runtimeUrl);
      return {
        isAuthenticationRequired: true,
        authServerUrl: oidcUrl.toString(),
      };
    } catch (authServerError) {
      // Maybe not required?
      // Does the runtime exist?
      // If 200, then runtime exists and is not asking for authentication
      const response = await fetch(runtimeUrl);
      if (response.status === 200 || response.status === 404) {
        return {
          isAuthenticationRequired: false,
        };
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(
          `Runtime server ${runtimeUrl} requires authentication but didn't provide the Identity Provider URL!`
        );
      } else {
        throw new Error(`Ivalid response from runtime server: ${runtimeUrl}! Is the URL correct?`);
      }
    }
  }

  static async authenticate(args: {
    runtimeUrl: string;
    authServerUrl: string;
    clientId: string;
    name: string;
    forceLoginPrompt?: boolean;
    loginSuccessRoute: string;
  }) {
    const config = await AuthSessionsService.getIdentityProviderConfig(args);

    const parameters = await AuthSessionsService.buildAuthParameters({
      config,
      loginSuccessRoute: args.loginSuccessRoute,
      forceLoginPrompt: args.forceLoginPrompt,
    });

    await AuthSessionsService.redirectToIdentityProviderLogin({ ...args, config, parameters });
  }

  static async logout(args: { authSession: AuthSession; clientId: string }) {
    if (isUnauthenticatedAuthSession(args.authSession)) {
      return;
    }

    const config = await AuthSessionsService.getIdentityProviderConfig({
      authServerUrl: args.authSession.issuer,
      clientId: args.clientId,
    });

    if (!args.authSession.tokens.refresh_token) {
      throw new Error(`No refresh_token found for AuthSession ${args.authSession.id}!`);
    }

    const endSessionUrl = client.buildEndSessionUrl(config, {
      post_logout_redirect_uri: window.location.href,
      id_token_hint: args.authSession.tokens.id_token!,
    });

    window.location.href = endSessionUrl.toString();
  }

  static async reauthenticate(args: { authSession: OpenIDConnectAuthSession; clientId: string }) {
    const config = await AuthSessionsService.getIdentityProviderConfig({
      authServerUrl: args.authSession.issuer,
      clientId: args.clientId,
    });

    if (!args.authSession.tokens.refresh_token) {
      throw new Error(`No refresh_token found for AuthSession ${args.authSession.id}!`);
    }

    const tokens = await client.refreshTokenGrant(config, args.authSession.tokens.refresh_token);

    const { access_token } = tokens;
    const claims = tokens.claims();
    if (!claims) {
      // expires_in was not returned by the authorization server
      throw new Error("Failed to extract claims from token.");
    }
    const { sub } = claims;
    const userInfo = await client.fetchUserInfo(config, access_token, sub);

    return {
      tokens,
      claims,
      userInfo,
      tokensRefreshedAtDateISO: new Date(Date.now()).toISOString(),
      status: AuthSessionStatus.VALID,
    };
  }

  static getTemporaryAuthSessionData() {
    return JSON.parse(
      window.localStorage.getItem(AUTH_SESSION_TEMP_OPENID_AUTH_DATA_STORAGE_KEY)!
    ) as TemporaryAuthSessionData;
  }

  static cleanTemporaryAuthSessionData() {
    window.localStorage.removeItem(AUTH_SESSION_TEMP_OPENID_AUTH_DATA_STORAGE_KEY);
  }

  static async buildAuthSession(temporaryAuthSessionData: TemporaryAuthSessionData): Promise<AuthSession> {
    if (!temporaryAuthSessionData.isAuthenticationRequired) {
      const authSession: UnauthenticatedAuthSession = {
        id: uuid(),
        type: AuthSessionType.UNAUTHENTICATED,
        version: AUTH_SESSIONS_VERSION_NUMBER,
        name: temporaryAuthSessionData.name,
        impersonator: true,
        runtimeUrl: temporaryAuthSessionData.runtimeUrl,
        status: AuthSessionStatus.VALID,
        createdAtDateISO: new Date(Date.now()).toISOString(),
      };
      return Promise.resolve(authSession);
    }

    const runtimeOidcProxyUrl = new URL(
      path.join(new URL(temporaryAuthSessionData.runtimeUrl).pathname, AUTH_SESSION_RUNTIME_AUTH_SERVER_URL_ENDPOINT),
      temporaryAuthSessionData.runtimeUrl
    );

    const config = new client.Configuration(temporaryAuthSessionData.serverMetadata, temporaryAuthSessionData.clientId);
    if (runtimeOidcProxyUrl.protocol === "http:") {
      client.allowInsecureRequests(config);
    }

    // Authorization Code Grant
    const currentUrl: URL = new URL(window.location.href);
    const tokens = await client.authorizationCodeGrant(config, currentUrl, {
      pkceCodeVerifier: temporaryAuthSessionData.parameters.code_verifier,
      expectedState: temporaryAuthSessionData.parameters.state,
      expectedNonce: temporaryAuthSessionData.parameters.nonce,
      idTokenExpected: true,
    });

    const { access_token } = tokens;
    const claims = tokens.claims();
    if (!claims) {
      // expires_in was not returned by the authorization server
      throw new Error("Failed to extract claims from token.");
    }
    const { sub } = claims;
    const userInfo = await client.fetchUserInfo(config, access_token, sub);

    const authSession: OpenIDConnectAuthSession = {
      id: uuid(),
      type: AuthSessionType.OPENID_CONNECT,
      version: AUTH_SESSIONS_VERSION_NUMBER,
      name: temporaryAuthSessionData.name,
      username: userInfo.preferred_username,
      // TODO: This changes between IdPs. Figure out how a generic way to list the users roles.
      roles: [],
      // TODO: Somehow get this information from the Kogito application.
      impersonator: true,
      clientId: temporaryAuthSessionData.clientId,
      tokens,
      claims,
      runtimeUrl: temporaryAuthSessionData.runtimeUrl,
      issuer: runtimeOidcProxyUrl.toString(),
      userInfo: userInfo,
      status: AuthSessionStatus.VALID,
      createdAtDateISO: new Date(Date.now()).toISOString(),
      tokensRefreshedAtDateISO: new Date(Date.now()).toISOString(),
    };

    return authSession;
  }
}
