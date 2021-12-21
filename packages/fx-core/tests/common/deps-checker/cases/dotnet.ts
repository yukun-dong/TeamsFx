// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { assert } from "chai";
import * as path from "path";
import * as fs from "fs-extra";
import * as os from "os";

import * as dotnetUtils from "../utils/dotnet";
import { isLinux, isWindows } from "../../../../src/common/deps-checker/util/system";
import {
  DotnetChecker,
  DotnetVersion,
} from "../../../../src/common/deps-checker/internal/dotnetChecker";
import { DepsInfo } from "../../../../src/common/deps-checker/depsChecker";
import {
  CustomOutputDotnetInstallScript,
  CustomPathDotnetInstallScript,
  ICustomDotnetInstallScript,
} from "../adapters/testAdapter";
import { logger } from "../adapters/testLogger";
import { TestTelemetry } from "../adapters/testTelemetry";
import {
  assertPathEqual,
  commandExistsInPath,
  getExecutionPolicyForCurrentUser,
  setExecutionPolicyForCurrentUser,
} from "../utils/common";
import * as sinon from "sinon";
import process from "process";

function createTestChecker(
  hasTeamsfxBackend: boolean,
  clickCancel = false,
  dotnetCheckerEnabled = true,
  funcToolCheckerEnabled = true,
  nodeCheckerEnabled = true,
  customDotnetInstallScript: ICustomDotnetInstallScript = new CustomOutputDotnetInstallScript()
): DotnetChecker {
  const testAdapter = new TestAdapter(
    hasTeamsfxBackend,
    clickCancel,
    dotnetCheckerEnabled,
    funcToolCheckerEnabled,
    nodeCheckerEnabled,
    customDotnetInstallScript
  );
  return new DotnetChecker(logger, new TestTelemetry());
}

