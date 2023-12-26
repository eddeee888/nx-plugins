import { createTreeWithEmptyWorkspace } from '@nx/devkit/testing';
import { Tree, readProjectConfiguration, readJson, writeJson, readNxJson } from '@nx/devkit';
import { libraryGenerator } from '@nx/js';
import { applicationGenerator } from '@nx/node';
import generator from './generator';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';

describe('nx-graphql-code-generator generator', () => {
  let tree: Tree;
  const projectName = 'test';
  const codegenSchema = 'https://localhost:9999/graphql';
  const options: NxGraphqlCodeGeneratorGeneratorSchema = {
    project: projectName,
    schema: codegenSchema,
  };

  beforeEach(async () => {
    tree = createTreeWithEmptyWorkspace({ layout: 'apps-libs' });
  });

  it('generates files to library', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    await generator(tree, options);

    // Root
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('^16.8.1');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^5.0.0');

    // workspace config ( nx.json )
    const workspaceConfig = readNxJson(tree);
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toMatchInlineSnapshot(`
      {
        "add": {
          "config": "graphql-codegen.ts",
          "schema": "https://localhost:9999/graphql",
        },
      }
    `);
    expect(workspaceConfig.targetDefaults['graphql-codegen']).toMatchInlineSnapshot(`
      {
        "cache": true,
        "options": {
          "configFile": "{projectRoot}/graphql-codegen.ts",
        },
      }
    `);

    // project config
    const projectConfig = readProjectConfiguration(tree, projectName);
    expect(projectConfig.targets['graphql-codegen']).toMatchInlineSnapshot(`
      {
        "executor": "@eddeee888/nx-graphql-code-generator:codegen",
        "options": {
          "configFile": "libs/test/graphql-codegen.ts",
        },
        "outputs": [],
      }
    `);

    // files
    const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "import type { CodegenConfig } from '@graphql-codegen/cli';

      const config: CodegenConfig = {
        schema: 'https://localhost:9999/graphql',
        generates: {},
      };

      export default config;
      "
    `);
  });

  it('generates files to a nested project', async () => {
    const directory = 'node/js';
    const finalProjectName = `node-js-${projectName}`;
    await applicationGenerator(tree, { name: projectName, directory });
    await generator(tree, { ...options, project: finalProjectName });

    // Root
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('^16.8.1');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^5.0.0');

    // workspace config ( nx.json )
    const workspaceConfig = readNxJson(tree);
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toMatchInlineSnapshot(`
      {
        "add": {
          "config": "graphql-codegen.ts",
          "schema": "https://localhost:9999/graphql",
        },
      }
    `);

    // project config
    const projectConfig = readProjectConfiguration(tree, finalProjectName);
    expect(projectConfig.targets['graphql-codegen']).toMatchInlineSnapshot(`
      {
        "executor": "@eddeee888/nx-graphql-code-generator:codegen",
        "options": {
          "configFile": "apps/node/js/test/graphql-codegen.ts",
        },
        "outputs": [],
      }
    `);

    // files
    const codegenConfig = tree.read(`apps/${directory}/${projectName}/graphql-codegen.ts`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "import type { CodegenConfig } from '@graphql-codegen/cli';

      const config: CodegenConfig = {
        schema: 'https://localhost:9999/graphql',
        generates: {},
      };

      export default config;
      "
    `);
  });

  it('does not overwrite workspace config schema option if it has been added', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    await generator(tree, { ...options, schema: '**/*.graphqls' });

    const workspaceConfig = readNxJson(tree);
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toMatchInlineSnapshot(`
      {
        "add": {
          "config": "graphql-codegen.ts",
          "schema": "**/*.graphqls",
        },
      }
    `);

    await libraryGenerator(tree, { name: projectName + '2' });
    await generator(tree, { ...options, config: 'codegen.ts', schema: 'libs/other-lib/*.graphqls' });

    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toMatchInlineSnapshot(`
      {
        "add": {
          "config": "graphql-codegen.ts",
          "schema": "**/*.graphqls",
        },
      }
    `);
  });

  it('updates NPM packges if existing versions are less than expected major version', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    writeJson(tree, 'package.json', {
      dependencies: {
        graphql: '~15.0.0',
      },
      devDependencies: {
        '@graphql-codegen/cli': '^1.0.0',
      },
    });
    await generator(tree, options);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('^16.8.1');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^5.0.0');
  });

  it('does not update NPM packges if existing versions are greater than expected major version', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    writeJson(tree, 'package.json', {
      dependencies: {
        graphql: '99.0.0',
      },
      devDependencies: {
        '@graphql-codegen/cli': '98.0.0',
      },
    });
    await generator(tree, options);

    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('99.0.0');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('98.0.0');
  });

  it('generates schema path correctly to codegen config', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    await generator(tree, { ...options, schema: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "import type { CodegenConfig } from '@graphql-codegen/cli';

      const config: CodegenConfig = {
        schema: '**/*.graphqls',
        generates: {},
      };

      export default config;
      "
    `);
  });

  it('generates documents path correctly to codegen config', async () => {
    await libraryGenerator(tree, { name: projectName, directory: 'libs' });
    await generator(tree, { ...options, documents: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "import type { CodegenConfig } from '@graphql-codegen/cli';

      const config: CodegenConfig = {
        schema: 'https://localhost:9999/graphql',
        generates: {},
      };

      export default config;
      "
    `);
  });

  it('generates custom codegen config filename', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, config: 'codegen.ts' });

    const codegenConfig = tree.read(`libs/${projectName}/codegen.ts`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "import type { CodegenConfig } from '@graphql-codegen/cli';

      const config: CodegenConfig = {
        schema: 'https://localhost:9999/graphql',
        generates: {},
      };

      export default config;
      "
    `);
  });

  describe('generates plugin presets', () => {
    // FIXME: add back this test once it's fixed
    // it('typescript-react-apollo-client', async () => {
    //   await libraryGenerator(tree, { name: projectName });
    //   await generator(tree, { ...options, pluginPreset: 'typescript-react-apollo-client' });

    //   const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    //   expect(codegenConfig).toMatchInlineSnapshot(`
    //     "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
    //     overwrite: true
    //     schema: https://localhost:9999/graphql
    //     generates:
    //       libs/test/src/graphql/generated.ts:
    //         plugins:
    //           - typescript
    //           - typescript-operations
    //           - typescript-react-apollo
    //           - fragment-matcher
    //     "
    //   `);

    //   const packageJson = readJson(tree, 'package.json');
    //   expect(packageJson.devDependencies['@graphql-codegen/typescript']).toBe('^2.4.9');
    //   expect(packageJson.devDependencies['@graphql-codegen/typescript-operations']).toBe('^2.3.6');
    //   expect(packageJson.devDependencies['@graphql-codegen/typescript-react-apollo']).toBe('^3.2.12');
    //   expect(packageJson.devDependencies['@graphql-codegen/fragment-matcher']).toBe('^3.2.1');
    // });

    it('basic', async () => {
      await libraryGenerator(tree, { name: projectName, directory: 'libs' });
      await generator(tree, { ...options });
      console.log(tree);
      const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "import type { CodegenConfig } from '@graphql-codegen/cli';

        const config: CodegenConfig = {
          schema: 'https://localhost:9999/graphql',
          generates: {},
        };

        export default config;
        "
      `);
    });

    it('typescript-resolver-files', async () => {
      await libraryGenerator(tree, { name: projectName, directory: 'libs' });
      await generator(tree, { ...options, pluginPreset: 'typescript-resolver-files' });

      const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "import type { CodegenConfig } from '@graphql-codegen/cli';
        import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files';

        const config: CodegenConfig = {
          schema: 'https://localhost:9999/graphql',
          generates: {
            'libs/test/src/graphql/schema': {
              preset: 'typescript-resolver-files',
              presetConfig: defineConfig({
                tsConfigFilePath: 'libs/test/tsconfig.json',
              }),
            },
          },
        };

        export default config;
        "
      `);

      const packageJson = readJson(tree, 'package.json');
      expect(packageJson.devDependencies['@eddeee888/gcg-typescript-resolver-files']).toBe('^0.7.2');
    });

    it('does not overwrite packages if already exists', async () => {
      await libraryGenerator(tree, { name: projectName, directory: 'libs' });
      writeJson(tree, 'package.json', {
        devDependencies: {
          '@eddeee888/gcg-typescript-resolver-files': '0.0.1',
        },
      });
      await generator(tree, { ...options, pluginPreset: 'typescript-resolver-files' });

      const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.ts`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "import type { CodegenConfig } from '@graphql-codegen/cli';
        import { defineConfig } from '@eddeee888/gcg-typescript-resolver-files';

        const config: CodegenConfig = {
          schema: 'https://localhost:9999/graphql',
          generates: {
            'libs/test/src/graphql/schema': {
              preset: 'typescript-resolver-files',
              presetConfig: defineConfig({
                tsConfigFilePath: 'libs/test/tsconfig.json',
              }),
            },
          },
        };

        export default config;
        "
      `);

      const packageJson = readJson(tree, 'package.json');
      expect(packageJson.devDependencies['@eddeee888/gcg-typescript-resolver-files']).toBe('0.0.1');
    });
  });

  it('throws error if there is no schema', async () => {
    await libraryGenerator(tree, { name: projectName });
    await expect(generator(tree, { ...options, schema: undefined })).rejects.toEqual(new Error('--schema is required'));
  });
});
