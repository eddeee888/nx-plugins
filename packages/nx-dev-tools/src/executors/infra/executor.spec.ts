import * as childProcess from 'child_process';
import { readDevToolsConfig } from '../utils';
import executor from './executor';
import { InfraExecutorSchema } from './schema';

jest.mock('@nx/devkit', () => ({ readJsonFile: jest.fn() }));
jest.mock('child_process', () => ({ execSync: jest.fn() }));
jest.mock('../utils', () => {
  const utilsActual = jest.requireActual('../utils');
  return {
    ...utilsActual,
    readDevToolsConfig: jest.fn(),
  };
});

const readDevToolsConfigMock = jest.mocked(readDevToolsConfig);

describe('Infra Executor', () => {
  it.each<{ params: InfraExecutorSchema; expected: { command: string; success: boolean } }>([
    {
      params: { subCommand: 'up' },
      expected: {
        command:
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev up ',
        success: true,
      },
    },
    {
      params: { subCommand: 'down' },
      expected: {
        command:
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev down ',
        success: true,
      },
    },
    {
      params: { subCommand: 'logs' },
      expected: {
        command:
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev logs ',
        success: true,
      },
    },
    {
      params: { subCommand: 'start' },
      expected: {
        command:
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev start ',
        success: true,
      },
    },
    {
      params: { subCommand: 'stop' },
      expected: {
        command:
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev stop ',
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
          'ENV_1=VALUE_1 ENV_2=VALUE_2 docker compose --file libs/project-a/config.yml --file libs/project-b/config.yml --project-directory . -p infra-project_dev logs -f project-a',
        success: true,
      },
    },
  ])('params: $params', async ({ params, expected }) => {
    readDevToolsConfigMock.mockReturnValueOnce({
      primaryDomain: 'infra-project.dev',
      infra: {
        files: ['libs/project-a/config.yml', 'libs/project-b/config.yml'],
        env: {
          ENV_1: 'VALUE_1',
          ENV_2: 'VALUE_2',
        },
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