describe("DotnetChecker E2E Test - first run", async () => {
  beforeEach(async function (this: Mocha.Context) {
    await dotnetUtils.cleanup();
    // cleanup to make sure the environment is clean before test
  });
  // TODO: teardown vs afterEach?
  afterEach(async function (this: Mocha.Context) {
    // cleanup to make sure the environment is clean
    await dotnetUtils.cleanup();
  });

  it(".NET SDK is not installed, whether globally or in home dir", async function () {
    if (await commandExistsInPath(dotnetUtils.dotnetCommand)) {
      this.skip();
    }
    const dotnetChecker = createTestChecker(true);

    const isInstalled = await dotnetChecker.isInstalled();
    assert.isFalse(isInstalled, ".NET is not installed, but isInstalled() return true");

    const depsInfo: DepsInfo = await dotnetChecker.getDepsInfo();
    assert.isNotNull(depsInfo);
    assert.isFalse(depsInfo.isLinuxSupported, "Linux should not support .NET");

    try {
      await dotnetChecker.install();
    } catch (e) {
      // do nothing
    }
    await verifyPrivateInstallation(dotnetChecker);
  });

  it(".NET SDK is not installed and the user homedir contains special characters", async function (this: Mocha.Context) {
    if (isLinux() || (await commandExistsInPath(dotnetUtils.dotnetCommand))) {
      this.skip();
    }

    // test for space and non-ASCII characters
    const specialUserName = "Aarón García";

    const [resourceDir, cleanupCallback] = await dotnetUtils.createMockResourceDir(specialUserName);
    try {
      const dotnetChecker = createTestChecker(
        true,
        true,
        true,
        true,
        true,
        new CustomPathDotnetInstallScript(resourceDir)
      );
      sinon.stub(dotnetChecker, "getResourceDir").returns(resourceDir);

      try {
        await dotnetChecker.install();
      } catch (e) {
        // do nothing
      }
      await verifyPrivateInstallation(dotnetChecker);
    } finally {
      cleanupCallback();
    }
  });

  it(".NET SDK supported version is installed globally", async function (this: Mocha.Context) {
    if (
      !(await dotnetUtils.hasAnyDotnetVersions(
        dotnetUtils.dotnetCommand,
        dotnetUtils.dotnetSupportedVersions
      ))
    ) {
      this.skip();
    }

    const dotnetFullPath = await commandExistsInPath(dotnetUtils.dotnetCommand);
    assert.isNotNull(dotnetFullPath);

    const dotnetChecker = createTestChecker(true);

    assert.isTrue(await dotnetChecker.isInstalled());

    const dotnetExecPathFromConfig = await dotnetUtils.getDotnetExecPathFromConfig(
      dotnetUtils.dotnetConfigPath
    );
    assert.isNotNull(dotnetExecPathFromConfig);
    assert.isTrue(
      await dotnetUtils.hasAnyDotnetVersions(
        dotnetExecPathFromConfig!,
        dotnetUtils.dotnetSupportedVersions
      )
    );

    // test dotnet executable is from config file.
    const dotnetExecPath = await dotnetChecker.command();
    assertPathEqual(dotnetExecPathFromConfig!, dotnetExecPath);
  });

  it(".NET SDK is too old", async function (this: Mocha.Context) {
    const has21 = await dotnetUtils.hasDotnetVersion(
      dotnetUtils.dotnetCommand,
      dotnetUtils.dotnetOldVersion
    );
    const hasSupported = await dotnetUtils.hasAnyDotnetVersions(
      dotnetUtils.dotnetCommand,
      dotnetUtils.dotnetSupportedVersions
    );
    if (!(has21 && !hasSupported)) {
      this.skip();
    }
    if (isLinux()) {
      this.skip();
    }

    assert.isTrue(await commandExistsInPath(dotnetUtils.dotnetCommand));
    const dotnetChecker = createTestChecker(true);
    try {
      await dotnetChecker.install();
    } catch (e) {
      // do nothing
    }

    await verifyPrivateInstallation(dotnetChecker);
  });

  it(".NET SDK installation failure and manually install", async function (this: Mocha.Context) {
    if (isLinux() || (await commandExistsInPath(dotnetUtils.dotnetCommand))) {
      this.skip();
    }

    // DotnetChecker with mock dotnet-install script
    const dotnetChecker = createTestChecker(
      true,
      false,
      true,
      true,
      true,
      new CustomOutputDotnetInstallScript(
        true,
        1,
        "mock dotnet installing",
        "mock dotnet install failure"
      )
    );
    const correctResourceDir = dotnetChecker.getResourceDir();
    sinon.stub(dotnetChecker, "getResourceDir").returns(getErrorResourceDir());

    try {
      await dotnetChecker.install();
    } catch (e) {
      // do nothing
    }
    await verifyInstallationFailed(dotnetChecker);

    // DotnetChecker with correct dotnet-install script
    sinon.stub(dotnetChecker, "getResourceDir").returns(correctResourceDir);

    // user manually install
    await dotnetUtils.withDotnet(
      dotnetChecker,
      DotnetVersion.v31,
      true,
      async (installedDotnetExecPath: string) => {
        // pre-check installed dotnet works
        assert.isTrue(
          await dotnetUtils.hasDotnetVersion(
            installedDotnetExecPath,
            dotnetUtils.dotnetInstallVersion
          )
        );

        try {
          await dotnetChecker.install();
        } catch (e) {
          // do nothing
        }
        assert.isTrue(await dotnetChecker.isInstalled());
        const dotnetExecPath = await dotnetChecker.command();
        assertPathEqual(dotnetExecPath, installedDotnetExecPath);
        assert.isTrue(
          await dotnetUtils.hasDotnetVersion(dotnetExecPath, dotnetUtils.dotnetInstallVersion)
        );
      }
    );
  });

  it("PowerShell ExecutionPolicy is default on Windows", async () => {
    if (!isWindows()) {
      return;
    }

    let originalExecutionPolicy = "Unrestricted";
    // TODO setup?
    setup(async function (this: Mocha.Context) {
      originalExecutionPolicy = await getExecutionPolicyForCurrentUser();
      await setExecutionPolicyForCurrentUser("Restricted");
    });

    test(".NET SDK not installed and PowerShell ExecutionPolicy is default (Restricted) on Windows", async function (this: Mocha.Context) {
      if (await commandExistsInPath(dotnetUtils.dotnetCommand)) {
        this.skip();
      }

      const dotnetChecker = createTestChecker(false);
      await dotnetChecker.install();

      await verifyPrivateInstallation(dotnetChecker);
    });

    teardown(async function (this: Mocha.Context) {
      await setExecutionPolicyForCurrentUser(originalExecutionPolicy);
    });
  });
});

