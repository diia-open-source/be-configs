import fs from 'fs'
import { resolve } from 'path'

import { JestConfigWithTsJest, pathsToModuleNameMapper } from 'ts-jest'

import { setCoverageConfig } from './utils'

const moduleNameMapper = pathsToModuleNameMapper(
    {
        '@services/*': [resolve('src/services/*')],
        '@providers/*': [resolve('src/providers/*')],
        '@interfaces/*': [resolve('src/interfaces/*')],
        '@models/*': [resolve('src/models/*')],
        '@dataMappers/*': [resolve('src/dataMappers/*')],
        '@utils/*': [resolve('src/utils/*')],
        '@xmlMappings/*': [resolve('src/xmlMappings/*')],
        '@actions/*': [resolve('src/actions/*')],
        '@pages/*': [resolve('src/pages/*')],
        '@src/*': [resolve('src/*')],
        '@tests/*': [resolve('tests/*')],
        '@mocks/*': [resolve('tests/mocks/*')],
        '@validation/*': [resolve('src/validation/*')],
        '@generated/*': [resolve('src/generated/*')],
    },
    { useESM: true },
)

const matchersExtend = resolve(__dirname, './setupMatchers.js')

function createProject(name: string, config: JestConfigWithTsJest = {}): JestConfigWithTsJest {
    const setupFilesAfterEnv = [matchersExtend]
    const setupFile = resolve(`./tests/${name}/setup.ts`)

    if (fs.existsSync(setupFile)) {
        setupFilesAfterEnv.push(setupFile)
    }

    return {
        displayName: name,
        preset: 'ts-jest',
        clearMocks: true,
        restoreMocks: true,
        resetMocks: true,
        moduleNameMapper,
        testMatch: [`**/tests/${name}/**/*.spec.ts`],
        setupFilesAfterEnv,
        ...config,
    }
}

export = {
    verbose: true,
    forceExit: true,
    ...setCoverageConfig(),
    projects: [createProject('unit'), createProject('integration'), createProject('sequential')],
}
