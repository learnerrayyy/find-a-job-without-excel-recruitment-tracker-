import globals from "globals";

export default [
  {
    files: ["web/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      "no-undef": "error",
      "no-debugger": "error",
      "no-duplicate-case": "error",
      "no-unreachable": "warn",
    },
  },
];
