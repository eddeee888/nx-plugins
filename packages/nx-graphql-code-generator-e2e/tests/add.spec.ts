import {
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  uniq,
  updateFile,
} from '@nrwl/nx-plugin/testing';
describe('nx-graphql-code-generator:add e2e', () => {
  it('should add codegen.yml and packages', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject(
      '@eddeee888/nx-graphql-code-generator',
      'dist/packages/nx-graphql-code-generator'
    );
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin}`
    );

    // generator - check codegen.yml
    expect(readFile(`libs/${plugin}/codegen.yml`)).toMatchInlineSnapshot(`
      "schema: # Add path to schema

      generates:
        # Add your config below
      "
    `);

    // generator - check package.json
    const rootPackageJson = readJson('package.json');
    expect(rootPackageJson.dependencies.graphql).toBe('^16.4.0');
    expect(rootPackageJson.devDependencies['@graphql-codegen/cli']).toBe(
      '^2.6.2'
    );

    // executor - check command
    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);

  it('should update graphql and @graphql-codegen/cli', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject(
      '@eddeee888/nx-graphql-code-generator',
      'dist/packages/nx-graphql-code-generator'
    );

    const rootPackageJson = readJson('package.json');
    rootPackageJson.dependencies.graphql = '15.0.0';
    rootPackageJson.devDependencies['@graphql-codegen/cli'] = '2.0.0';
    updateFile('package.json', JSON.stringify(rootPackageJson));

    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --verbose`
    );

    const resultPackageJson = readJson('package.json');
    expect(resultPackageJson.dependencies.graphql).toBe('^16.4.0');
    expect(resultPackageJson.devDependencies['@graphql-codegen/cli']).toBe(
      '^2.6.2'
    );
  }, 120000);

  describe('--schema', () => {
    it('should add path to schema', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject(
        '@eddeee888/nx-graphql-code-generator',
        'dist/packages/nx-graphql-code-generator'
      );
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --schema http://localhost:9999/graphql`
      );
      expect(readFile(`libs/${plugin}/codegen.yml`)).toMatchInlineSnapshot(`
        "schema: http://localhost:9999/graphql

        generates:
          # Add your config below
        "
      `);
    }, 120000);
  });

  describe('--documents', () => {
    it('should add path to documents', async () => {
      const plugin = uniq('nx-graphql-code-generator');
      ensureNxProject(
        '@eddeee888/nx-graphql-code-generator',
        'dist/packages/nx-graphql-code-generator'
      );
      await runNxCommandAsync(
        `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin} --documents libs/**/*.graphql`
      );
      expect(readFile(`libs/${plugin}/codegen.yml`)).toMatchInlineSnapshot(`
        "schema: # Add path to schema

        documents: libs/**/*.graphql

        generates:
          # Add your config below
        "
      `);
    }, 120000);
  });
});
