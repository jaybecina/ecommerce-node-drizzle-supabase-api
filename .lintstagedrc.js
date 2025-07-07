/* eslint-env node */

const path = require("path");

const buildEslintCommand = (filenames) =>
  `npx eslint --fix ${filenames.map((f) => path.relative(process.cwd(), f)).join(" ")}`;

module.exports = {
  // Type check TypeScript files
  "*.{ts,tsx}": () => "npx tsc --noEmit",
  "*.{js,jsx,ts,tsx,json,md,prettierrc,css,scss}":
    "prettier --write --config .prettierrc",
  "*.{js,jsx,ts,tsx}": [buildEslintCommand],
};
