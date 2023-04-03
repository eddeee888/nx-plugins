export interface InfraExecutorSchema {
  subCommand: 'up' | 'down' | 'logs' | 'start' | 'stop' | 'open';
  args?: string;
}
