import { executeCommand, tryExecuteCommand } from "../../../../../common/cpUtils";

export async function wslPathToWindowsPath(path: string): Promise<string> {
  return await executeCommand("wslpath", ["-w", path], undefined, { shell: false });
}

export async function openFolderWithExplorer(windowsPath: string): Promise<string> {
  const result = await tryExecuteCommand("explorer.exe", [windowsPath], undefined, {
    shell: false,
  });
  if (result.code === 0 || result.code === 1) {
    return result.stdout;
  } else {
    const errorMessage = `Failed to execute open Windows path, command: 'explorer.exe ${windowsPath}', stdout: ${result.stdout}, stderr: ${result.stderr}, code: ${result.code}`;
    throw new Error(errorMessage);
  }
}
