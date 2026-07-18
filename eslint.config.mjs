// Fleet ESLint flat config — API / SAM+Lambda TypeScript flavor.
// ESLint 9 + typescript-eslint 8. Translated from the fleet's .eslintrc.json
// (food-api / pick-a-time-api) preserving original intent.
import js from '@eslint/js'
import prettier from 'eslint-config-prettier'
import functional from 'eslint-plugin-functional'
import jest from 'eslint-plugin-jest'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // Build artifacts and generated files never linted.
  {
    ignores: [
      '**/__mocks__/',
      '**/__snapshots__/',
      '.aws-sam/',
      '.swc/',
      'build/',
      'coverage/',
      'dist/',
      'node_modules/',
      'package-lock.json',
      '**/*.min.*',
      'jest.*.*',
    ],
  },

  // Base recommended sets.
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Language options + fleet rule intent (from food-api / pick-a-time-api).
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
        module: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '_', ignoreRestSiblings: true, varsIgnorePattern: '_' },
      ],
      'no-negated-condition': 'error',
      'sort-vars': 'error',
    },
  },

  // eslint-plugin-functional LITE subset — rules the fleet's existing API
  // source passes with ZERO code changes.
  {
    files: ['src/**/*.ts'],
    ignores: ['**/errors.ts'], // Error subclasses legitimately use `class`/`this`.
    plugins: { functional },
    rules: {
      'functional/no-classes': 'error',
      'functional/no-this-expressions': 'error',
    },
  },

  // Jest rules scoped to test / mock files only.
  {
    files: ['**/*.test.ts', '**/__tests__/**/*.ts', '**/__mocks__/**/*.ts'],
    ...jest.configs['flat/recommended'],
    settings: { jest: { version: 29 } },
    rules: {
      ...jest.configs['flat/recommended'].rules,
      'jest/no-mocks-import': 'off',
    },
  },

  // Prettier LAST — disables all formatting rules that would fight prettier.
  prettier,
)
