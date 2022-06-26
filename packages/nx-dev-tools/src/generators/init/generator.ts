import { formatFiles, generateFiles, Tree } from '@nrwl/devkit';
import * as path from 'path';
import type { NxDevToolsGeneratorSchema } from './schema';

type NormalizedSchema = NxDevToolsGeneratorSchema;

function normalizeOptions(_tree: Tree, options: NxDevToolsGeneratorSchema): NormalizedSchema {
  return {
    ...options,
  };
}

function addFiles(tree: Tree, options: NormalizedSchema) {
  const templateOptions = { ...options, template: '' };
  generateFiles(tree, path.join(__dirname, 'files'), '', templateOptions);
}

export default async function (tree: Tree, options: NxDevToolsGeneratorSchema) {
  const normalizedOptions = normalizeOptions(tree, options);
  addFiles(tree, normalizedOptions);
  await formatFiles(tree);
}
