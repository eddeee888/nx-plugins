import * as devKit from '@nrwl/devkit';
import * as childProcess from 'child_process';
import executor from './executor';
import { InfraExecutorSchema } from './schema';

jest.mock('@nrwl/devkit', () => ({ readJsonFile: jest.fn() }));
jest.mock('child_process', () => ({ execSync: jest.fn() }));

const readJsonFileMock = jest.mocked(devKit.readJsonFile);

describe('Infra Executor', () => {
  it.each<{ params: InfraExecutorSchema; expected: { command: string; success: boolean } }>([
    {
      params: { subCommand: 'up' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project up ',
        success: true,
      },
    },
    {
      params: { subCommand: 'down' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project down ',
        success: true,
      },
    },
    {
      params: { subCommand: 'logs' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project logs ',
        success: true,
      },
    },
    {
      params: { subCommand: 'start' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project start ',
        success: true,
      },
    },
    {
      params: { subCommand: 'stop' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project stop ',
        success: true,
      },
    },
    {
      params: { subCommand: 'open' },
      expected: {
        command: 'open https://infra-project.dev',
        success: true,
      },
    },
    {
      params: { subCommand: 'logs', args: '-f project-a' },
      expected: {
        command:
          'docker-compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . --env-file libs/env.yml -p infra-project logs -f project-a',
        success: true,
      },
    },
  ])('params: $params', async ({ params, expected }) => {
    readJsonFileMock.mockReturnValueOnce({
      projectName: 'infra-project',
      baseHref: 'https://infra-project.dev',
      dockerCompose: {
        files: ['libs/project-a/config.yml', 'libs/project-b/config.yml'],
        envFile: 'libs/env.yml',
      },
    });
    const output = await executor(
      { subCommand: params.subCommand, args: params.args },
      {
        cwd: '',
        isVerbose: false,
        root: '',
        projectName: 'project-a',
        projectsConfigurations: {
          version: 1,
          projects: {
            'project-a': { root: 'libs/project-a' },
            'project-b': { root: 'libs/project-b' },
          },
        },
      }
    );
    expect(childProcess.execSync).toHaveBeenCalledWith(expected.command, { stdio: 'inherit' });
    expect(output.success).toBe(expected.success);
  });
});
