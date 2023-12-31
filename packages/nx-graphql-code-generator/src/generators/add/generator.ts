import {
  addDependenciesToPackageJson,
  updateJson,
  formatFiles,
  generateFiles,
  names,
  readJson,
  Tree,
  readNxJson,
  updateNxJson,
  readProjectConfiguration,
  updateProjectConfiguration,
  ProjectConfiguration,
} from '@nx/devkit';
import * as path from 'path';
import { major } from 'semver';
import { graphqlCodegenCliVersion, graphqlVersion } from '../../utils/versions';
import { checkAndCleanWithSemver } from '../../utils/checkAndCleanWithSemver';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';
import { pluginPresets } from './graphql-codegen-cli/plugins';

interface NormalizedSchema extends Required<NxGraphqlCodeGeneratorGeneratorSchema> {
  projectConfig: ProjectConfiguration;
  projectName: string;
  normalizedPluginPreset: keyof typeof pluginPresets;
}

export default async function (tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  const installTask = checkDependenciesInstalled(tree, normalizedOptions);
  upsertGraphqlCodegenTask(tree, normalizedOptions);
  upsertTargetDefaults(tree);
  addDefaultWorkspaceOptions(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return installTask;
}

function normalizeOptions(tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema): NormalizedSchema {
  // Validations
  if (!options.schema) {
    throw new Error('--schema is required');
  }

  if (options.pluginPreset === 'typescript-react-apollo-client' && !options.documents) {
    throw new Error('--document is required when generating client presets');
  }

  const name = names(options.project).fileName;
  const projectDirectory = name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectConfig = readProjectConfiguration(tree, projectName);

  const pluginPresetOption = ((): {
    provided: NormalizedSchema['pluginPreset'];
    normalized: keyof typeof pluginPresets;
  } => {
    const preset = options.pluginPreset || 'basic';

    if (preset === 'typescript-react-apollo-client') {
      return {
        provided: preset,
        normalized: options.externalGeneratedFile
          ? 'typescript-react-apollo-client-only'
          : 'typescript-react-apollo-client-with-types',
      };
    }

    return { provided: preset, normalized: preset };
  })();

  return {
    project: options.project,
    projectConfig,
    projectName,
    schema: options.schema || '',
    documents: options.documents || '',
    output: options.output || '',
    config: options.config || 'graphql-codegen.ts',
    pluginPreset: pluginPresetOption.provided,
    normalizedPluginPreset: pluginPresetOption.normalized,
    externalGeneratedFile: options.externalGeneratedFile || '',
  };
}

function checkDependenciesInstalled(tree: Tree, options: NormalizedSchema) {
  const packageJson = readJson(tree, 'package.json');
  const devDependencies = {};
  const dependencies = {};
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencices = packageJson.devDependencices || {};

  if (!packageJson.dependencies.graphql) {
    dependencies['graphql'] = graphqlVersion;
  } else if (
    major(checkAndCleanWithSemver('graphql', packageJson.dependencies.graphql)) <
    major(checkAndCleanWithSemver('graphql', graphqlVersion))
  ) {
    updateJson(tree, 'package.json', (json) => {
      json.dependencies['graphql'] = graphqlVersion;
      return json;
    });
  }

  if (!packageJson.devDependencies['@graphql-codegen/cli']) {
    devDependencies['@graphql-codegen/cli'] = graphqlCodegenCliVersion;
  } else if (
    major(checkAndCleanWithSemver('@graphql-codegen/cli', packageJson.devDependencies['@graphql-codegen/cli'])) <
    major(checkAndCleanWithSemver('@graphql-codegen/cli', graphqlCodegenCliVersion))
  ) {
    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@graphql-codegen/cli'] = graphqlCodegenCliVersion;
      return json;
    });
  }

  pluginPresets[options.normalizedPluginPreset].forEach((plugin) => {
    if (!packageJson.devDependencies[plugin.package]) {
      updateJson(tree, 'package.json', (json) => {
        json.devDependencies[plugin.package] = plugin.version;
        return json;
      });
    }
  });

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

