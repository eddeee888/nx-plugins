import executor from './executor';

describe('Infra Executor', () => {
  it('can run', async () => {
    const output = await executor({ subCommand: 'up' });
    expect(output.success).toBe(true);
  });
});
