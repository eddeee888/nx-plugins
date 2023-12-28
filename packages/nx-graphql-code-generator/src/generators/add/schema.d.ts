export interface NxGraphqlCodeGeneratorGeneratorSchema {
  project: string;
  schema: string;
  documents?: string;
  output?: string;
  config?: string;
  pluginPreset?: 'typescript-resolver-files' | 'typescript-react-apollo-client' | 'basic';
  externalGeneratedFile?: string;
}
