export interface NxGraphqlCodeGeneratorGeneratorSchema {
  project: string;
  schema?: string;
  documents?: string;
  output?: string;
  pluginPreset?:
    | 'typescript-react-apollo-client'
    | 'typescript-angular-apollo-client'
    | 'typescript-vue-apollo-client'
    | 'typescript-resolvers'
    | 'none';

  config?: string;
}
