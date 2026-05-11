import { defineConfig } from 'oxlint'

export default defineConfig({
    categories: {
        correctness: 'error',
        suspicious: 'warn',
    },
    ignorePatterns: ['dist', 'node_modules', 'coverage'],
})
