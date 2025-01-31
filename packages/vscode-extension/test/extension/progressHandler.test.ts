// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
"use strict";

import * as sinon from "sinon";
import * as chai from "chai";
import { window } from "vscode";

import { ProgressHandler } from "../../src/progressHandler";
import * as commonUtils from "../../src/utils/commonUtils";
import * as localizeUtils from "../../src/utils/localizeUtils";
import * as vscodeMocks from "../mocks/vsc";

describe("ProgressHandler", () => {
  let message: string | undefined = undefined;
  beforeEach(() => {
    sinon.stub(window, "withProgress").callsFake(async (options, task) => {
      return await task(
        {
          report: (value) => {
            message = value.message;
          },
        },
        new vscodeMocks.CancellationToken()
      );
    });
    sinon.stub(commonUtils, "sleep").callsFake(async () => {});
    sinon.stub(localizeUtils, "localize").callsFake((key) => {
      if (key === "teamstoolkit.progressHandler.showOutputLink") {
        return "Check [output window](%s) for details.";
      } else if (key === "teamstoolkit.progressHandler.showTerminalLink") {
        return "Check [terminal window](%s) for details.";
      } else if (key === "teamstoolkit.progressHandler.prepareTask") {
        return " Prepare task.";
      } else if (key === "teamstoolkit.progressHandler.reloadNotice") {
        return "%s%s%s (Notice: You can reload the window and retry if task spends too long time.)";
      }
      return "";
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("terminal", async () => {
    const progressHandler = new ProgressHandler("test title", 1, "terminal");
    let expected =
      "test title: [0/1] Check [terminal window](command:workbench.action.terminal.focus) for details. Prepare task. (Notice: You can reload the window and retry if task spends too long time.)";
    await progressHandler.start();
    chai.assert.equal(message, expected);
    await progressHandler.next("test message.");
    expected =
      "test title: [1/1] Check [terminal window](command:workbench.action.terminal.focus) for details. test message. (Notice: You can reload the window and retry if task spends too long time.)";
    chai.assert.equal(message, expected);
    sinon.restore();
  });

  it("output", async () => {
    const progressHandler = new ProgressHandler("test title", 1, "output");
    let expected =
      "test title: [0/1] Check [output window](command:fx-extension.showOutputChannel) for details. Prepare task. (Notice: You can reload the window and retry if task spends too long time.)";
    await progressHandler.start();
    chai.assert.equal(message, expected);
    await progressHandler.next("test message.");
    expected =
      "test title: [1/1] Check [output window](command:fx-extension.showOutputChannel) for details. test message. (Notice: You can reload the window and retry if task spends too long time.)";
    chai.assert.equal(message, expected);
    sinon.restore();
  });
});