describe("DotnetChecker E2E Test - second run", () => {
  beforeEach(async function (this: Mocha.Context) {
    await dotnetUtils.cleanup();
    // cleanup to make sure the environment is clean before test
  });

  it("Valid dotnet.json file", async function (this: Mocha.Context) {
    if (await commandExistsInPath(dotnetUtils.dotnetCommand)) {
      this.skip();
    }

    const dotnetChecker = createTestChecker(true);
    await dotnetUtils.withDotnet(
      dotnetChecker,
      DotnetVersion.v31,
      false,
      async (installedDotnetExecPath: string) => {
        // pre-check installed dotnet works
        assert.isTrue(
          await dotnetUtils.hasDotnetVersion(
            installedDotnetExecPath,
            dotnetUtils.dotnetInstallVersion
          )
        );

        // setup config file
        await fs.mkdirp(path.resolve(dotnetUtils.dotnetConfigPath, ".."));
        await fs.writeJson(
          dotnetUtils.dotnetConfigPath,
          { dotnetExecutablePath: installedDotnetExecPath },
          {
            encoding: "utf-8",
            spaces: 4,
            EOL: os.EOL,
          }
        );

        await dotnetChecker.install();
        const dotnetExecPath = await dotnetChecker.command();

        assertPathEqual(dotnetExecPath, installedDotnetExecPath);
        assert.isTrue(
          await dotnetUtils.hasDotnetVersion(dotnetExecPath, dotnetUtils.dotnetInstallVersion)
        );
      }
    );
  });

  test("Invalid dotnet.json file and .NET SDK not installed", async function (this: Mocha.Context) {
    if (await commandExistsInPath(dotnetUtils.dotnetCommand)) {
      this.skip();
    }

    // setup config file
    const invalidPath = "/this/path/does/not/exist";
    await fs.mkdirp(path.resolve(dotnetUtils.dotnetConfigPath, ".."));
    await fs.writeJson(
      dotnetUtils.dotnetConfigPath,
      { dotnetExecutablePath: invalidPath },
      {
        encoding: "utf-8",
        spaces: 4,
        EOL: os.EOL,
      }
    );

    const dotnetChecker = createTestChecker(true);
    await dotnetChecker.install();

    await verifyPrivateInstallation(dotnetChecker);
  });

  test("Invalid dotnet.json file and .NET SDK installed", async function (this: Mocha.Context) {
    if (await commandExistsInPath(dotnetUtils.dotnetCommand)) {
      this.skip();
    }

    const dotnetChecker = createTestChecker(true);

    await dotnetUtils.withDotnet(
      dotnetChecker,
      DotnetVersion.v31,
      true,
      async (installedDotnetExecPath: string) => {
        const invalidPath = "/this/path/does/not/exist";
        // setup config file
        await fs.mkdirp(path.resolve(dotnetUtils.dotnetConfigPath, ".."));
        await fs.writeJson(
          dotnetUtils.dotnetConfigPath,
          { dotnetExecutablePath: invalidPath },
          {
            encoding: "utf-8",
            spaces: 4,
            EOL: os.EOL,
          }
        );

        const shouldContinue = await dotnetChecker.install();
        const dotnetExecPath = await dotnetChecker.command();
        const dotnetExecPathFromConfig = await dotnetUtils.getDotnetExecPathFromConfig(
          dotnetUtils.dotnetConfigPath
        );

        assert.isTrue(shouldContinue);
        assertPathEqual(dotnetExecPath, installedDotnetExecPath);
        assert.isNotNull(dotnetExecPathFromConfig);
        assertPathEqual(dotnetExecPath, dotnetExecPathFromConfig!);
        assert.isTrue(
          await dotnetUtils.hasDotnetVersion(dotnetExecPath, dotnetUtils.dotnetInstallVersion)
        );
      }
    );
  });

  teardown(async function (this: Mocha.Context) {
    // cleanup to make sure the environment is clean
    await dotnetUtils.cleanup();
  });
});

async function verifyPrivateInstallation(dotnetChecker: DotnetChecker) {
  assert.isTrue(await dotnetChecker.isInstalled(), ".NET installation failed");

  assert.isTrue(
    await dotnetUtils.hasDotnetVersion(
      await dotnetChecker.command(),
      dotnetUtils.dotnetInstallVersion
    )
  );

  // validate dotnet config file
  const dotnetExecPath = await dotnetUtils.getDotnetExecPathFromConfig(
    dotnetUtils.dotnetConfigPath
  );
  assert.isNotNull(dotnetExecPath);
  assert.isTrue(
    await dotnetUtils.hasDotnetVersion(dotnetExecPath!, dotnetUtils.dotnetInstallVersion)
  );
}

async function verifyInstallationFailed(dotnetChecker: DotnetChecker) {
  assert.isFalse(await dotnetChecker.isInstalled());
  assert.isNull(await dotnetUtils.getDotnetExecPathFromConfig(dotnetUtils.dotnetConfigPath));
  assert.equal(await dotnetChecker.command(), dotnetUtils.dotnetCommand);
}

function getErrorResourceDir(): string {
  process.env["ENV_CHECKER_CUSTOM_SCRIPT_STDOUT"] = this._scriptStdout;
  process.env["ENV_CHECKER_CUSTOM_SCRIPT_STDERR"] = this._scriptStderr;
  process.env["ENV_CHECKER_CUSTOM_SCRIPT_EXITCODE"] = this._scriptExitCode.toString();
  return path.resolve(__dirname, "../resource");
}
