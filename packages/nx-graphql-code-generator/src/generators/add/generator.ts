import {
  addDependenciesToPackageJson,
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  getWorkspaceLayout,
  names,
  offsetFromRoot,
  readJson,
  Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import { graphqlCodegenCliVersion, graphqlVersion } from '../../utils/versions';
import { NxGraphqlCodeGeneratorGeneratorSchema } from './schema';

interface NormalizedSchema extends NxGraphqlCodeGeneratorGeneratorSchema {
  projectName: string;
  projectRoot: string;
  projectDirectory: string;
}

function normalizeOptions(
  tree: Tree,
  options: NxGraphqlCodeGeneratorGeneratorSchema
): NormalizedSchema {
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
    projectDirectory,
  };
}

function checkDependenciesInstalled(tree: Tree) {
  const packageJson = readJson(tree, 'package.json');
  const devDependencies = {};
  const dependencies = {};
  packageJson.dependencies = packageJson.dependencies || {};
  packageJson.devDependencices = packageJson.devDependencices || {};

  // base deps
  dependencies['graphql'] = graphqlVersion;
  devDependencies['@graphql-codegen/cli'] = graphqlCodegenCliVersion;

  return addDependenciesToPackageJson(tree, dependencies, devDependencies);
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = {
    ...options,
    ...names(options.project),
    offsetFromRoot: offsetFromRoot(options.projectRoot),
    template: '',
  };
  generateFiles(
    tree,
    path.join(__dirname, 'files'),
    options.projectRoot,
    templateOptions
  );
}

export default async function (
  tree: Tree,
  options: NxGraphqlCodeGeneratorGeneratorSchema
) {
  const normalizedOptions = normalizeOptions(tree, options);

  const installTask = checkDependenciesInstalled(tree);
  addProjectConfiguration(tree, normalizedOptions.projectName, {
    root: normalizedOptions.projectRoot,
    projectType: 'library',
    sourceRoot: `${normalizedOptions.projectRoot}/src`,
    targets: {
      build: {
        executor: '@eddeee888/nx-graphql-code-generator:build',
      },
    },
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return installTask;
}