function upsertGraphqlCodegenTask(tree: Tree, options: NormalizedSchema) {
  options.projectConfig.targets['graphql-codegen'] = {
    executor: '@eddeee888/nx-graphql-code-generator:codegen',
  };

  updateProjectConfiguration(tree, options.projectName, options.projectConfig);
}

function upsertTargetDefaults(tree: Tree) {
  const workspace = readNxJson(tree);

  workspace['targetDefaults']['graphql-codegen'] = workspace['targetDefaults']['graphql-codegen'] || {};
  workspace['targetDefaults']['graphql-codegen']['cache'] = true;
  workspace['targetDefaults']['graphql-codegen']['options'] =
    workspace['targetDefaults']['graphql-codegen']['options'] || {};
  workspace['targetDefaults']['graphql-codegen']['options'] = {
    configFile: '{projectRoot}/graphql-codegen.ts',
  };

  updateNxJson(tree, workspace);
}

function addDefaultWorkspaceOptions(tree: Tree, options: NormalizedSchema) {
  const workspace = readNxJson(tree);

  workspace.generators = workspace.generators || {};
  workspace.generators['@eddeee888/nx-graphql-code-generator'] =
    workspace.generators['@eddeee888/nx-graphql-code-generator'] || {};

  const prev = { ...workspace.generators['@eddeee888/nx-graphql-code-generator'] };

  workspace.generators = {
    ...workspace.generators,
    '@eddeee888/nx-graphql-code-generator': {
      ...prev,
      add: {
        schema: options.schema,
        config: options.config,
        ...prev.add,
      },
    },
  };

  updateNxJson(tree, workspace);
}

function addFiles(tree: Tree, normalizedSchema: NormalizedSchema) {
  const generationConfig = getGenerationConfig(normalizedSchema);

  const templateOptions = {
    template: '',
    config: normalizedSchema.config,
    codegenConfig: generationConfig.codegenConfig,
  };

  generateFiles(
    tree,
    path.join(__dirname, 'files', generationConfig.fileDir),
    normalizedSchema.projectConfig.root,
    templateOptions
  );
}

const getGenerationConfig = ({
  projectConfig,
  schema,
  documents,
  normalizedPluginPreset,
  output,
  externalGeneratedFile,
}: NormalizedSchema) => {
  if (normalizedPluginPreset === 'typescript-resolver-files') {
    const providedOutput = output || path.posix.join('src', 'graphql', 'schema');

    return {
      fileDir: 'typescript-resolver-files',
      codegenConfig: {
        schema,
        output: path.posix.join(projectConfig.root, providedOutput),
        presetName: 'typescript-resolver-files',
        projectRoot: projectConfig.root,
      },
    };
  }

  if (normalizedPluginPreset === 'typescript-react-apollo-client-only') {
    const providedOutput = output || 'src';
    return {
      fileDir: 'typescript-react-apollo-client-only',
      codegenConfig: {
        schema,
        documents,
        output: path.posix.join(projectConfig.root, providedOutput),
        baseTypesPath: externalGeneratedFile,
      },
    };
  }

  if (normalizedPluginPreset === 'typescript-react-apollo-client-with-types') {
    const providedOutput = output || 'src';
    return {
      fileDir: 'typescript-react-apollo-client-with-types',
      codegenConfig: {
        schema,
        documents,
        output: path.posix.join(projectConfig.root, providedOutput),
      },
    };
  }

  if (normalizedPluginPreset === 'typescript-types') {
    const providedOutput = output || path.posix.join('src', 'types.generated.ts');
    return {
      fileDir: 'typescript-types',
      codegenConfig: {
        schema,
        output: path.posix.join(projectConfig.root, providedOutput),
      },
    };
  }

  return {
    fileDir: 'basic',
    codegenConfig: {
      schema,
    },
  };
};
