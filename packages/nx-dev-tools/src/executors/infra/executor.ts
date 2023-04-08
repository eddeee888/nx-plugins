import { execSync } from 'child_process';
import { type ExecutorContext } from '@nrwl/devkit';
import type { InfraExecutorSchema } from './schema';
import { readDevToolsConfig, getProjectConfig } from '../utils';

export default async function runExecutor({ subCommand, args = '' }: InfraExecutorSchema, context: ExecutorContext) {
  const projectConfig = getProjectConfig(context);
  if (!projectConfig) {
    return { success: false };
  }

  const {
    primaryDomain,
    dockerCompose: { files, envFile },
  } = readDevToolsConfig(projectConfig.root);

  const stackName = primaryDomain.split('.').join('_');
  const baseHref = `https://${primaryDomain}`;

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
