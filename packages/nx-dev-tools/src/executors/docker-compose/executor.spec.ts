import { DockerComposeExecutorSchema } from './schema';
import executor from './executor';

const options: DockerComposeExecutorSchema = {};

describe('DockerCompose Executor', () => {
  it('can run', async () => {
    const output = await executor(options);
    expect(output.success).toBe(true);
  });
});