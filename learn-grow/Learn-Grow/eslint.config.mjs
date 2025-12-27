import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"]},
  {languageOptions: { globals: globals.browser }},
  {
    rules: {
      'no-console': 'off',
      'no-undef': 'off',
      'no-unused-vars': 'error',
      'no-constant-condition': 'off',
      'no-unsafe-optional-chaining': 'error',
      'no-unsafe-assignment': 'off',
      'no-unsafe-member-access': 'off',
    }
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
];