import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree } from '@nrwl/devkit';

import generator from './generator';
import { NxDevToolsGeneratorSchema } from './schema';

describe('nx-dev-tools generator', () => {
  let tree: Tree;
  const options: NxDevToolsGeneratorSchema = { projectName: 'BaseApp', commandName: 'bam' };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace();
    await generator(tree, options);
  });

  describe('Files generation', () => {
    test.each([['dev-tools/bin/core.sh'], ['dev-tools/bin/dc-build-dev-images.sh'], ['dev-tools/bin/dc-build.sh']])(
      '%s content',
      (file) => {
        const content = tree.read(file, 'utf-8');
        expect(content).toMatchSnapshot();
      }
    );
  });
});
