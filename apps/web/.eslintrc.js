import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...require("eslint-config-next")(),
  {
    ignores: ["generated/**"],
  },
];
