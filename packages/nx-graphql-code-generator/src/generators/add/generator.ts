import {
  addDependenciesToPackageJson,
  updateJson,
  formatFiles,
  generateFiles,
  names,
  offsetFromRoot,
  readJson,
  Tree,
  readWorkspaceConfiguration,
  updateWorkspaceConfiguration,
  readProjectConfiguration,
  updateProjectConfiguration,
  ProjectConfiguration,
} from '@nrwl/devkit';
import * as path from 'path';
import { major } from 'semver';
import { graphqlCodegenCliVersion, graphqlVersion } from '../../utils/versions';
import { checkAndCleanWithSemver } from '../../utils/checkAndCleanWithSemver';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';
import { PluginOption, pluginPresets } from './graphql-codegen-cli/plugins';

interface NormalizedSchema extends Required<NxGraphqlCodeGeneratorGeneratorSchema> {
  projectConfig: ProjectConfiguration;
  projectName: string;
  fullOutput: string;
  plugins: PluginOption[];
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

  const output = options.output ?? 'graphql/generated.ts';
  const fullOutput = path.join(projectConfig.root, output);

  const plugins = getPlugins(options);

  return {
    ...options,
    schema: options.schema ?? '',
    documents: options.documents ?? '',
    config: options.config ?? 'codegen.yml',
    pluginPreset: options.pluginPreset ?? 'none',
    output,
    fullOutput,
    projectConfig,
    projectName,
    plugins,
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

function getPlugins(options: NxGraphqlCodeGeneratorGeneratorSchema): PluginOption[] {
  if (!options.pluginPreset) {
    return [];
  }

  return pluginPresets[options.pluginPreset] || [];
}

function upsertGraphqlCodegenTask(tree: Tree, options: NormalizedSchema) {
  options.projectConfig.targets['graphql-codegen'] = {
    executor: '@eddeee888/nx-graphql-code-generator:codegen',
    outputs: [],
    options: {
      configFile: path.join(options.projectConfig.root, options.config),
      watch: false,
    },
    configurations: {
      watch: {
        watch: true,
      },
    },
  };

  updateProjectConfiguration(tree, options.projectName, options.projectConfig);
}

function upsertCacheableOperation(tree: Tree) {
  const workspace = readWorkspaceConfiguration(tree);
  if (
    !workspace.tasksRunnerOptions ||
    !workspace.tasksRunnerOptions.default ||
    (workspace.tasksRunnerOptions.default.runner !== '@nrwl/workspace/tasks-runners/default' &&
      workspace.tasksRunnerOptions.default.runner !== 'nx/tasks-runners/default')
  ) {
    return;
  }

  workspace.tasksRunnerOptions.default.options = workspace.tasksRunnerOptions.default.options || {};

  workspace.tasksRunnerOptions.default.options.cacheableOperations =
    workspace.tasksRunnerOptions.default.options.cacheableOperations || [];
  if (!workspace.tasksRunnerOptions.default.options.cacheableOperations?.includes('graphql-codegen')) {
    workspace.tasksRunnerOptions.default.options.cacheableOperations.push('graphql-codegen');
  }
  updateWorkspaceConfiguration(tree, workspace);
}

function addDefaultWorkspaceOptions(tree: Tree, options: NormalizedSchema) {
  const workspace = readWorkspaceConfiguration(tree);

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
        pluginPreset: options.pluginPreset !== 'none' ? options.pluginPreset : undefined,
        ...prev.add,
      },
    },
  };

  updateWorkspaceConfiguration(tree, workspace);
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.project),
    offsetFromRoot: offsetFromRoot(options.projectConfig.root),
    template: '',
  };
  generateFiles(tree, path.join(__dirname, 'files'), options.projectConfig.root, templateOptions);
}

export default async function (tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  const installTask = checkDependenciesInstalled(tree, normalizedOptions);
  upsertGraphqlCodegenTask(tree, normalizedOptions);
  upsertCacheableOperation(tree);
  addDefaultWorkspaceOptions(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return installTask;
}
