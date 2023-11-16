module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
    extraFileExtensions: ['.cjs', '.mjs'],
    sourceType: 'module',
  },

  env: {
    browser: true,
  },

  extends: [
    'eslint:recommended',
    '@typhonjs-fvtt/eslint-config-foundry.js/0.8.0',
    'plugin:jest/recommended',
    'plugin:prettier/recommended',
  ],

  plugins: ['jest'],

  rules: {
    // Specify any specific ESLint rules.
  },

  overrides: [
    {
      files: ['./*.js', './*.cjs', './*.mjs'],
      env: {
        node: true,
      },
    },
    {
      files: ['./test/**/*.js'],
      env: {
        'jest/globals': true,
      },
    },
  ],
};
