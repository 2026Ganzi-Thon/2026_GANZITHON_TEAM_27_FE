export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'design',
        'style',
        'refactor',
        'perf',
        'test',
        'docs',
        'chore',
        'build',
        'ci',
        'revert',
      ],
    ],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'kebab-case'],
    'subject-case': [0],
  },
}
