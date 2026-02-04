const coreDapps = require('@dcl/eslint-config/core-dapps.config')

module.exports = [
  {
    ignores: [
      'dist/**',
      '__mocks__/**',
      'node_modules/**',
      '*.js',
      '*.cjs',
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.test.ts',
      '**/*.test.tsx',
      'src/tests/**',
    ],
  },
  ...coreDapps,
  {
    rules: {
      // Disable naming-convention - too strict for existing codebase
      '@typescript-eslint/naming-convention': 'off',
      // Allow default exports (common pattern in React)
      'import/no-default-export': 'off',
      // Allow multiple export declarations
      'import/group-exports': 'off',
      // Allow exports not at end of file
      'import/exports-last': 'off',
      // Warn instead of error for explicit any
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow empty object type
      '@typescript-eslint/no-empty-object-type': 'off',
      // Allow unsafe function type
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      // Allow unused vars with underscore prefix
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Allow @ts-ignore and @ts-nocheck (legacy code)
      '@typescript-eslint/ban-ts-comment': 'warn',
      // Allow uppercase Object type
      '@typescript-eslint/no-wrapper-object-types': 'warn',
      // Allow lexical declarations in case blocks
      'no-case-declarations': 'warn',
      // Allow arguments usage
      'prefer-rest-params': 'warn',
      // Warn for import order
      'import/order': 'warn',
      // Disable react-hooks rules if plugin not configured
      'react-hooks/exhaustive-deps': 'off',
      // Allow generator functions without yield (for saga patterns)
      'require-yield': 'off',
      // Allow fallthrough in switch
      'no-fallthrough': 'warn',
      // Allow methods without this: void
      '@typescript-eslint/unbound-method': 'off',
      // Allow namespace imports
      'import/namespace': 'off',
    },
  },
]
