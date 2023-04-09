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
    await runNxCommandAsync(
      `generate @eddeee888/nx-dev-tools:init --projectRoot libs/dev-infra --primaryDomain bam.vm --libraryName=dev-infra`
    );

    checkFilesExist(
      'libs/dev-infra/dnsmasq/dnsmasq.conf',
      'libs/dev-infra/dnsmasq/docker-compose.yml',
      'libs/dev-infra/reverse-proxy/templates/http.conf.template',
      'libs/dev-infra/reverse-proxy/.gitignore',
      'libs/dev-infra/reverse-proxy/docker-compose.yml',
      'libs/dev-infra/reverse-proxy/proxy.conf',
      'libs/dev-infra/reverse-proxy/ws.conf',
      'libs/dev-infra/dev-tools.json'
    );
  }, 120000);
});
