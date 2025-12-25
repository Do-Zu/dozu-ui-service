module.exports = {
    root: true,
    env: {
        node: true,
        es6: true,
    },
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    ignorePatterns: ['node_modules/*', 'public/mockServiceWorker.js', 'generators/*'],
    extends: ['eslint:recommended', 'next/core-web-vitals'],
    overrides: [
        {
            files: ['**/*.ts', '**/*.tsx'],
            parser: '@typescript-eslint/parser',
            settings: {
                react: { version: 'detect' },
                'import/resolver': {
                    typescript: {},
                },
            },
            env: {
                browser: true,
                node: true,
                es6: true,
            },
            extends: [
                'eslint:recommended',
                'plugin:import/warnings',
                'plugin:import/typescript',
                'plugin:@typescript-eslint/recommended',
                'plugin:react/recommended',
                'plugin:prettier/recommended',
                'plugin:testing-library/react',
                'plugin:tailwindcss/recommended',
            ],
            rules: {
                '@next/next/no-img-element': 'off',
                'react/react-in-jsx-scope': 'off',
                'react/prop-types': 'off',
                'jsx-a11y/anchor-is-valid': 'off',
                '@typescript-eslint/no-explicit-any': 'error',
                '@typescript-eslint/no-empty-function': 'error',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/explicit-module-boundary-types': 'off',
                '@typescript-eslint/no-unused-vars': ['error'],
                'import/no-cycle': 'off',
                'import/no-duplicates': 'off',
                'import/default': 'off',
                'import/no-named-as-default-member': 'off',
                'import/no-named-as-default': 'off',
                'linebreak-style': 'off',
                'import/order': [
                    'off',
                    {
                        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'object'],
                        'newlines-between': 'always',
                        alphabetize: { order: 'asc', caseInsensitive: true },
                    },
                ],

                'prettier/prettier': ['off', {}, { usePrettierrc: true }],

                '@typescript-eslint/naming-convention': [
                    'error',
                    { selector: 'import', format: ['camelCase', 'PascalCase'], leadingUnderscore: 'allow' },
                    { selector: 'default', format: ['camelCase'], leadingUnderscore: 'allow' },
                    {
                        selector: 'variable',
                        format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
                        leadingUnderscore: 'allow',
                    },
                    { selector: 'function', format: ['camelCase', 'PascalCase'] },
                    { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
                    { selector: 'typeLike', format: ['PascalCase'] },
                    { selector: 'enumMember', format: ['UPPER_CASE'] },
                    { selector: 'property', format: ['camelCase', 'UPPER_CASE'], leadingUnderscore: 'allow' },
                    {
                        selector: 'objectLiteralProperty',
                        format: ['camelCase', 'UPPER_CASE'],
                        leadingUnderscore: 'allow',
                    },
                ],
            },
        },
        {
            plugins: ['check-file'],
            files: ['src/**/*'],
            excludedFiles: ['**/src/app/**', '**/__tests__/**'],
            rules: {
                'check-file/filename-naming-convention': [
                    'off',
                    {
                        'src/components/**/*.tsx': 'camelCase',
                        'src/app/{not-found,global-error}.tsx': 'KEBAB_CASE',
                        '**/*.{ts,tsx}': 'camelCase',
                    },
                    { ignoreMiddleExtensions: true },
                ],
                'check-file/folder-naming-convention': [
                    'warn',
                    {
                        'src/**/': 'KEBAB_CASE',
                    },
                ],
            },
        },
    ],
};
