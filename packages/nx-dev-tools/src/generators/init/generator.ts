import {
  addProjectConfiguration,
  formatFiles,
  generateFiles,
  type ProjectConfiguration,
  type Tree,
} from '@nrwl/devkit';
import * as path from 'path';
import type { NxDevToolsGeneratorSchema } from './schema';

interface NormalizedSchema {
  projectRoot: NxDevToolsGeneratorSchema['projectRoot'];
  projectName: string;
  domain: string;
}

function normalizeOptions(_tree: Tree, options: NxDevToolsGeneratorSchema): NormalizedSchema {
  const { primaryDomain, projectRoot } = options;

  const [projectName, domain] = primaryDomain.split('.');

  return {
    projectRoot,
    projectName,
    domain,
  };
}

function addProject(tree: Tree, options: NormalizedSchema) {
  const projectConfiguration: ProjectConfiguration = {
    root: options.projectRoot,
    sourceRoot: options.projectRoot,
    projectType: 'library',
    targets: {
      'nw-cert': {
        executor: '@eddeee888/nx-dev-tools:setup',
        options: { command: 'cert' },
      },
      'nw-up': {
        executor: '@eddeee888/nx-dev-tools:setup',
        options: { command: 'network-up' },
      },
      'nw-down': {
        executor: '@eddeee888/nx-dev-tools:setup',
        options: { command: 'network-down' },
      },
      up: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'up', args: '-d' },
      },
      down: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'down' },
      },
      logs: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'logs' },
      },
      start: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'start' },
      },
      stop: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'stop' },
      },
      open: {
        executor: '@eddeee888/nx-dev-tools:infra',
        options: { subCommand: 'open' },
      },
    },
    tags: [],
  };

  addProjectConfiguration(tree, options.projectRoot, projectConfiguration);
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };
  generateFiles(tree, path.join(__dirname, 'files'), options.projectRoot, templateOptions);
}

export default async function (tree: Tree, options: NxDevToolsGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addProject(tree, normalizedOptions);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
