import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  { ignores: [".next/**", "node_modules/**", "out/**"] },
];

export default eslintConfig;
