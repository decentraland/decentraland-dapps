/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  globals: {
    fetch: global.fetch,
    Response: global.Response,
    Request: global.Request,
    Headers: global.Headers
  },
  moduleNameMapper: {
    '\\.(css|less|sass|scss)$': '<rootDir>/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  transform: {
    '^.+\\.(t|j)sx?$': 'ts-jest'
  },
  transformIgnorePatterns: ['node_modules/(?!(decentraland-connect)/)'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setupTests.ts']
}
