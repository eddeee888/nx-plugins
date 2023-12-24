import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree } from '@nx/devkit';

import generator from './generator';
import { NxDevToolsGeneratorSchema } from './schema';

describe('nx-dev-tools generator', () => {
  let tree: Tree;
  const options: NxDevToolsGeneratorSchema = {
    projectRoot: 'libs/dev',
    primaryDomain: 'bam.fakecom',
    libraryName: 'dev',
  };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await generator(tree, options);
  });

  describe('Files generation', () => {
    test.each([
      ['libs/dev/dnsmasq/dnsmasq.conf'],
      ['libs/dev/dnsmasq/docker-compose.yml'],
      ['libs/dev/reverse-proxy/templates/http.conf.template'],
      ['libs/dev/reverse-proxy/.gitignore'],
      ['libs/dev/reverse-proxy/docker-compose.yml'],
      ['libs/dev/reverse-proxy/proxy.conf'],
      ['libs/dev/reverse-proxy/ws.conf'],
      ['libs/dev/dev-tools.json'],
      ['libs/dev/project.json'],
    ])('%s content', (file) => {
      const content = tree.read(file, 'utf-8');
      expect(content).not.toBeNull();
      expect(content).toMatchSnapshot();
    });
  });
});
