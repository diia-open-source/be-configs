export = {
    extends: ['@commitlint/config-angular'],
    rules: {
        'type-enum': [2, 'always', ['build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test']],
        'header-max-length': [2, 'always', 100],
        'scope-case': [2, 'always', ['lower-case', 'upper-case']],
    },
}
