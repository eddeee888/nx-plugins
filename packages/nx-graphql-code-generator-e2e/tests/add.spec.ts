import {
  ensureNxProject,
  readFile,
  readJson,
  runNxCommandAsync,
  uniq,
} from '@nrwl/nx-plugin/testing';
describe('nx-graphql-code-generator e2e', () => {
  it('should create nx-graphql-code-generator', async () => {
    const plugin = uniq('nx-graphql-code-generator');
    ensureNxProject(
      '@eddeee888/nx-graphql-code-generator',
      'dist/packages/nx-graphql-code-generator'
    );
    await runNxCommandAsync(
      `generate @eddeee888/nx-graphql-code-generator:add --project ${plugin}`
    );

    expect(readFile(`libs/${plugin}/codegen.yml`)).toMatchInlineSnapshot(`
      "schema: # Add path to schema

      generates:
        # Add your config below
      "
    `);

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
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
