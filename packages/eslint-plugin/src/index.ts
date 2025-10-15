import { baseTypescriptConfig } from './configs/base-typescript';
import { typescriptConfig } from './configs/typescript';
import { reactTypescriptConfig } from './configs/react-typescript';

export const configs = {
  ['base-typescript']: baseTypescriptConfig,
  typescript: typescriptConfig,
  ['react-typescript']: reactTypescriptConfig,
};
export const rules = {};

export default { configs, rules };
