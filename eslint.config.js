import js from '@eslint/js'
import globals from 'globals'
import eslintReact from '@eslint-react/eslint-plugin'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.lavish', '.sandcastle', '.sandcastle.old']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: globals.node,
      sourceType: 'module',
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommendedTypeChecked,
      eslintReact.configs['recommended-type-checked'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        project: [
          './tsconfig.app.json',
          './tsconfig.node.json',
          './tsconfig.eslint.json',
        ],
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@eslint-react/no-missing-component-display-name': 'off',
    },
  },
])
