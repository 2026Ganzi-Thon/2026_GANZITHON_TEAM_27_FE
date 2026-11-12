import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'
import { defineConfig, globalIgnores } from 'eslint/config'

const featurePublicApi = {
  group: ['@/features/*/**'],
  message: 'feature 외부에서는 @/features/{domain}의 index.js 공개 API를 사용하세요.',
}

export default defineConfig([
  globalIgnores(['dist', 'coverage', '.husky/_']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      'no-restricted-imports': ['error', { patterns: [featurePublicApi] }],
    },
  },
  {
    files: ['src/features/**/*.{js,jsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            featurePublicApi,
            {
              group: ['**/routes/**', '**/pages/**'],
              message: 'features는 routes 또는 pages 계층에 의존할 수 없습니다.',
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      'src/components/**/*.{js,jsx}',
      'src/constants/**/*.{js,jsx}',
      'src/hooks/**/*.{js,jsx}',
      'src/lib/**/*.{js,jsx}',
    ],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['**/routes/**', '**/pages/**', '**/features/**'],
              message: '공통 코드는 routes, pages, features 계층에 의존할 수 없습니다.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['*.config.js', 'scripts/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  prettier,
])
