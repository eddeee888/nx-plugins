import * as path from 'path';
import { readJsonFile } from '@nrwl/devkit';

interface DevToolsJson {
  primaryDomain: string;
  hostResolverFile: string;
  dockerCompose: {
    files: string[];
    envFile: string;
  };
}

export const readDevToolsConfig = (projectRoot: string): DevToolsJson => {
  return readJsonFile<DevToolsJson>(path.join(projectRoot, 'dev-tools.json'));
};
