import { baseTypescriptConfig } from './configs/base-typescript';
import { typescriptConfig } from './configs/typescript';
import { reactTypescriptConfig } from './configs/react-typescript';

export default {
  configs: {
    ['base-typescript']: baseTypescriptConfig,
    typescript: typescriptConfig,
    ['react-typescript']: reactTypescriptConfig,
  },
  rules: {},
};
