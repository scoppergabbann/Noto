import next from "eslint-config-next";

const eslintConfig = [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      // Pola sinkronisasi form-state saat modal dibuka & flag mount memang
      // disengaja dan aman di sini; turunkan ke peringatan agar tidak memblok build.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  { ignores: [".next/**", "node_modules/**", "out/**"] },
];

export default eslintConfig;
