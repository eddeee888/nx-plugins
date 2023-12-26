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
import { type PluginOption, pluginPresets } from './graphql-codegen-cli/plugins';

interface NormalizedSchema extends Required<NxGraphqlCodeGeneratorGeneratorSchema> {
  projectConfig: ProjectConfiguration;
  projectName: string;
  plugins: PluginOption[];
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

  const name = names(options.project).fileName;
  const projectDirectory = name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectConfig = readProjectConfiguration(tree, projectName);

  const pluginPreset = options.pluginPreset || 'basic';

  return {
    ...options,
    schema: options.schema || '',
    documents: options.documents || '',
    output: options.output || '',
    config: options.config || 'graphql-codegen.ts',
    pluginPreset,
    plugins: pluginPresets[pluginPreset],
    projectConfig,
    projectName,
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

  options.plugins.forEach((plugin) => {
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

const getGenerationConfig = ({ pluginPreset, output, schema, projectConfig }: NormalizedSchema) => {
  if (pluginPreset === 'typescript-resolver-files') {
    const providedOutput = output || 'src/graphql/schema';

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

  return {
    fileDir: 'basic',
    codegenConfig: {
      schema,
    },
  };
};
