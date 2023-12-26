export interface NxGraphqlCodeGeneratorGeneratorSchema {
  project: string;
  schema: string;
  documents?: string;
  output?: string;
  pluginPreset?: 'typescript-resolver-files' | 'basic';
  config?: string;
}
