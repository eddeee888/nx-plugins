import {
  addDependenciesToPackageJson,
  updateJson,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  readJson,
  Tree,
  readWorkspaceConfiguration,
  updateWorkspaceConfiguration,
  readProjectConfiguration,
  updateProjectConfiguration,
} from '@nrwl/devkit';
import * as path from 'path';
import { major } from 'semver';
import { graphqlCodegenCliVersion, graphqlVersion } from '../../utils/versions';
import { checkAndCleanWithSemver } from '../../utils/checkAndCleanWithSemver';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';

interface NormalizedSchema extends NxGraphqlCodeGeneratorGeneratorSchema {
  projectName: string;
  projectRoot: string;
}

function normalizeOptions(tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema): NormalizedSchema {
  const name = names(options.project).fileName;
  const projectDirectory = name;
  const projectName = projectDirectory.replace(new RegExp('/', 'g'), '-');
  const projectRoot = `${getWorkspaceLayout(tree).libsDir}/${projectDirectory}`;

  return {
    ...options,
    schema: options.schema ?? '',
    documents: options.documents ?? '',
    projectName,
    projectRoot,
  };
}

function checkDependenciesInstalled(tree: Tree) {
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

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

function upsertGraphqlCodegenTask(tree: Tree, projectName: string, projectRoot: string) {
  const projectConfig = readProjectConfiguration(tree, projectName);
  projectConfig.targets['graphql-codegen'] = {
    executor: '@eddeee888/nx-graphql-code-generator:codegen',
    options: {
      configFile: `${projectRoot}/codegen.yml`,
    },
  };

  updateProjectConfiguration(tree, projectName, projectConfig);
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

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.project),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export default async function (tree: Tree, options: NxGraphqlCodeGeneratorGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);

  const installTask = checkDependenciesInstalled(tree);
  upsertGraphqlCodegenTask(tree, normalizedOptions.projectName, normalizedOptions.projectRoot);
  upsertCacheableOperation(tree);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return installTask;
}
