import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";

export default tseslint.config(
  {
    ignores: ["dist", "node_modules"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      // React rules from old config
      "react/react-in-jsx-scope": "off",
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      "react/no-unused-prop-types": ["error"],
      "react/prefer-stateless-function": ["error"],
      "react/self-closing-comp": ["error"],
      "react/jsx-closing-bracket-location": ["error"],
      "react/jsx-curly-brace-presence": ["error"],
      "react/jsx-curly-newline": ["error"],
      "react/jsx-curly-spacing": ["error"],
      "react/jsx-equals-spacing": ["error", "never"],
      "react/jsx-first-prop-new-line": ["error"],
      "react/jsx-handler-names": ["error"],
      "react/jsx-key": ["error"],
      "react/jsx-max-props-per-line": ["error"],
      "react/jsx-newline": ["error"],
      "react/jsx-one-expression-per-line": [
        "error",
        {
          allow: "single-child",
        },
      ],
      "react/jsx-pascal-case": ["error"],
      "react/jsx-sort-props": ["error"],
      "react/jsx-tag-spacing": ["error"],
      "react/jsx-wrap-multilines": [
        "error",
        {
          declaration: "parens-new-line",
          assignment: "parens-new-line",
          return: "parens-new-line",
          arrow: "parens-new-line",
          condition: "parens-new-line",
          logical: "parens-new-line",
          prop: "parens-new-line",
        },
      ],
      "react/no-adjacent-inline-elements": ["error"],

      // Hooks and refresh rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  }
);
