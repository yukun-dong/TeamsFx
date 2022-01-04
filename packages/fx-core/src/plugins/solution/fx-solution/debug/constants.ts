// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
"use strict";

export class LaunchBrowser {
  public static readonly chrome: string = "pwa-chrome";
  public static readonly edge: string = "pwa-msedge";
}

export class LocalDebugCertificate {
  public static readonly CertFileName: string = "localhost.crt";
  public static readonly KeyFileName: string = "localhost.key";
  public static readonly FriendlyName: string = "TeamsFx Development Certificate";
}

export class LocalDebugWSLCertificate {
  public static readonly Message: string =
    'Please check and install the dev certificate manually. To learn more about how to manually install certificate, please click "Leare More".';
  public static readonly LearnMore: string = "Learn More";
  public static readonly OpenFolder: string = "Open Certificate Folder";
  public static readonly DontShowAnymore: string = "Don't Show This Anymore";
  public static readonly ContinueDebug: string = "Continue";
  public static readonly LearnMoreUrl = "https://www.google.com";
}

export enum LocalDebugWSLCertStateKeys {
  dontShowAgain = "localDebugWSLCertCert/dontShowAgain",
}
