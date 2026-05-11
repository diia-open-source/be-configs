import { defineConfig } from 'oxfmt'

export default defineConfig({
    printWidth: 140,
    tabWidth: 4,
    useTabs: false,
    semi: false,
    singleQuote: true,
    trailingComma: 'all',
    insertFinalNewline: true,
    sortPackageJson: false,
    ignorePatterns: ['dist', 'node_modules', 'coverage'],
})
