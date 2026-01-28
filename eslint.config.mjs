import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import unicorn from 'eslint-plugin-unicorn'
import prettier from 'eslint-config-prettier'

/** @type {import('typescript-eslint').Config} */
export default tseslint.config(
    {
        ignores: ['*.js', '*.mjs', '*.mts', '**/*.js', '**/*.mjs', '**/*.mts', 'node_modules', 'dist', 'coverage'],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    unicorn.configs['flat/recommended'],
    {
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                project: ['./tsconfig.json', './tests/tsconfig.json'],
                ecmaVersion: 2022,
                sourceType: 'module',
            },
        },
        rules: {
            // TypeScript specific rules
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    ignoreRestSiblings: true,
                },
            ],
            '@typescript-eslint/consistent-type-imports': [
                'error',
                {
                    prefer: 'type-imports',
                    fixStyle: 'inline-type-imports',
                },
            ],

            // Unicorn rules
            'unicorn/filename-case': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/no-null': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-top-level-await': 'off',

            // General rules
            'no-console': 'warn',
            'prefer-const': 'error',
            'no-var': 'error',
        },
    },
    prettier,
)
