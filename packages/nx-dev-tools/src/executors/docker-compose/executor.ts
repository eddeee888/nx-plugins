import type { DockerComposeExecutorSchema } from './schema';
import { execSync } from 'node:child_process';
import { type ExecutorContext, readJsonFile } from '@nrwl/devkit';
import * as path from 'path';

export default async function runExecutor(
  { subCommand }: DockerComposeExecutorSchema,
  { projectName = '', projectsConfigurations }: ExecutorContext
) {
  const projectConfig = projectsConfigurations.projects[projectName];
  if (!projectsConfigurations.projects[projectName]) {
    return { success: false };
  }

  console.log('*** projectConfig.root: ', projectConfig.root);

  const {
    projectName: stackName,
    topLevelDomain,
    dnsPort,
    hostResolverDir,
    dockerCompose: { files, envFile },
  } = readJsonFile(path.join(projectConfig.root, 'dev-tools.json'));

  const filesString = files.map((file) => `--file ${file}`).join(' ');

  const command = `docker-compose ${filesString} --project-directory . --env-file=${envFile} -p ${stackName} ${subCommand}`;

  execSync([command].join(' '), { stdio: 'inherit' });

  return { success: true };
}
