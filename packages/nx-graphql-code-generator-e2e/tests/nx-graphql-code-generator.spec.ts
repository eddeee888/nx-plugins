import {
  checkFilesExist,
  ensureNxProject,
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
      `generate @eddeee888/nx-graphql-code-generator:nx-graphql-code-generator --project ${plugin}`
    );

    const result = await runNxCommandAsync(`build ${plugin}`);
    expect(result.stdout).toContain('Executor ran');
  }, 120000);
});
