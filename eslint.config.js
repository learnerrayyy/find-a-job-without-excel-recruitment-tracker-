import globals from "globals";

export default [
  {
    files: ["web/**/*.js", "extension/**/*.js"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: {
        ...globals.browser,
        chrome: "readonly",
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
