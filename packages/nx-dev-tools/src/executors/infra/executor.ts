import * as path from 'path';
import { execSync } from 'child_process';
import { type ExecutorContext, readJsonFile } from '@nrwl/devkit';
import type { InfraExecutorSchema } from './schema';

export default async function runExecutor(
  { subCommand, args }: InfraExecutorSchema,
  { projectName = '', projectsConfigurations }: ExecutorContext
) {
  const projectConfig = projectsConfigurations.projects[projectName];
  if (!projectsConfigurations.projects[projectName]) {
    return { success: false };
  }

  const {
    projectName: stackName,
    dockerCompose: { files, envFile },
  } = readJsonFile<{ projectName: string; dockerCompose: { files: string[]; envFile: string } }>(
    path.join(projectConfig.root, 'dev-tools.json')
  );

  const filesString = files.map((file) => `--file ${file}`).join(' ');

  const command =
    'docker-compose' +
    ` ${filesString}` +
    ` --project-directory .` +
    ` --env-file=${envFile}` +
    ` -p ${stackName}` +
    ` ${subCommand}` +
    args
      ? ` ${args}`
      : '';

  execSync(command, { stdio: 'inherit' });

  return { success: true };
}
