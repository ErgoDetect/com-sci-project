// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: [
      'node_modules/*',
      'dist/*',
      'build/*',
      'public/*',
      'src/vision_wasm_nosimd_internal.js',
    ],
  },
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      'prefer-const': ['error', { ignoreReadBeforeAssign: true }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
);
