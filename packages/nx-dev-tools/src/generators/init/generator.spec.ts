import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';

import generator from './generator';
import { NxDevToolsGeneratorSchema } from './schema';

describe('nx-dev-tools generator', () => {
  let tree: Tree;
  const options: NxDevToolsGeneratorSchema = { projectName: 'bam', commandName: 'bb', devDomain: 'fakecom' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await generator(tree, options);
  });

  describe('Files generation', () => {
    test.each([
      ['apps/bam/docker-compose.yml'],
      ['dev-tools/bin/core.sh'],
      ['dev-tools/bin/dc-build-dev-images.sh'],
      ['dev-tools/bin/dc-build.sh'],
      ['dev-tools/bin/dc-down.sh'],
      ['dev-tools/bin/dc-exec.sh'],
      ['dev-tools/bin/dc-logs.sh'],
      ['dev-tools/bin/dc-rebuild.sh'],
      ['dev-tools/bin/dc-recreate.sh'],
      ['dev-tools/bin/dc-run.sh'],
      ['dev-tools/bin/dc-shell.sh'],
      ['dev-tools/bin/dc-start.sh'],
      ['dev-tools/bin/dc-stop.sh'],
      ['dev-tools/bin/dc-up.sh'],
      ['dev-tools/bin/init-cert.sh'],
      ['dev-tools/bin/init.sh'],
      ['dev-tools/bin/utils-constants.sh'],
      ['dev-tools/bin/utils-dc.sh'],
      ['dev-tools/bin/vm-down.sh'],
      ['dev-tools/bin/vm-up.sh'],
      ['dev-tools/bin/ws-nx.sh'],
      ['dev-tools/dnsmasq/dnsmasq.conf'],
      ['dev-tools/dnsmasq/docker-compose.yml'],
      ['dev-tools/docker-images/build-dev-images.yml'],
      ['dev-tools/docker-images/Dockerfile.dev'],
      ['dev-tools/docker-images/Dockerfile.dev.dockerignore'],
      ['dev-tools/reverse-proxy/templates/http.conf.template'],
      ['dev-tools/reverse-proxy/.gitignore'],
      ['dev-tools/reverse-proxy/docker-compose.yml'],
      ['dev-tools/reverse-proxy/Dockerfile'],
      ['dev-tools/reverse-proxy/proxy.conf'],
      ['dev-tools/reverse-proxy/ws.conf'],
      ['dev-tools/.env.docker-compose'],
    ])('%s content', (file) => {
      const content = tree.read(file, 'utf-8');
      expect(content).not.toBeNull();
      expect(content).toMatchSnapshot();
    });
  });
});
