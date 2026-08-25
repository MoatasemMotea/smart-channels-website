import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

/**
 * ESLint flat configuration.
 *
 * `eslint-config-next` v16 exports native flat-config arrays, so they are
 * spread directly. Routing them through `@eslint/eslintrc`'s `FlatCompat` — the
 * pattern still shown in many older Next.js templates — throws
 * "Converting circular structure to JSON" against this version, because the
 * compat layer tries to serialise a config that already contains resolved
 * plugin objects.
 */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "next-env.d.ts",
      "public/**",
    ],
  },

  ...nextCoreWebVitals,
  ...nextTypeScript,

  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
    },
  },

  {
    // Build scripts are plain Node ESM, outside the TypeScript program.
    files: ["scripts/**/*.mjs"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
    },
  },
];

export default eslintConfig;
