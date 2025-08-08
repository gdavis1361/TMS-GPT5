/* eslint-env node */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'react', 'react-hooks', 'import', 'jsx-a11y', 'tailwindcss'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:tailwindcss/recommended',
    'prettier'
  ],
  settings: {
    react: { version: 'detect' },
    'import/resolver': {
      typescript: {
        project: [
          './tsconfig.base.json',
          './apps/*/tsconfig.json',
          './packages/*/tsconfig.json',
        ],
      },
    },
  },
  ignorePatterns: ['**/dist/**', '**/.next/**', '**/node_modules/**'],
  overrides: [
    {
      files: ['**/*.config.{js,cjs}', '**/*.config.*.cjs'],
      env: { node: true },
      rules: { 'no-undef': 'off' },
    },
    {
      files: ['apps/api/**/*.{ts,tsx,js,cjs}'],
      rules: {
        'tailwindcss/no-custom-classname': 'off',
        'tailwindcss/classnames-order': 'off',
        'tailwindcss/enforces-shorthand': 'off',
        'tailwindcss/no-contradicting-classname': 'off',
      },
    },
    {
      files: ['**/*.{ts,tsx,js,cjs}'],
      rules: {
        'tailwindcss/no-custom-classname': 'off',
      },
    },
  ],
}

