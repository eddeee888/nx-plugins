import { execSync } from 'child_process';
import type { ExecutorContext } from '@nx/devkit';
import type { InfraExecutorSchema } from './schema';
import { readDevToolsConfig, getProjectConfig, fmt } from '../utils';

export default async function runExecutor({ subCommand, args = '' }: InfraExecutorSchema, context: ExecutorContext) {
  const projectConfig = getProjectConfig(context);
  if (!projectConfig) {
    return { success: false };
  }

  const {
    primaryDomain,
    infra: { files, env },
  } = readDevToolsConfig(projectConfig.root);

  const stackName = primaryDomain.split('.').join('_');
  const baseHref = `https://${primaryDomain}`;

  if (subCommand === 'open') {
    const command = `open ${baseHref}`;
    if (context.isVerbose) {
      fmt.info(`command: ${command}`);
    }
    execSync(command, { stdio: 'inherit' });
    return { success: true };
  }

  const filesString = files.reduce<string[]>((res, file) => {
    res.push('--file');
    res.push(file);
    return res;
  }, []);

  const envsString = Object.entries(env).reduce<string[]>((res, [key, value]) => {
    res.push(`${key}=${value}`);
    return res;
  }, []);

  const command = [
    ...envsString,
    'docker compose',
    ...filesString,
    '--project-directory',
    '.',
    '-p',
    stackName,
    subCommand,
    args,
  ].join(' ');

  if (context.isVerbose) {
    fmt.info(`command: ${command}`);
  }

  execSync(command, { stdio: 'inherit' });

  return { success: true };
}
