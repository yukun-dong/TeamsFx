// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import axios, { AxiosInstance } from "axios";
import * as chai from "chai";

import MockM365TokenProvider from "../../src/commonlib/m365LoginUserPassword";
import { M365TokenProvider } from "@microsoft/teamsfx-api";
import { IAppStudioObject } from "./interfaces/IAADDefinition";
import { AppStudioScopes } from "@microsoft/teamsfx-core/build/common/tools";

const appStudioPluginName = "fx-resource-appstudio";

export class AppStudioValidator {
  public static provider: M365TokenProvider;

  public static setE2ETestProvider(): void {
    this.provider = MockM365TokenProvider;
  }

  public static init(ctx: any, provider?: M365TokenProvider) {
    AppStudioValidator.provider = provider || MockM365TokenProvider;

    const appStudioObject: IAppStudioObject | undefined = ctx[appStudioPluginName];
    chai.assert.exists(appStudioObject);

    console.log("Successfully init validator for App Studio.");
    return appStudioObject!;
  }

  public static async validatePublish(appId: string): Promise<void> {
    const appStudioTokenRes = await this.provider.getAccessToken({ scopes: AppStudioScopes });
    const appStudioToken = appStudioTokenRes.isOk() ? appStudioTokenRes.value : undefined;
    chai.assert.isNotEmpty(appStudioToken);

    const requester = this.createRequesterWithToken(appStudioToken!);
    const response = await requester.get(`/api/publishing/${appId}`);
    if (response.data.error) {
      chai.assert.fail(
        `Publish failed, code: ${response.data.error.code}, message: ${response.data.error.message}`
      );
    }
  }

  public static async validateTeamsAppExist(appStudioObject: IAppStudioObject): Promise<void> {
    chai.assert.exists(appStudioObject.teamsAppId);
    await this.getApp(appStudioObject.teamsAppId!);
  }

  public static async deleteApp(teamsAppId: string): Promise<void> {
    const appStudioTokenRes = await this.provider.getAccessToken({ scopes: AppStudioScopes });
    const appStudioToken = appStudioTokenRes.isOk() ? appStudioTokenRes.value : undefined;
    chai.assert.isNotEmpty(appStudioToken);
    const requester = AppStudioValidator.createRequesterWithToken(appStudioToken!);
    try {
      const response = await requester.delete(`/api/appdefinitions/${teamsAppId}`);
      chai.assert.isTrue(response.status >= 200 && response.status < 300);
      return;
    } catch (e) {
      chai.assert.fail(`Failed to delete Teams App, error: ${e}`);
    }
  }

  private static createRequesterWithToken(appStudioToken: string): AxiosInstance {
    const instance = axios.create({
      baseURL: "https://dev.teams.microsoft.com",
    });
    instance.defaults.headers.common["Authorization"] = `Bearer ${appStudioToken}`;
    return instance;
  }

  public static async checkWetherAppExists(teamsAppId: string): Promise<boolean> {
    const appStudioTokenRes = await this.provider.getAccessToken({ scopes: AppStudioScopes });
    const appStudioToken = appStudioTokenRes.isOk() ? appStudioTokenRes.value : undefined;
    if (!appStudioToken) {
      throw new Error("Failed to get token");
    }
    const requester = AppStudioValidator.createRequesterWithToken(appStudioToken);
    try {
      const response = await requester.get(`/api/appdefinitions/${teamsAppId}`);
      const app = response.data;
      return app && app.teamsAppId && app.teamsAppId === teamsAppId;
    } catch (e) {
      return false;
    }
  }

  public static async getApp(teamsAppId: string): Promise<JSON> {
    const appStudioTokenRes = await this.provider.getAccessToken({ scopes: AppStudioScopes });
    const appStudioToken = appStudioTokenRes.isOk() ? appStudioTokenRes.value : undefined;
    chai.assert.isNotEmpty(appStudioToken);
    const requester = AppStudioValidator.createRequesterWithToken(appStudioToken!);
    try {
      const response = await requester.get(`/api/appdefinitions/${teamsAppId}`);
      chai.assert.isTrue(response && response.data);
      const app = response.data;
      chai.assert.isTrue(app && app.teamsAppId && app.teamsAppId === teamsAppId);
      return app;
    } catch (e) {
      chai.assert.fail(`Failed to get Teams App, error: ${e}`);
    }
  }
}
