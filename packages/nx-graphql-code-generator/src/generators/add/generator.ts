import {
  addDependenciesToPackageJson,
  updateJson,
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
import { major } from 'semver';
import { graphqlCodegenCliVersion, graphqlVersion } from '../../utils/versions';
import { checkAndCleanWithSemver } from '../../utils/checkAndCleanWithSemver';
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

  if (!packageJson.dependencies.graphql) {
    dependencies['graphql'] = graphqlVersion;
  } else if (
    major(
      checkAndCleanWithSemver('graphql', packageJson.dependencies.graphql)
    ) < major(checkAndCleanWithSemver('graphql', graphqlVersion))
  ) {
    updateJson(tree, 'package.json', (json) => {
      json.dependencies['graphql'] = graphqlVersion;
      return json;
    });
  }

  if (!packageJson.devDependencies['@graphql-codegen/cli']) {
    devDependencies['@graphql-codegen/cli'] = graphqlCodegenCliVersion;
  } else if (
    major(
      checkAndCleanWithSemver(
        '@graphql-codegen/cli',
        packageJson.devDependencies['@graphql-codegen/cli']
      )
    ) <
    major(
      checkAndCleanWithSemver('@graphql-codegen/cli', graphqlCodegenCliVersion)
    )
  ) {
    updateJson(tree, 'package.json', (json) => {
      json.devDependencies['@graphql-codegen/cli'] = graphqlCodegenCliVersion;
      return json;
    });
  }

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
      'graphql-codegen': {
        executor: '@eddeee888/nx-graphql-code-generator:graphql-codegen',
        options: {
          configFile: `${normalizedOptions.projectRoot}/codegen.yml`,
        },
      },
    },
  });
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);

  return installTask;
}
