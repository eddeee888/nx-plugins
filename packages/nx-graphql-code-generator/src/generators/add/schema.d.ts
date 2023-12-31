export interface NxGraphqlCodeGeneratorGeneratorSchema {
  project: string;
  schema: string;
  documents?: string;
  output?: string;
  config?: string;
  pluginPreset?: 'basic' | 'typescript-types' | 'typescript-react-apollo-client' | 'typescript-resolver-files';
  externalGeneratedFile?: string;
}
