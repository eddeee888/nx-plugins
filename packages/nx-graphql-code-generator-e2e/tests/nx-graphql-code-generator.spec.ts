import { ensureNxProject, readFile, readJson, runNxCommandAsync, uniq, updateFile } from '@nx/plugin/testing';

describe('nx-graphql-code-generator:add e2e', () => {
  it('Generating for brand new project - adds codegen.yml and packages', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project=${plugin} --schema http://localhost:9999/graphql`
    );

    // check graphql-codegen.yml
    expect(readFile(`libs/${plugin}/graphql-codegen.yml`)).toBeTruthy();

    // check projectJson
    const projectJson = readJson(`libs/${plugin}/project.json`);
    expect(projectJson.targets['graphql-codegen']).toEqual({
      executor: '@eddeee888/nx-graphql-code-generator:codegen',
      options: {
        configFile: `libs/${plugin}/graphql-codegen.yml`,
      },
      outputs: [],
    });

    // check package.json
    const rootPackageJson = readJson('package.json');
    expect(rootPackageJson.dependencies.graphql).toBe('^16.8.1');
    expect(rootPackageJson.devDependencies['@graphql-codegen/cli']).toBe('^5.0.0');

    // nx.json
    const nxJson = readJson('nx.json');
    expect(nxJson.targetDefaults['graphql-codegen']).toMatchInlineSnapshot(`
        {
          "cache": true,
          "options": {
            "configFile": "{projectRoot}/graphql-codegen.ts",
          },
        }
      `);
    expect(nxJson.generators['@eddeee888/nx-graphql-code-generator']).toMatchInlineSnapshot(`
        {
          "add": {
            "config": "graphql-codegen.yml",
            "schema": "http://localhost:9999/graphql",
          },
        }
      `);
  }, 180000);

  it('--documents - adds path to documents', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --documents libs/**/*.graphql`
    );
    expect(readFile(`libs/${plugin}/graphql-codegen.yml`)).toBeTruthy();
  }, 180000);

  it('--config - generates custom codegen config filename correctly', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --config graphql-codegen.yml`
    );
    expect(readFile(`libs/${plugin}/graphql-codegen.yml`)).toBeTruthy();
  }, 180000);

  it('--pluginPreset - generates custom codegen config filename correctly', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --pluginPreset typescript-react-apollo-client`
    );
    expect(readFile(`libs/${plugin}/graphql-codegen.yml`)).toBeTruthy();

    const rootPackageJson = readJson('package.json');
    expect(rootPackageJson.devDependencies['@graphql-codegen/typescript']).toBeTruthy();
    expect(rootPackageJson.devDependencies['@graphql-codegen/typescript-operations']).toBeTruthy();
    expect(rootPackageJson.devDependencies['@graphql-codegen/typescript-react-apollo']).toBeTruthy();
    expect(rootPackageJson.devDependencies['@graphql-codegen/fragment-matcher']).toBeTruthy();
  }, 180000);

  it('Updating NPM packages - updates packages if existing packages are lower in semver', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');

    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);

    const rootPackageJson = readJson('package.json');
    rootPackageJson.dependencies.graphql = '15.0.0';
    rootPackageJson.devDependencies['@graphql-codegen/cli'] = '1.0.0';
    updateFile('package.json', JSON.stringify(rootPackageJson));

    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql`
    );

    const updatedRootPackageJson = readJson('package.json');
    expect(updatedRootPackageJson.dependencies.graphql).toBe('^16.8.1');
    expect(updatedRootPackageJson.devDependencies['@graphql-codegen/cli']).toBe('^5.0.0');
  }, 180000);

  it('Updating NPM packages - does not update packages if existing packages are higher in semver', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');

    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);

    const rootPackageJson = readJson('package.json');
    rootPackageJson.dependencies.graphql = '99.0.0';
    rootPackageJson.devDependencies['@graphql-codegen/cli'] = '99.0.0';
    updateFile('package.json', JSON.stringify(rootPackageJson));

    // Note: we add pluginPreset=none here to avoid triggering npmInstall which fails because there's no 99.0.0 packages.
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --pluginPreset none`
    );

    const updatedRootPackageJson = readJson('package.json');
    expect(updatedRootPackageJson.dependencies.graphql).toBe('99.0.0');
    expect(updatedRootPackageJson.devDependencies['@graphql-codegen/cli']).toBe('99.0.0');
  }, 180000);
});

describe('nx-graphql-code-generator:codegen e2e', () => {
  it('generates templates with dummy plugin', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nx/js:library --name=${plugin} --directory=libs --no-interactive`);
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql`
    );

    // Create GraphQL codegen related files
    // 1. Schema file
    updateFile(
      `libs/${plugin}/src/schema.graphqls`,
      `type User {
        id: ID!
      }`
    );
    // 2. Dummy plugin
    updateFile(
      `libs/${plugin}/dummy-plugin.js`,
      "module.exports = { plugin(schema, documents, config) { return 'TestContent' } }"
    );
    // 3. Codegen config file
    updateFile(
      `libs/${plugin}/graphql-codegen.yml`,
      `
      schema: libs/${plugin}/**/*.graphqls
      generates:
        libs/${plugin}/src/types.generated.ts:
          plugins:
            - libs/${plugin}/dummy-plugin.js
    `
    );

    await runNxCommandAsync(`graphql-codegen ${plugin}`);
    expect(readFile(`libs/${plugin}/src/types.generated.ts`)).toBe('TestContent');
  }, 180000);
});
