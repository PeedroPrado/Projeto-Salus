const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,

  {
    files: ['**/*.{ts,tsx}'],

    languageOptions: {
      parser: require('@typescript-eslint/parser'),
    },

    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
    },

    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off',
    },
  },
]);