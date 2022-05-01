import { runCli, cliError } from '@graphql-codegen/cli';
import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  try {
    process.argv.push(`--config=${options.configFile}`);
    await runCli('');
  } catch (e) {
    cliError(e);
    return {
      success: false,
    };
  }
  return {
    success: true,
  };
}
