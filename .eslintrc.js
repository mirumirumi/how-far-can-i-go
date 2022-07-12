module.exports = {
  root: true,
  env: {
    node: true,
    // 'vue/setup-compiler-macros': true,
  },
  globals: {
    defineProps: "readonly",
    defineEmits: "readonly",
    defineExpose: "readonly",
    withDefaults: "readonly",
  },
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2020
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'prd' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'prd' ? 'warn' : 'off',
    "no-useless-escape": 0,
    "no-irregular-whitespace": 0,
    "@typescript-eslint/no-extra-semi": 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/no-var-requires": 0,
    "@typescript-eslint/no-non-null-assertion": 0,
  }
}
