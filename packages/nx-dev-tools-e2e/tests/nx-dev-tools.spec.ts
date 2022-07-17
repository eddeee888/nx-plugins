import { checkFilesExist, ensureNxProject, exists, runNxCommandAsync, tmpProjPath } from '@nrwl/nx-plugin/testing';

describe('nx-dev-tools e2e', () => {
  // Setting up individual workspaces per
  // test can cause e2e runs to take a long time.
  // For this reason, we recommend each suite only
  // consumes 1 workspace. The tests should each operate
  // on a unique project in the workspace, such that they
  // are not dependant on one another.
  beforeAll(() => {
    ensureNxProject('@eddeee888/nx-dev-tools', 'dist/packages/nx-dev-tools');
  });

  afterAll(() => {
    // `nx reset` kills the daemon, and performs
    // some work which can help clean up e2e leftovers
    runNxCommandAsync('reset');
  });

  it('should create dev-tools folder and related files ', async () => {
    await runNxCommandAsync(`generate @eddeee888/nx-dev-tools:init --projectName bam --commandName bb --devDomain vm`);

    // Docker files
    checkFilesExist(
      'dev-tools/.env.docker-compose',
      'apps/bam/docker-compose.yml',
      'dev-tools/reverse-proxy/docker-compose.yml',
      'dev-tools/dnsmasq/docker-compose.yml'
    );

    // main folders and files
    expect(exists(tmpProjPath('dev-tools/bin/core.sh'))).toBe(true);
    expect(exists(tmpProjPath('dev-tools/dnsmasq'))).toBe(true);
    expect(exists(tmpProjPath('dev-tools/docker-images'))).toBe(true);
    expect(exists(tmpProjPath('dev-tools/reverse-proxy'))).toBe(true);
  }, 120000);
});
