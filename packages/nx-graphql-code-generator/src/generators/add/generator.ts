import {
  addDependenciesToPackageJson,
  updateJson,
  formatFiles,
  generateFiles,
  names,
  offsetFromRoot,
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
import { PluginOption, pluginPresets } from './graphql-codegen-cli/plugins';

interface NormalizedSchema extends Required<NxGraphqlCodeGeneratorGeneratorSchema> {
  projectConfig: ProjectConfiguration;
  projectName: string;
  fullOutput: string;
  plugins: PluginOption[];
}

interface PresetDefaults {
  fileDir: string;
  outputPath: string;
}
const presetDefaultsMap: Record<string, PresetDefaults> = {
  'typescript-resolver-files': { fileDir: 'typescript-resolver-files', outputPath: 'src/graphql/schemas/modules' },
};
const genericPresetDefaults: PresetDefaults = {
  fileDir: 'generic',
  outputPath: 'src/graphql/generated.ts',
};

function normalizeOptions(tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema): NormalizedSchema {
  // Validations
  if (!options.schema) {
    throw new Error('--schema is required');
  }

  const name = names(options.project).fileName;
  const projectDirectory = name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectConfig = readProjectConfiguration(tree, projectName);

  const pluginPreset = options.pluginPreset ?? 'none';

  const { outputPath: defaultOutputPath } = presetDefaultsMap[pluginPreset] || genericPresetDefaults;
  const output = options.output ?? defaultOutputPath;
  const fullOutput = path.join(projectConfig.root, output);

  const plugins = getPlugins(options);

  return {
    ...options,
    schema: options.schema ?? '',
    documents: options.documents ?? '',
    config: options.config ?? 'codegen.yml',
    pluginPreset,
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
    options: { configFile: path.join(options.projectConfig.root, options.config) },
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

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.project),
    offsetFromRoot: offsetFromRoot(options.projectConfig.root),
    template: '',
  };

  const { fileDir } = presetDefaultsMap[options.pluginPreset] || genericPresetDefaults;

  generateFiles(tree, path.join(__dirname, 'files', fileDir), options.projectConfig.root, templateOptions);
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
