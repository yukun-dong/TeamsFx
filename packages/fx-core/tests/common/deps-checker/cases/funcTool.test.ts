// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as chai from "chai";
import * as spies from "chai-spies";
import * as funcUtils from "../utils/funcTool";
import { logger } from "../adapters/testLogger";
import { TestTelemetry } from "../adapters/testTelemetry";
import { FuncToolChecker } from "../../../../src/common/deps-checker/internal/funcToolChecker";
import * as path from "path";
import * as os from "os";
import { cpUtils } from "../../../../src/common/deps-checker/util/cpUtils";
import { isLinux } from "../../../../src/common/deps-checker/util/system";
import { ConfigFolderName } from "@microsoft/teamsfx-api";

chai.use(spies);
const expect = chai.expect;
const assert = chai.assert;
const sandbox = chai.spy.sandbox();

function createTestChecker(): FuncToolChecker {
  const telemetry = new TestTelemetry();
  return new FuncToolChecker(logger, telemetry);
}

describe("FuncToolChecker E2E Test", async () => {
  beforeEach(async function () {
    await funcUtils.cleanup();
    sandbox.restore();
    console.error("cleanup portable func and sandbox");
  });

  test("not install + special character dir", async function () {
    if ((await funcUtils.isFuncCoreToolsInstalled()) || isLinux()) {
      this.skip();
    }

    const funcToolChecker = createTestChecker();
    sandbox.on(funcToolChecker, "getDefaultInstallPath", () =>
      path.join(os.homedir(), `.${ConfigFolderName}`, "bin", "func", "Aarón García", "for test")
    );

    const shouldContinue = await funcToolChecker.resolve();

    expect(shouldContinue).to.be.equal(true);
    expect(await funcToolChecker.isInstalled()).to.be.equal(true);
    assert.isTrue(
      /node "[^"]*"$/g.test(await funcToolChecker.command()),
      `should use portable func, and func command = ${await funcToolChecker.command()}`
    );
    await assertFuncStart(funcToolChecker);
  });

  test("not install + throw error when installing", async function () {
    if ((await funcUtils.isFuncCoreToolsInstalled()) || isLinux()) {
      this.skip();
    }

    // first: throw timeout error
    const funcToolChecker = createTestChecker();
    sandbox.on(funcToolChecker, "doInstallPortableFunc", async () =>
      console.log("spy on doInstallPortableFunc")
    );

    const shouldContinue = await funcToolChecker.resolve();
    assert.isFalse(shouldContinue);
    assert.isFalse(await funcToolChecker.isInstalled());

    // second: still works well
    sandbox.restore(funcToolChecker, "doInstallPortableFunc");
    const shouldContinueRetry = await funcToolChecker.resolve();

    assert.isTrue(shouldContinueRetry);
    assert.isTrue(await funcToolChecker.isInstalled(), "second run, should success");
    await assertFuncStart(funcToolChecker);
  });

  test("not install + linux + user cancel", async function () {
    if ((await funcUtils.isFuncCoreToolsInstalled()) || !isLinux()) {
      this.skip();
    }
    const funcToolChecker = createTestChecker();
    const depsInfo = await funcToolChecker.getDepsInfo();

    expect(depsInfo.isLinuxSupported).to.be.equal(false);
    expect(await funcToolChecker.command()).to.be.equal("npx azure-functions-core-tools@3");
  });

  test("already install + linux", async function () {
    if (!(await funcUtils.isFuncCoreToolsInstalled()) || !isLinux()) {
      this.skip();
    }

    const funcToolChecker = createTestChecker();

    expect(funcToolChecker.isInstalled()).to.be.equal(true);
    expect(await funcToolChecker.command()).to.be.equal("func", `should use global func`);
    await assertFuncStart(funcToolChecker);
  });

  test("already install + old func version(v2)", async function () {
    const funcVersion = await funcUtils.getFuncCoreToolsVersion();
    if (isLinux()) {
      this.skip();
    }
    if (funcVersion == null || (await funcUtils.isFuncCoreToolsInstalled())) {
      this.skip();
    }

    const funcToolChecker = createTestChecker();
    const shouldContinue = await funcToolChecker.resolve();

    assert.isTrue(shouldContinue);
    expect(await funcToolChecker.isInstalled()).to.be.equal(true);
    assert.isTrue(
      /node "[^"]*"$/g.test(await funcToolChecker.command()),
      `should use portable func`
    );
    await assertFuncStart(funcToolChecker);
  });
});

async function assertFuncStart(funcToolChecker: FuncToolChecker): Promise<void> {
  const funcExecCommand = await funcToolChecker.command();
  const funcStartResult: cpUtils.ICommandResult = await cpUtils.tryExecuteCommand(
    undefined,
    logger,
    { shell: true },
    `${funcExecCommand} start`
  );
  // func start can work: "Unable to find project root. Expecting to find one of host.json, local.settings.json in project root."
  expect(funcStartResult.cmdOutputIncludingStderr).to.includes(
    "Unable to find project root",
    `func start should return error message that contains "Unable to find project root", but actual output: "${funcStartResult.cmdOutputIncludingStderr}"`
  );
}
