import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        browser: true,
        node: true,
        crypto: true
      }
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off", // Turned off so we can use console.log safely for testing
      "prefer-const": "error"
    }
  }
];