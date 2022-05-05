import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson, writeJson, readWorkspaceConfiguration } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';
import { applicationGenerator } from '@nrwl/node';
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
    tree = createTreeWithEmptyWorkspace();
  });

  it('generates files to library', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, options);

    // Root
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('^16.4.0');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');

    // workspace config ( nx.json )
    const workspaceConfig = readWorkspaceConfiguration(tree);
    expect(workspaceConfig.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toEqual({
      add: {
        schema: 'https://localhost:9999/graphql',
        config: 'codegen.yml',
        output: 'graphql/generated.ts',
      },
    });

    // project config
    const projectConfig = readProjectConfiguration(tree, projectName);
    expect(projectConfig.targets['graphql-codegen']).toEqual({
      executor: '@eddeee888/nx-graphql-code-generator:codegen',
      outputs: [],
      options: {
        configFile: `libs/${projectName}/codegen.yml`,
      },
    });

    // files
    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      overwrite: true
      schema: https://localhost:9999/graphql
      generates:
        libs/test/graphql/generated.ts:"
    `);
  });

  it('generates files to a nested project', async () => {
    const directory = 'node/js';
    const finalProjectName = `node-js-${projectName}`;
    await applicationGenerator(tree, { name: projectName, directory });
    await generator(tree, { ...options, project: finalProjectName });

    // Root
    const packageJson = readJson(tree, 'package.json');
    expect(packageJson.dependencies.graphql).toBe('^16.4.0');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');

    // workspace config ( nx.json )
    const workspaceConfig = readWorkspaceConfiguration(tree);
    expect(workspaceConfig.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toEqual({
      add: {
        schema: 'https://localhost:9999/graphql',
        config: 'codegen.yml',
        output: 'graphql/generated.ts',
      },
    });

    // project config
    const projectConfig = readProjectConfiguration(tree, finalProjectName);
    expect(projectConfig.targets['graphql-codegen']).toEqual({
      executor: '@eddeee888/nx-graphql-code-generator:codegen',
      outputs: [],
      options: {
        configFile: `apps/${directory}/${projectName}/codegen.yml`,
      },
    });

    // files
    const codegenConfig = tree.read(`apps/${directory}/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      overwrite: true
      schema: https://localhost:9999/graphql
      generates:
        apps/node/js/test/graphql/generated.ts:"
    `);
  });

  it('does not overwrite workspace config schema option if it has been added', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, schema: '**/*.graphqls', output: 'types.generated.ts' });

    const workspaceConfig = readWorkspaceConfiguration(tree);
    expect(workspaceConfig.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');
    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toEqual({
      add: {
        schema: '**/*.graphqls',
        config: 'codegen.yml',
        output: 'types.generated.ts',
      },
    });

    await libraryGenerator(tree, { name: projectName + '2' });
    await generator(tree, { ...options, schema: 'libs/other-lib/*.graphqls', output: 'graphql/types/generated.ts' });

    expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator']).toEqual({
      add: {
        schema: '**/*.graphqls',
        config: 'codegen.yml',
        output: 'types.generated.ts',
      },
    });
  });

  it('updates NPM packges if existing versions are less than expected major version', async () => {
    await libraryGenerator(tree, { name: projectName });
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
    expect(packageJson.dependencies.graphql).toBe('^16.4.0');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');
  });

  it('does not update NPM packges if existing versions are greater than expected major version', async () => {
    await libraryGenerator(tree, { name: projectName });
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
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, schema: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      overwrite: true
      schema: **/*.graphqls
      generates:
        libs/test/graphql/generated.ts:"
    `);
  });

  it('generates documents path correctly to codegen config', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, documents: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      overwrite: true
      schema: https://localhost:9999/graphql
      documents: **/*.graphqls
      generates:
        libs/test/graphql/generated.ts:"
    `);
  });

  it('generates custom codegen config filename', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, config: 'graphql-codegen.yml' });

    const codegenConfig = tree.read(`libs/${projectName}/graphql-codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      overwrite: true
      schema: https://localhost:9999/graphql
      generates:
        libs/test/graphql/generated.ts:"
    `);
  });

  describe('generates plugin presets', () => {
    test('typescript-react-apollo-client', async () => {
      await libraryGenerator(tree, { name: projectName });
      await generator(tree, { ...options, pluginPreset: 'typescript-react-apollo-client' });

      const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
        overwrite: true
        schema: https://localhost:9999/graphql
        generates:
          libs/test/graphql/generated.ts:
            - typescript
            - typescript-operations
            - typescript-react-apollo
            - fragment-matcher"
      `);

      const workspaceConfig = readWorkspaceConfiguration(tree);
      expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator'].add.pluginPreset).toBe(
        'typescript-react-apollo-client'
      );
    });

    test('typescript-angular-apollo-client', async () => {
      await libraryGenerator(tree, { name: projectName });
      await generator(tree, { ...options, pluginPreset: 'typescript-angular-apollo-client' });

      const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
        overwrite: true
        schema: https://localhost:9999/graphql
        generates:
          libs/test/graphql/generated.ts:
            - typescript
            - typescript-operations
            - typescript-apollo-angular
            - fragment-matcher"
      `);

      const workspaceConfig = readWorkspaceConfiguration(tree);
      expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator'].add.pluginPreset).toBe(
        'typescript-angular-apollo-client'
      );
    });

    test('typescript-vue-apollo-client', async () => {
      await libraryGenerator(tree, { name: projectName });
      await generator(tree, { ...options, pluginPreset: 'typescript-vue-apollo-client' });

      const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
        overwrite: true
        schema: https://localhost:9999/graphql
        generates:
          libs/test/graphql/generated.ts:
            - typescript
            - typescript-vue-apollo-smart-ops
            - typescript-vue-apollo
            - fragment-matcher"
      `);

      const workspaceConfig = readWorkspaceConfiguration(tree);
      expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator'].add.pluginPreset).toBe(
        'typescript-vue-apollo-client'
      );
    });

    test('typescript-resolvers', async () => {
      await libraryGenerator(tree, { name: projectName });
      await generator(tree, { ...options, pluginPreset: 'typescript-resolvers' });

      const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
      expect(codegenConfig).toMatchInlineSnapshot(`
        "# https://www.graphql-code-generator.com/docs/config-reference/codegen-config
        overwrite: true
        schema: https://localhost:9999/graphql
        generates:
          libs/test/graphql/generated.ts:
            - typescript
            - typescript-resolvers"
      `);

      const workspaceConfig = readWorkspaceConfiguration(tree);
      expect(workspaceConfig.generators['@eddeee888/nx-graphql-code-generator'].add.pluginPreset).toBe(
        'typescript-resolvers'
      );
    });
  });

  it('throws error if there is no schema', async () => {
    await libraryGenerator(tree, { name: projectName });
    await expect(generator(tree, { ...options, schema: undefined })).rejects.toEqual(new Error('--schema is required'));
  });
});
