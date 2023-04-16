import { runCli, cliError } from '@graphql-codegen/cli';
import { BuildExecutorSchema } from './schema';

export default async function runExecutor(options: BuildExecutorSchema) {
  try {
    process.argv.push(`--config=${options.configFile}`);
    if (options.watch) {
      process.argv.push('--watch');
    }

    if (options.verbose) {
      process.argv.push('--verbose');
    }

    if (options.profile) {
      process.argv.push('--profile');
    }

    const status = await runCli('');

    return {
      success: status === 0,
    };
  } catch (e) {
    cliError(e);
    return {
      success: false,
    };
  }
}
