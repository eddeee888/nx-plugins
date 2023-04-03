import * as path from 'path';
import { execSync } from 'child_process';
import { type ExecutorContext, readJsonFile } from '@nrwl/devkit';
import type { InfraExecutorSchema } from './schema';

interface DevToolsJson {
  projectName: string;
  baseHref: string;
  dockerCompose: {
    files: string[];
    envFile: string;
  };
}

export default async function runExecutor(
  { subCommand, args = '' }: InfraExecutorSchema,
  { projectName = '', projectsConfigurations }: ExecutorContext
) {
  const projectConfig = projectsConfigurations.projects[projectName];
  if (!projectsConfigurations.projects[projectName]) {
    return { success: false };
  }

  const {
    projectName: stackName,
    baseHref,
    dockerCompose: { files, envFile },
  } = readJsonFile<DevToolsJson>(path.join(projectConfig.root, 'dev-tools.json'));

  if (subCommand === 'open') {
    execSync(`open ${baseHref}`, { stdio: 'inherit' });
    return { success: true };
  }

  const filesString = files.reduce((res, file) => {
    res.push('--file');
    res.push(file);
    return res;
  }, []);

  execSync(
    [
      'docker-compose',
      ...filesString,
      '--project-directory',
      '.',
      '--env-file',
      envFile,
      '-p',
      stackName,
      subCommand,
      args,
    ].join(' '),
    { stdio: 'inherit' }
  );

  return { success: true };
}
