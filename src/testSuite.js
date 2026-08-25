/**
 * Deterministic Test Suite for AY 2026-27 Income Tax Engine
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    const TaxEngine = require('./taxEngine');
    const TaxValidator = require('./validators');
    const TaxParsers = require('./parsers');
    const TaxPresets = require('./presets');
    module.exports = factory(TaxEngine, TaxValidator, TaxParsers, TaxPresets);
  } else {
    root.TaxTestSuite = factory(root.TaxEngine, root.TaxValidator, root.TaxParsers, root.TaxPresets);
  }
}(typeof self !== 'undefined' ? self : this, function (TaxEngine, TaxValidator, TaxParsers, TaxPresets) {
  'use strict';

  function runAllTests() {
    const results = [];
    let passedCount = 0;
    let failedCount = 0;

    function assert(name, condition, expected, actual, details = '') {
      if (condition) {
        passedCount++;
        results.push({ name, status: 'PASSED', expected, actual, details });
      } else {
        failedCount++;
        results.push({ name, status: 'FAILED', expected, actual, details });
      }
    }

    // Test 1: New Regime Zero Tax on ₹12.75L Gross Salary (Standard Deduction ₹75k + 87A Rebate)
    {
      const res = TaxEngine.computeTax({
        grossSalary: 1275000,
        ageCategory: 'GENERAL'
      });

      assert(
        'Test 1: Zero Tax under New Regime up to ₹12.75L Gross',
        res.newRegime.finalTotalPayable === 0 && res.newRegime.rebate87A === 60000 && res.newRegime.taxableIncome === 1200000,
        'Tax Payable = 0, Rebate = 60000, Taxable = 1200000',
        `Tax Payable = ${res.newRegime.finalTotalPayable}, Rebate = ${res.newRegime.rebate87A}, Taxable = ${res.newRegime.taxableIncome}`,
        'Verifies Budget 2025 revised slab structure where income up to 12L taxable is 100% rebated u/s 87A.'
      );
    }

    // Test 2: Section 87A Marginal Relief for New Regime on income slightly above ₹12 Lakhs
    {
      // Gross = 12,85,000 -> Taxable = 12,10,000 (after 75k std ded)
      // Excess income = 10,000.
      // Base tax = 60,000 + 10,000 * 0.15 = 61,500.
      // Marginal relief = 51,500. Tax before cess = 10,000. Cess @ 4% = 400. Total = 10,400.
      const res = TaxEngine.computeTax({
        grossSalary: 1285000,
        ageCategory: 'GENERAL'
      });

      assert(
        'Test 2: Section 87A Marginal Relief in New Regime',
        res.newRegime.totalTaxAssessed === 10400 && res.newRegime.marginalRelief87A === 51500,
        'Assessed Tax = 10400, Marginal Relief = 51500',
        `Assessed Tax = ${res.newRegime.totalTaxAssessed}, Marginal Relief = ${res.newRegime.marginalRelief87A}`,
        'Ensures tax on income exceeding 12L does not exceed the incremental income over 12L.'
      );
    }

    // Test 3: Capital Gains Special Rates (AY 2026-27: 112A @ 12.5% over 1.25L & 111A @ 20%)
    {
      const cgRes = TaxEngine.calculateCapitalGainsTax({
        ltcg112a: 250000, // 2.5L listed equity LTCG (1.25L exempt -> 1.25L @ 12.5% = 15,625)
        stcg111a: 100000  // 1.0L listed equity STCG (@ 20% = 20,000)
      });

      assert(
        'Test 3: Capital Gains Tax (112A @ 12.5% above ₹1.25L and 111A @ 20%)',
        cgRes.ltcg112aTax === 15625 && cgRes.stcg111aTax === 20000 && cgRes.totalSpecialTax === 35625,
        'LTCG 112A Tax = 15625, STCG 111A Tax = 20000, Total = 35625',
        `LTCG 112A Tax = ${cgRes.ltcg112aTax}, STCG 111A Tax = ${cgRes.stcg111aTax}, Total = ${cgRes.totalSpecialTax}`,
        'Verifies revised 12.5% rate and increased ₹1.25 Lakh exemption for 112A, and 20% for 111A.'
      );
    }

    // Test 4: Surcharge with Marginal Relief for High Net Worth (Income ₹51 Lakhs in New Regime)
    {
      const res = TaxEngine.computeTax({
        grossSalary: 5175000, // Taxable = 51,00,000 (after 75k std ded)
        ageCategory: 'GENERAL'
      });

      // Slab tax on 51L:
      // 0-4L: 0
      // 4-8L (5%): 20k
      // 8-12L (10%): 40k
      // 12-16L (15%): 60k
      // 16-20L (20%): 80k
      // 20-24L (25%): 100k
      // 24-51L (30% on 27L): 810k
      // Base Tax = 11,10,000.
      // Surcharge @ 10% = 1,11,000. Total = 12,21,000.
      // Threshold 50L Tax = 10,80,000. Max allowed = 10,80,000 + 1,00,000 = 11,80,000.
      // Marginal Relief = 41,000. Net Surcharge = 70,000.
      // Tax + Surcharge = 11,80,000. Cess @ 4% = 47,200. Total = 12,27,200.
      assert(
        'Test 4: Surcharge and Marginal Relief at ₹51 Lakhs',
        res.newRegime.surchargeDetails.marginalRelief === 41000 && res.newRegime.surcharge === 70000 && res.newRegime.totalTaxAssessed === 1227200,
        'Marginal Relief = 41000, Net Surcharge = 70000, Total Tax = 1227200',
        `Marginal Relief = ${res.newRegime.surchargeDetails.marginalRelief}, Net Surcharge = ${res.newRegime.surcharge}, Total Tax = ${res.newRegime.totalTaxAssessed}`,
        'Validates statutory marginal relief capping total tax + surcharge at threshold tax + excess income.'
      );
    }

    // Test 5: Old vs New Regime Comparison with Substantial Deductions
    {
      const res = TaxEngine.computeTax({
        grossSalary: 2000000,
        professionalTax: 2500,
        propertyType: 'SELF_OCCUPIED',
        homeLoanInterest: 200000,
        sec80C: 150000,
        sec80CCD1B: 50000,
        healthInsuranceSelf: 25000,
        healthInsuranceParents: 50000,
        isSeniorParents: true,
        savingsBankInterest: 10000
      });

      // Total Old deductions = 50k(std) + 2.5k(pt) + 200k(sec24) + 150k(80C) + 50k(80CCD1B) + 75k(80D) + 10k(80TTA) = 5,37,500.
      assert(
        'Test 5: Old vs New Regime Comparison and Correct Evaluation',
        typeof res.comparison.recommendedRegime === 'string' && res.comparison.taxDifference > 0,
        'Valid regime recommendation generated',
        `Recommended Regime: ${res.comparison.recommendedRegime}, Difference: ₹${res.comparison.taxDifference.toLocaleString('en-IN')}`,
        res.comparison.recommendationReason
      );
    }

    // Test 6: Senior Citizen Pensioner & Section 80TTB Deductions
    {
      const res = TaxEngine.computeTax({
        grossSalary: 900000,
        savingsBankInterest: 20000,
        fixedDepositInterest: 40000,
        ageCategory: 'SENIOR',
        healthInsuranceSelf: 50000,
        sec80C: 150000
      });

      assert(
        'Test 6: Senior Citizen 80TTB (₹50k Interest Deduction) in Old Regime',
        res.deductions.sec80TTB === 50000 && res.deductions.allowable80D === 50000,
        '80TTB = 50000, 80D = 50000',
        `80TTB = ${res.deductions.sec80TTB}, 80D = ${res.deductions.allowable80D}`,
        'Verifies senior citizen benefits under Section 80TTB and enhanced 80D health insurance limits.'
      );
    }

    // Test 7: Interest u/s 234A, 234B, 234C & Late Fee u/s 234F
    {
      const intRes = TaxEngine.calculateInterestAndLateFee({
        assessedTax: 100000,
        totalTdsTcsPaid: 0,
        advanceTaxPaid: 0,
        filingMonth: 8, // August (1 month delay)
        isLateFiler: true,
        totalTaxableIncome: 1500000
      });

      assert(
        'Test 7: Interest 234A/B/C and Late Filing Fee 234F',
        intRes.interest234A === 1000 && intRes.interest234B === 5000 && intRes.lateFee234F === 5000,
        '234A = 1000, 234B = 5000, 234F = 5000',
        `234A = ${intRes.interest234A}, 234B = ${intRes.interest234B}, 234F = ${intRes.lateFee234F}`,
        'Validates mandatory statutory interest and late filing penalties for returns filed after July 31.'
      );
    }

    // Test 8: Fiscal Integrity Validator (PAN format, Deduction Limits, Discrepancy Detection)
    {
      const panValid = TaxValidator.validatePAN('ABCDE1234F');
      const panInvalid = TaxValidator.validatePAN('INVALID_PAN_123');

      const profileValidation = TaxValidator.validateProfile({
        pan: 'ABCDE1234F',
        grossSalary: 1500000,
        sec80C: 250000, // Exceeds 1.5L cap
        sec80CCD1B: 75000, // Exceeds 50k cap
        form16Data: { grossSalary: 1500000 },
        aisData: { grossSalary: 1800000, savingsInterest: 30000 }, // Discrepancy!
        savingsBankInterest: 0
      });

      assert(
        'Test 8: Fiscal Integrity Validations & Discrepancy Detection',
        panValid.valid === true && panInvalid.valid === false && profileValidation.warnings.length >= 3,
        'PAN validated and 3+ discrepancy/limit warnings flagged',
        `PAN Valid: ${panValid.valid}, Warnings count: ${profileValidation.warnings.length}`,
        profileValidation.warnings.map(w => w.message).join(' | ')
      );
    }

    // Test 9: Privacy-First Form 16 & AIS Parsers
    {
      const parsedF16 = TaxParsers.parseForm16(TaxPresets.MOCK_FORM16_TEXT);
      const parsedAIS = TaxParsers.parseAIS(TaxPresets.MOCK_AIS_JSON);

      assert(
        'Test 9: Form 16 & AIS Document Parsing Integrity',
        parsedF16.grossSalary === 3200000 && parsedF16.pan === 'BNZPT8941K' && parsedAIS.savingsInterest === 18000 && parsedAIS.ltcg112a === 250000,
        'F16 Salary = 32L, PAN = BNZPT8941K, AIS Interest = 18k, AIS LTCG = 2.5L',
        `F16 Salary = ${parsedF16.grossSalary}, PAN = ${parsedF16.pan}, AIS Interest = ${parsedAIS.savingsInterest}, AIS LTCG = ${parsedAIS.ltcg112a}`,
        'Verifies accurate regex and schema extraction from client-side documents.'
      );
    }

    // Test 10: Break-Even Deduction Analyzer
    {
      const breakEvenRes = TaxEngine.calculateBreakEvenDeductions({
        grossSalary: 2400000,
        otherSources: 50000,
        targetTaxNew: 280000,
        ageCategory: 'GENERAL',
        currentDeductionsOld: 200000
      });

      assert(
        'Test 10: Break-Even Deduction Solver',
        breakEvenRes.breakEvenDeduction > 0 && typeof breakEvenRes.summary === 'string',
        'Break-even deduction calculated > 0',
        `Break-Even Required: ₹${breakEvenRes.breakEvenDeduction.toLocaleString('en-IN')}`,
        breakEvenRes.summary
      );
    }

    return {
      totalTests: results.length,
      passedCount,
      failedCount,
      allPassed: failedCount === 0,
      results
    };
  }

  return {
    runAllTests
  };
}));
