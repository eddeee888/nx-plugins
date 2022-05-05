import { ensureNxProject, readFile, readJson, runNxCommandAsync, uniq, updateFile } from '@nrwl/nx-plugin/testing';
describe('nx-graphql-code-generator:add e2e', () => {
  describe('Generating for brand new project', () => {
    it('adds codegen.yml and packages', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project=${plugin} --schema http://localhost:9999/graphql`
      );

      // check codegen.yml
      expect(readFile(`libs/${plugin}/codegen.yml`)).toBeTruthy();

      // check projectJson
      const projectJson = readJson(`libs/${plugin}/project.json`);
      expect(projectJson.targets['graphql-codegen'].executor).toBe('@eddeee888/nx-graphql-code-generator:codegen');
      expect(projectJson.targets['graphql-codegen'].outputs).toEqual([]);
      expect(projectJson.targets['graphql-codegen'].options.configFile).toBe(`libs/${plugin}/codegen.yml`);

      // check package.json
      const rootPackageJson = readJson('package.json');
      expect(rootPackageJson.dependencies.graphql).toBe('^16.4.0');
      expect(rootPackageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');

      // nx.json
      const nxJson = readJson('nx.json');
      expect(nxJson.tasksRunnerOptions.default.options.cacheableOperations).toContain('graphql-codegen');
      expect(nxJson.generators['@eddeee888/nx-graphql-code-generator']).toEqual({
        add: {
          schema: 'http://localhost:9999/graphql',
          config: 'codegen.yml',
          output: 'graphql/generated.ts',
        },
      });
    }, 120000);
  });

  describe('--documents', () => {
    it('adds path to documents', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --documents libs/**/*.graphql`
      );
      expect(readFile(`libs/${plugin}/codegen.yml`)).toBeTruthy();
    }, 120000);
  });

  describe('--config', () => {
    it('generates custom codegen config filename correctly', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --config graphql-codegen.yml`
      );
      expect(readFile(`libs/${plugin}/graphql-codegen.yml`)).toBeTruthy();
    }, 120000);
  });

  describe('--pluginPreset', () => {
    it('generates custom codegen config filename correctly', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --pluginPreset typescript-react-apollo-client`
      );
      expect(readFile(`libs/${plugin}/codegen.yml`)).toBeTruthy();

      const rootPackageJson = readJson('package.json');
      expect(rootPackageJson.devDependencies['@graphql-codegen/typescript']).toBeTruthy();
      expect(rootPackageJson.devDependencies['@graphql-codegen/typescript-operations']).toBeTruthy();
      expect(rootPackageJson.devDependencies['@graphql-codegen/typescript-react-apollo']).toBeTruthy();
      expect(rootPackageJson.devDependencies['@graphql-codegen/fragment-matcher']).toBeTruthy();
    }, 120000);
  });

  describe('Updating NPM packages', () => {
    it('updates packages if existing packages are lower in semver', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');

      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);

      const rootPackageJson = readJson('package.json');
      rootPackageJson.dependencies.graphql = '15.0.0';
      rootPackageJson.devDependencies['@graphql-codegen/cli'] = '1.0.0';
      updateFile('package.json', JSON.stringify(rootPackageJson));

      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql`
      );

      const resultPackageJson = readJson('package.json');
      expect(resultPackageJson.dependencies.graphql).toBe('^16.4.0');
      expect(resultPackageJson.devDependencies['@graphql-codegen/cli']).toBe('^2.6.2');
    }, 120000);

    it('does not update packages if existing packages are higher in semver', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');

      await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);

      const rootPackageJson = readJson('package.json');
      rootPackageJson.dependencies.graphql = '99.0.0';
      rootPackageJson.devDependencies['@graphql-codegen/cli'] = '99.0.0';
      updateFile('package.json', JSON.stringify(rootPackageJson));

      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql --verbose`
      );

      const resultPackageJson = readJson('package.json');
      expect(resultPackageJson.dependencies.graphql).toBe('99.0.0');
      expect(resultPackageJson.devDependencies['@graphql-codegen/cli']).toBe('99.0.0');
    }, 120000);
  });
});

describe('nx-graphql-code-generator:codegen e2e', () => {
  it('generates templates with dummy plugin', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject('@eddeee888/nx-graphql-code-generator', 'dist/packages/nx-graphql-code-generator');
    await runNxCommandAsync(`generate @nrwl/workspace:library --name=${plugin} --no-interactive`);
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
      `libs/${plugin}/codegen.yml`,
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
  }, 120000);
});
