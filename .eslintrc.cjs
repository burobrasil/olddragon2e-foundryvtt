module.exports = {
  parserOptions: {
    ecmaVersion: 2022,
    extraFileExtensions: ['.cjs', '.mjs'],
    sourceType: 'module',
  },

  env: {
    browser: true,
  },

  extends: ['eslint:recommended', 'plugin:prettier/recommended'],

  globals: {
    // Foundry VTT globals
    foundry: 'readonly',
    game: 'readonly',
    ui: 'readonly',
    canvas: 'readonly',
    CONFIG: 'readonly',
    CONST: 'readonly',
    Hooks: 'readonly',
    Actor: 'readonly',
    Item: 'readonly',
    ChatMessage: 'readonly',
    Dialog: 'readonly',
    Roll: 'readonly',
    Macro: 'readonly',
    Application: 'readonly',
    Handlebars: 'readonly',
    fromUuid: 'readonly',
  },

  rules: {},

  overrides: [
    {
      files: ['./*.js', './*.cjs', './*.mjs'],
      env: {
        node: true,
      },
    },
    {
      files: ['./test/**/*.js'],
      globals: {
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly',
        vi: 'readonly',
      },
    },
  ],
};
