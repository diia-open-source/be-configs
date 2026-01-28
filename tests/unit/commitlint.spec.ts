import { describe, expect, it } from 'vitest'

import commitlintConfig from '../../commitlint'

describe('commitlint configuration', () => {
    it('should define custom type-enum rule with all required types', () => {
        const typeEnumRule = commitlintConfig.rules['type-enum']

        expect(typeEnumRule[0]).toBe(2) // Error level
        expect(typeEnumRule[1]).toBe('always')

        const allowedTypes = typeEnumRule[2]

        expect(allowedTypes).toContain('feat')
        expect(allowedTypes).toContain('fix')
        expect(allowedTypes).toContain('docs')
        expect(allowedTypes).toContain('style')
        expect(allowedTypes).toContain('refactor')
        expect(allowedTypes).toContain('perf')
        expect(allowedTypes).toContain('test')
        expect(allowedTypes).toContain('build')
        expect(allowedTypes).toContain('ci')
        expect(allowedTypes).toContain('chore')
        expect(allowedTypes).toContain('revert')
    })
})
