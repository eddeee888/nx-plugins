import * as path from 'path';
import { readJsonFile } from '@nrwl/devkit';

interface DevToolsJson {
  primaryDomain: string;
  infra: {
    files: string[];
    env: Record<string, string>;
  };
}

export const readDevToolsConfig = (projectRoot: string): DevToolsJson => {
  return readJsonFile<DevToolsJson>(path.join(projectRoot, 'dev-tools.json'));
};
