module.exports = {

  collectCoverage: true,

  coveragePathIgnorePatterns: ["/node_modules/", "/tests/", "jest.config.js"],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 70,
      lines: 80,
      statements: 80
    }
  }
};