/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  root: true,
  extends: [
    'plugin:vue/vue3-essential',
    '@vue/eslint-config-typescript/recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'eslint:recommended',
    'plugin:@intlify/vue-i18n/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  rules: {
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-unused-vars': [
      'error',
      {
        varsIgnorePattern: '^_',
        argsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],
    'vue/no-deprecated-slot-attribute': 'off'
  },
  settings: {
    'vue-i18n': {
      localeDir: './path/to/locales/*.{json,json5,yaml,yml}', // extension is glob formatting!
      messageSyntaxVersion: '^9.0.0'
    }
  }
}
