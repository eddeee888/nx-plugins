import { createTreeWithEmptyWorkspace } from '@nrwl/devkit/testing';
import { Tree, readProjectConfiguration, readJson, writeJson } from '@nrwl/devkit';
import { libraryGenerator } from '@nrwl/workspace/generators';
import { applicationGenerator } from '@nrwl/node';
import generator from './generator';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';

describe('nx-graphql-code-generator generator', () => {
  let tree: Tree;
  const projectName = 'test';
  const options: NxGraphqlCodeGeneratorGeneratorSchema = {
    project: projectName,
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

    // nx.json
    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');

    // project config
    const projectConfig = readProjectConfiguration(tree, projectName);
    expect(projectConfig.targets['graphql-codegen']).toEqual({
      executor: '@eddeee888/nx-graphql-code-generator:codegen',
      options: {
        configFile: `libs/${projectName}/codegen.yml`,
      },
    });

    // files
    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "
      schema: # Add path to schema


      generates:
        # Add your config below
        # https://www.graphql-code-generator.com/docs/config-reference/codegen-config
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
    expect(packageJson.dependencies.graphql).toBe('^16.4.0');
    expect(packageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');

    // nx.json
    const nxJson = readJson(tree, 'nx.json');
    expect(nxJson.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');

    // project config
    const projectConfig = readProjectConfiguration(tree, finalProjectName);
    expect(projectConfig.targets['graphql-codegen']).toEqual({
      executor: '@eddeee888/nx-graphql-code-generator:codegen',
      options: {
        configFile: `apps/${directory}/${projectName}/codegen.yml`,
      },
    });

    // files
    const codegenConfig = tree.read(`apps/${directory}/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "
      schema: # Add path to schema


      generates:
        # Add your config below
        # https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      "
    `);
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
      "
      schema: **/*.graphqls


      generates:
        # Add your config below
        # https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      "
    `);
  });

  it('generates schema path correctly to codegen config', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, schema: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "
      schema: **/*.graphqls


      generates:
        # Add your config below
        # https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      "
    `);
  });

  it('generates documents path correctly to codegen config', async () => {
    await libraryGenerator(tree, { name: projectName });
    await generator(tree, { ...options, documents: '**/*.graphqls' });

    const codegenConfig = tree.read(`libs/${projectName}/codegen.yml`, 'utf-8');
    expect(codegenConfig).toMatchInlineSnapshot(`
      "
      schema: # Add path to schema


      documents: **/*.graphqls

      generates:
        # Add your config below
        # https://www.graphql-code-generator.com/docs/config-reference/codegen-config
      "
    `);
  });
});
