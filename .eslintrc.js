module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  overrides: [
    {
      files: ['*.js', '*.jsx', '*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
      settings: {
        'import/resolver': {
          typescript: {
            project: ['./tsconfig.json'],
          },
        },
      },
      extends: [
        'next',
        'airbnb',
        'airbnb-typescript',
        'plugin:import/errors',
        'plugin:import/warnings',
        'plugin:import/typescript',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/eslint-recommended',
      ],
      plugins: [
        'import',
        'react',
        'react-hooks',
        '@typescript-eslint',
      ],
      rules: {
        'import/extensions': [
          'error',
          {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
            json: 'always',
            gql: 'always',
            graphql: 'always',
            png: 'always',
            jpg: 'always',
          },
        ],
        'no-shadow': 0,
        'no-plusplus': 0,
        'no-invalid-this': 0,
        'no-use-before-define': 0,
        'no-restricted-imports': 0,
        'no-console': ['warn', {
          allow: [
            'info',
            'warn',
            'error',
            'trace',
          ],
        }],
        'no-void': ['error', {
          allowAsStatement: true,
        }],
        'func-names': 0,
        'import/no-cycle': 0,
        'react/prop-types': 0,
        'import/no-unresolved': 0,
        'react/react-in-jsx-scope': 0,
        'react/no-unused-prop-types': 0,
        'react/require-default-props': 0,
        'import/prefer-default-export': 0,
        'react/jsx-props-no-spreading': 0,
        '@typescript-eslint/no-plusplus': 0,
        'react/function-component-definition': 0,
        '@typescript-eslint/no-shadow': ['error'],
        '@typescript-eslint/no-invalid-this': ['error'],
        '@typescript-eslint/no-use-before-define': ['error', {
          functions: false,
        }],
        '@typescript-eslint/no-non-null-assertion': 0,
        '@typescript-eslint/no-inferrable-types': 0,
        '@typescript-eslint/no-explicit-any': 0,
        '@typescript-eslint/no-unused-vars': ['error', {
          ignoreRestSiblings: true,
          argsIgnorePattern: '^_',
        }],
        '@typescript-eslint/no-misused-promises': ['error', {
          checksVoidReturn: false,
          checksConditionals: true,
        }],
        '@typescript-eslint/no-floating-promises': ['error', {
          ignoreVoid: true,
        }],
        '@typescript-eslint/ban-ts-comment': 0,
        '@typescript-eslint/explicit-module-boundary-types': 0,
        '@typescript-eslint/indent': 0,
        '@typescript-eslint/member-delimiter-style': ['error', {
          multiline: {
            delimiter: 'semi',
            requireLast: true,
          },
          singleline: {
            delimiter: 'semi',
            requireLast: false,
          },
          multilineDetection: 'brackets',
        }],
        "indent": ["error", 4],
        '@typescript-eslint/consistent-type-imports': 'error',
        '@typescript-eslint/return-await': 'error',
        '@typescript-eslint/require-await': 'error',
        '@typescript-eslint/no-namespace': 0,
        '@typescript-eslint/no-empty-interface': 0,
      },
    },
  ],
};
