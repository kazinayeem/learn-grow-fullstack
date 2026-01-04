import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'out/**',
      'build/**',
      'dist/**',
      '*.config.js',
      '*.config.mjs',
      'hostinger-build-fix.js',
      '**/*-old.*',
      '**/*.backup.*',
      '**/*.temp.*',
    ],
  },
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: {...globals.browser, ...globals.node} }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...pluginReact.configs.flat.recommended,
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  {
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-constant-condition': 'off',
      'no-unsafe-optional-chaining': 'off',
      'no-unsafe-assignment': 'off',
      'no-unsafe-member-access': 'off',
      'no-empty': 'off',
      'no-useless-catch': 'off',
      'no-redeclare': 'off',
      'no-cond-assign': 'off',
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-this-alias': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      'react/react-in-jsx-scope': 'off', // Not needed in Next.js 13+ with app router
      'react/no-unescaped-entities': 'off',
      'react/prop-types': 'off',
    }
  },
];