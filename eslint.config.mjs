import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
    { ignores: ['*.d.ts', '**/coverage', '**/dist'] },
    {
        extends: [
            pluginJs.configs.recommended,
            ...tseslint.configs.recommended,
            ...pluginVue.configs['flat/recommended'],
        ],
        files: ['*.vue', '**/*.vue'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            parserOptions: {
                parser: tseslint.parser,
            },
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
        },
    },
    eslintConfigPrettier,
);
