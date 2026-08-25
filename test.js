/**
 * Node CLI Test Runner for AY 2026-27 Tax Engine
 * Usage: node test.js
 */

const testSuite = require('./src/testSuite');

console.log('===============================================================');
console.log('  TaxEase India - AY 2026-27 Deterministic Test Suite Runner  ');
console.log('===============================================================\n');

const testResults = testSuite.runAllTests();

testResults.results.forEach((test, idx) => {
  const icon = test.status === 'PASSED' ? '✅ PASS' : '❌ FAIL';
  console.log(`[${idx + 1}/${testResults.totalTests}] ${icon} : ${test.name}`);
  console.log(`       Expected : ${test.expected}`);
  console.log(`       Actual   : ${test.actual}`);
  if (test.details) {
    console.log(`       Note     : ${test.details}`);
  }
  console.log('');
});

console.log('---------------------------------------------------------------');
console.log(`Results: ${testResults.passedCount} Passed, ${testResults.failedCount} Failed out of ${testResults.totalTests} tests.`);
console.log(testResults.allPassed ? '🎉 ALL DETERMINISTIC UNIT TESTS PASSED SUCCESSFULLY!' : '⚠️ SOME TESTS FAILED.');
console.log('===============================================================\n');

if (!testResults.allPassed) {
  process.exit(1);
}
