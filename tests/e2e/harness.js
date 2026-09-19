/**
 * PitchMint E2E Test Harness
 * 
 * Standardized, opaque-box, requirement-driven test execution harness.
 * Zero external runner dependencies; operates natively in Node.js.
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Global registry of test suites
const suites = [];
let currentSuite = null;

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = "AssertionError";
    this.actual = actual;
    this.expected = expected;
  }
}

class SkipTestError extends Error {
  constructor(reason) {
    super(reason || "Test skipped");
    this.name = "SkipTestError";
  }
}

// -----------------------------------------------------------------------------
// Core Suite and Test Registration
// -----------------------------------------------------------------------------

function describe(suiteName, fn) {
  const suite = {
    name: suiteName,
    tests: [],
    beforeAllHooks: [],
    afterAllHooks: [],
    beforeEachHooks: [],
    afterEachHooks: [],
  };
  suites.push(suite);
  currentSuite = suite;

  try {
    fn();
  } finally {
    currentSuite = null;
  }
}

function test(testName, fn) {
  if (!currentSuite) {
    throw new Error(`Test "${testName}" must be inside a describe block`);
  }
  currentSuite.tests.push({
    name: testName,
    fn,
  });
}

const it = test;

function beforeAll(fn) {
  if (currentSuite) currentSuite.beforeAllHooks.push(fn);
}

function afterAll(fn) {
  if (currentSuite) currentSuite.afterAllHooks.push(fn);
}

function beforeEach(fn) {
  if (currentSuite) currentSuite.beforeEachHooks.push(fn);
}

function afterEach(fn) {
  if (currentSuite) currentSuite.afterEachHooks.push(fn);
}

function skip(reason) {
  throw new SkipTestError(reason);
}

// -----------------------------------------------------------------------------
// Assertion Library
// -----------------------------------------------------------------------------

function assert(condition, message = "Assertion failed") {
  if (!condition) {
    throw new AssertionError(message, condition, true);
  }
}

function assertEqual(actual, expected, message = "") {
  if (actual !== expected) {
    const msg = message ? `${message} - Expected: ${expected}, got: ${actual}` : `Expected: ${expected}, got: ${actual}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function assertNotEqual(actual, expected, message = "") {
  if (actual === expected) {
    const msg = message ? `${message} - Expected NOT: ${expected}` : `Expected NOT: ${expected}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function assertDeepEqual(actual, expected, message = "") {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const msg = message ? `${message} - Deep equal mismatch` : `Deep equal mismatch:\nActual:   ${actualStr}\nExpected: ${expectedStr}`;
    throw new AssertionError(msg, actual, expected);
  }
}

function assertMatch(actual, regex, message = "") {
  if (typeof actual !== "string" || !regex.test(actual)) {
    const msg = message ? `${message} - Value "${actual}" does not match regex ${regex}` : `Value "${actual}" does not match regex ${regex}`;
    throw new AssertionError(msg, actual, regex.toString());
  }
}

function assertContains(container, item, message = "") {
  if (container == null) {
    throw new AssertionError(`Container is null/undefined`, container, item);
  }
  if (typeof container === "string" || Array.isArray(container)) {
    if (!container.includes(item)) {
      const msg = message ? `${message} - Container does not contain item` : `Container does not contain item: ${JSON.stringify(item)}`;
      throw new AssertionError(msg, container, item);
    }
  } else if (typeof container === "object") {
    if (!(item in container)) {
      const msg = message ? `${message} - Object does not contain key "${item}"` : `Object does not contain key "${item}"`;
      throw new AssertionError(msg, container, item);
    }
  } else {
    throw new AssertionError("Invalid container type", typeof container, "string|array|object");
  }
}

function assertThrows(fn, expectedRegexOrMessage = null, message = "") {
  let threw = false;
  let caughtError = null;
  try {
    fn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || "Expected function to throw an error, but it did not throw", null, "Exception");
  }
  if (expectedRegexOrMessage) {
    const errMsg = caughtError ? caughtError.message || String(caughtError) : "";
    if (expectedRegexOrMessage instanceof RegExp) {
      if (!expectedRegexOrMessage.test(errMsg)) {
        throw new AssertionError(`Expected error matching ${expectedRegexOrMessage}, got: "${errMsg}"`, errMsg, expectedRegexOrMessage.toString());
      }
    } else if (typeof expectedRegexOrMessage === "string") {
      if (!errMsg.includes(expectedRegexOrMessage)) {
        throw new AssertionError(`Expected error containing "${expectedRegexOrMessage}", got: "${errMsg}"`, errMsg, expectedRegexOrMessage);
      }
    }
  }
}

async function assertAsyncThrows(asyncFn, expectedRegexOrMessage = null, message = "") {
  let threw = false;
  let caughtError = null;
  try {
    await asyncFn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || "Expected async function to throw, but it succeeded", null, "Exception");
  }
  if (expectedRegexOrMessage) {
    const errMsg = caughtError ? caughtError.message || String(caughtError) : "";
    if (expectedRegexOrMessage instanceof RegExp) {
      if (!expectedRegexOrMessage.test(errMsg)) {
        throw new AssertionError(`Expected error matching ${expectedRegexOrMessage}, got: "${errMsg}"`, errMsg, expectedRegexOrMessage.toString());
      }
    } else if (typeof expectedRegexOrMessage === "string") {
      if (!errMsg.includes(expectedRegexOrMessage)) {
        throw new AssertionError(`Expected error containing "${expectedRegexOrMessage}", got: "${errMsg}"`, errMsg, expectedRegexOrMessage);
      }
    }
  }
}

function assertGreaterThan(actual, benchmark, message = "") {
  if (actual <= benchmark) {
    throw new AssertionError(message || `Expected ${actual} > ${benchmark}`, actual, benchmark);
  }
}

function assertLessThan(actual, benchmark, message = "") {
  if (actual >= benchmark) {
    throw new AssertionError(message || `Expected ${actual} < ${benchmark}`, actual, benchmark);
  }
}

function assertBetween(actual, min, max, message = "") {
  if (actual < min || actual > max) {
    throw new AssertionError(message || `Expected ${actual} between [${min}, ${max}]`, actual, `[${min}, ${max}]`);
  }
}

// -----------------------------------------------------------------------------
// Mock Environments & Helpers
// -----------------------------------------------------------------------------

function createMockRequest(urlStr, options = {}) {
  const parsed = new URL(urlStr, "https://pitchmint.local");
  const headers = new Map();
  if (options.headers) {
    Object.entries(options.headers).forEach(([k, v]) => headers.set(k.toLowerCase(), v));
  }
  return {
    url: parsed.href,
    nextUrl: parsed,
    method: options.method || "GET",
    headers: {
      get: (key) => headers.get(key.toLowerCase()) || null,
      has: (key) => headers.has(key.toLowerCase()),
    },
    json: async () => options.body || {},
    text: async () => (typeof options.body === "string" ? options.body : JSON.stringify(options.body || "")),
  };
}

function getProjectRoot() {
  return path.resolve(__dirname, "../..");
}

function readProjectFile(relPath) {
  const fullPath = path.join(getProjectRoot(), relPath);
  if (!fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath, "utf-8");
}

function fileExists(relPath) {
  return fs.existsSync(path.join(getProjectRoot(), relPath));
}

// -----------------------------------------------------------------------------
// Lightweight In-Memory TS Module Loader
// -----------------------------------------------------------------------------
const moduleCache = new Map();
let tsCompiler = null;
try {
  tsCompiler = require("typescript");
} catch {
  tsCompiler = null;
}

function loadTsModule(relPath) {
  const cleanRel = relPath.replace(/\.tsx?$/, "");
  const targetTs = path.join(getProjectRoot(), `${cleanRel}.ts`);
  const targetTsx = path.join(getProjectRoot(), `${cleanRel}.tsx`);
  const fullPath = fs.existsSync(targetTs) ? targetTs : fs.existsSync(targetTsx) ? targetTsx : null;

  if (!fullPath) {
    throw new Error(`Cannot find module file: ${relPath}`);
  }

  if (moduleCache.has(fullPath)) {
    return moduleCache.get(fullPath);
  }

  let code = fs.readFileSync(fullPath, "utf-8");
  let executableJs = "";

  if (tsCompiler) {
    try {
      const transpiled = tsCompiler.transpileModule(code, {
        compilerOptions: {
          module: tsCompiler.ModuleKind.CommonJS,
          target: tsCompiler.ScriptTarget.ES2022,
          esModuleInterop: true,
          jsx: tsCompiler.JsxEmit.ReactJSX,
        },
      });
      executableJs = transpiled.outputText;
    } catch (transpileErr) {
      console.warn(`[harness] TS transpile error for ${relPath}: ${transpileErr.message}`);
    }
  }

  if (!executableJs) {
    // Fallback regex stripper
    code = code.replace(/export\s+type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, "");
    code = code.replace(/export\s+interface\s+[A-Za-z0-9_]+(\s+extends\s+[^{]+)?\s*\{[\s\S]*?\n\}/g, "");
    code = code.replace(/type\s+[A-Za-z0-9_]+\s*=\s*[^;]+;/g, "");
    code = code.replace(/interface\s+[A-Za-z0-9_]+(\s+extends\s+[^{]+)?\s*\{[\s\S]*?\n\}/g, "");
    code = code.replace(/import\s+(\w+)\s+from\s+["']([^"']+)["'];?/g, 'const $1 = require("$2");');
    code = code.replace(/import\s+\{([^}]+)\}\s+from\s+["']([^"']+)["'];?/g, (match, imports, mod) => {
      const cleaned = imports.split(",").map(s => s.trim()).filter(s => !s.startsWith("type ")).join(", ");
      if (!cleaned) return "";
      return `const { ${cleaned} } = require("${mod}");`;
    });
    code = code.replace(/\s+as\s+[A-Za-z0-9_<>]+/g, "");
    code = code.replace(/:\s*Record<[^>]+>/g, "");
    code = code.replace(/\):\s*[A-Za-z0-9_<>{}\[\]\|\s\?:]+\s*\{/g, ") {");
    code = code.replace(/(\b\w+)\??:\s*[A-Za-z0-9_<>{}\[\]\|\s\?"']+(?=[,\)])/g, "$1");

    const exportsList = [];
    code = code.replace(/export\s+async\s+function\s+([A-Za-z0-9_]+)/g, (match, name) => {
      exportsList.push(name);
      return `async function ${name}`;
    });
    code = code.replace(/export\s+function\s+([A-Za-z0-9_]+)/g, (match, name) => {
      exportsList.push(name);
      return `function ${name}`;
    });
    code = code.replace(/export\s+const\s+([A-Za-z0-9_]+)/g, (match, name) => {
      exportsList.push(name);
      return `const ${name}`;
    });

    const exportStatements = exportsList.map(e => `module.exports.${e} = ${e};`).join("\n");
    executableJs = `${code}\n${exportStatements}\n`;
  }

  const m = { exports: {} };
  const customRequire = (id) => {
    if (id === "crypto") return crypto;
    if (id === "path") return path;
    if (id === "fs") return fs;
    if (id.startsWith("@/")) {
      const resolved = id.replace("@/", "src/");
      return loadTsModule(resolved);
    }
    if (id.startsWith("./") || id.startsWith("../")) {
      const resolved = path.join(path.dirname(fullPath), id);
      const relToRoot = path.relative(getProjectRoot(), resolved);
      return loadTsModule(relToRoot);
    }
    try {
      return require(id);
    } catch {
      // Mock missing third-party modules safely
      return {};
    }
  };

  try {
    const fn = new Function("module", "exports", "require", "__dirname", "__filename", "process", "Buffer", executableJs);
    fn(m, m.exports, customRequire, path.dirname(fullPath), fullPath, process, Buffer);
    moduleCache.set(fullPath, m.exports);
    return m.exports;
  } catch (err) {
    console.warn(`[harness] loadTsModule fallback for ${relPath}: ${err.message}`);
    return {};
  }
}

// -----------------------------------------------------------------------------
// Runner Engine
// -----------------------------------------------------------------------------

async function runAllSuites() {
  const startTime = Date.now();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    suites: [],
    durationMs: 0,
  };

  for (const suite of suites) {
    const suiteResult = {
      name: suite.name,
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
      durationMs: 0,
    };
    const suiteStart = Date.now();

    for (const hook of suite.beforeAllHooks) {
      try {
        await hook();
      } catch (err) {
        console.error(`Error in beforeAll for suite "${suite.name}":`, err);
      }
    }

    for (const testCase of suite.tests) {
      results.total++;
      const testStart = Date.now();
      const testResult = {
        name: testCase.name,
        status: "passed",
        error: null,
        durationMs: 0,
      };

      for (const hook of suite.beforeEachHooks) {
        try {
          await hook();
        } catch (err) {
          console.error(`Error in beforeEach for test "${testCase.name}":`, err);
        }
      }

      try {
        await testCase.fn();
        testResult.status = "passed";
        suiteResult.passed++;
        results.passed++;
      } catch (err) {
        if (err.name === "SkipTestError") {
          testResult.status = "skipped";
          testResult.reason = err.message;
          suiteResult.skipped++;
          results.skipped++;
        } else {
          testResult.status = "failed";
          testResult.error = err.message || String(err);
          testResult.stack = err.stack;
          suiteResult.failed++;
          results.failed++;
        }
      }

      for (const hook of suite.afterEachHooks) {
        try {
          await hook();
        } catch (err) {
          console.error(`Error in afterEach for test "${testCase.name}":`, err);
        }
      }

      testResult.durationMs = Date.now() - testStart;
      suiteResult.tests.push(testResult);
    }

    for (const hook of suite.afterAllHooks) {
      try {
        await hook();
      } catch (err) {
        console.error(`Error in afterAll for suite "${suite.name}":`, err);
      }
    }

    suiteResult.durationMs = Date.now() - suiteStart;
    results.suites.push(suiteResult);
  }

  results.durationMs = Date.now() - startTime;
  return results;
}

function clearSuites() {
  suites.length = 0;
  currentSuite = null;
  moduleCache.clear();
}

module.exports = {
  describe,
  test,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  afterEach,
  skip,
  assert,
  assertEqual,
  assertNotEqual,
  assertDeepEqual,
  assertMatch,
  assertContains,
  assertThrows,
  assertAsyncThrows,
  assertGreaterThan,
  assertLessThan,
  assertBetween,
  createMockRequest,
  getProjectRoot,
  readProjectFile,
  fileExists,
  loadTsModule,
  runAllSuites,
  clearSuites,
  suites,
};
