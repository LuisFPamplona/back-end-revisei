/** @type {import("jest").Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/generated/**",
    "!src/routes/**",
    "!src/lib/**",
    "!src/server.ts",
  ],
};
