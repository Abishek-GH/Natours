// eslint.config.mjs
// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  // 1) Ignore build artefacts (replacement for .eslintignore)
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**'],
  },

  // 2) Core ESLint recommended rules for JavaScript
  eslint.configs.recommended,

  // 3) TypeScript-ESLint recommended rules (parser + plugin included)
  tseslint.configs.recommended,

  // 4) Disable any rules that conflict with Prettier (must come last)
  eslintConfigPrettier,
);
