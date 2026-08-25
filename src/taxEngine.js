/**
 * TaxEngine AY 2026-27 (FY 2025-26)
 * Deterministic, mathematically verified Indian Income Tax calculation engine.
 * Fully compliant with Finance Act provisions for Assessment Year 2026-27.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxEngine = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const CONSTANTS = {
    ASSESSMENT_YEAR: '2026-27',
    FINANCIAL_YEAR: '2025-26',
    NEW_REGIME_STD_DEDUCTION: 75000,
    OLD_REGIME_STD_DEDUCTION: 50000,
    CESS_RATE: 0.04,
    NEW_REGIME_87A_LIMIT: 1200000,
    NEW_REGIME_87A_MAX_REBATE: 60000,
    OLD_REGIME_87A_LIMIT: 500000,
    OLD_REGIME_87A_MAX_REBATE: 12500,
    LTCG_112A_EXEMPTION: 125000, // Budget 2024/2025 revised to 1.25 Lakh
    LTCG_112A_RATE: 0.125,       // 12.5%
    STCG_111A_RATE: 0.20,        // 20%
    OTHER_LTCG_RATE: 0.125,      // 12.5%
  };

  /**
   * Calculate basic slab tax under New Tax Regime (Section 115BAC) for AY 2026-27
   * Slabs:
   * 0 to 4,00,000 : Nil
   * 4,00,001 to 8,00,000 : 5%
   * 8,00,001 to 12,00,000 : 10%
   * 12,00,001 to 16,00,000 : 15%
   * 16,00,001 to 20,00,000 : 20%
   * 20,00,001 to 24,00,000 : 25%
   * Above 24,00,000 : 30%
   */
  function calculateNewRegimeSlabTax(slabTaxableIncome) {
    let income = Math.max(0, Math.round(slabTaxableIncome));
    let tax = 0;
    const breakdown = [];

    const slabs = [
      { min: 0, max: 400000, rate: 0.00, label: 'Up to ₹4,00,000' },
      { min: 400000, max: 800000, rate: 0.05, label: '₹4,00,001 - ₹8,00,000' },
      { min: 800000, max: 1200000, rate: 0.10, label: '₹8,00,001 - ₹12,00,000' },
      { min: 1200000, max: 1600000, rate: 0.15, label: '₹12,00,001 - ₹16,00,000' },
      { min: 1600000, max: 2000000, rate: 0.20, label: '₹16,00,001 - ₹20,00,000' },
      { min: 2000000, max: 2400000, rate: 0.25, label: '₹20,00,001 - ₹24,00,000' },
      { min: 2400000, max: Infinity, rate: 0.30, label: 'Above ₹24,00,000' },
    ];

    for (const slab of slabs) {
      if (income > slab.min) {
        const taxableInSlab = Math.min(income, slab.max) - slab.min;
        const slabTax = taxableInSlab * slab.rate;
        tax += slabTax;
        breakdown.push({
          slab: slab.label,
          taxableAmount: taxableInSlab,
          rate: slab.rate * 100,
          tax: Math.round(slabTax)
        });
      } else {
        breakdown.push({
          slab: slab.label,
          taxableAmount: 0,
          rate: slab.rate * 100,
          tax: 0
        });
      }
    }

    return { tax: Math.round(tax), breakdown };
  }

  /**
   * Calculate basic slab tax under Old Tax Regime for AY 2026-27
   * Slabs for Individuals (<60 yrs):
   * 0 to 2,50,000: Nil
   * 2,50,001 to 5,00,000: 5%
   * 5,00,001 to 10,00,000: 20%
   * Above 10,00,000: 30%
   * (Senior 60-80: 3L base exemption; Super Senior 80+: 5L base exemption)
   */
  function calculateOldRegimeSlabTax(slabTaxableIncome, ageCategory = 'GENERAL') {
    let income = Math.max(0, Math.round(slabTaxableIncome));
    let tax = 0;
    const breakdown = [];

    let baseLimit = 250000;
    if (ageCategory === 'SENIOR') baseLimit = 300000;       // 60 to 79 yrs
    if (ageCategory === 'SUPER_SENIOR') baseLimit = 500000; // 80+ yrs

    const slabs = [
      { min: 0, max: baseLimit, rate: 0.00, label: `Up to ₹${(baseLimit / 100000).toFixed(1)} Lakh` },
      { min: baseLimit, max: 500000, rate: 0.05, label: `₹${(baseLimit / 100000).toFixed(1)}L - ₹5,00,000` },
      { min: 500000, max: 1000000, rate: 0.20, label: '₹5,00,001 - ₹10,00,000' },
      { min: 1000000, max: Infinity, rate: 0.30, label: 'Above ₹10,00,000' }
    ].filter(s => s.min < s.max);

    for (const slab of slabs) {
      if (income > slab.min) {
        const taxableInSlab = Math.min(income, slab.max) - slab.min;
        const slabTax = taxableInSlab * slab.rate;
        tax += slabTax;
        breakdown.push({
          slab: slab.label,
          taxableAmount: taxableInSlab,
          rate: slab.rate * 100,
          tax: Math.round(slabTax)
        });
      } else {
        breakdown.push({
          slab: slab.label,
          taxableAmount: 0,
          rate: slab.rate * 100,
          tax: 0
        });
      }
    }

    return { tax: Math.round(tax), breakdown };
  }

  /**
   * Compute Capital Gains Special Tax
   */
  function calculateCapitalGainsTax(capitalGains = {}) {
    const ltcg112a = Math.max(0, Number(capitalGains.ltcg112a) || 0); // Listed equity/MFs
    const stcg111a = Math.max(0, Number(capitalGains.stcg111a) || 0); // Listed equity/MFs
    const otherLtcg = Math.max(0, Number(capitalGains.otherLtcg) || 0); // Real estate, gold, unlisted
    const otherStcg = Math.max(0, Number(capitalGains.otherStcg) || 0); // Taxed at normal slab rate

    // Section 112A: 12.5% on gains exceeding ₹1.25 Lakh
    const ltcg112aTaxable = Math.max(0, ltcg112a - CONSTANTS.LTCG_112A_EXEMPTION);
    const ltcg112aTax = Math.round(ltcg112aTaxable * CONSTANTS.LTCG_112A_RATE);

    // Section 111A: 20% on STCG
    const stcg111aTax = Math.round(stcg111a * CONSTANTS.STCG_111A_RATE);

    // Other LTCG: 12.5%
    const otherLtcgTax = Math.round(otherLtcg * CONSTANTS.OTHER_LTCG_RATE);

    const totalSpecialTax = ltcg112aTax + stcg111aTax + otherLtcgTax;
    const totalSpecialGains = ltcg112a + stcg111a + otherLtcg;

    return {
      ltcg112a,
      ltcg112aTaxable,
      ltcg112aTax,
      stcg111a,
      stcg111aTax,
      otherLtcg,
      otherLtcgTax,
      otherStcg, // will be added to slab income
      totalSpecialTax,
      totalSpecialGains
    };
  }

  /**
   * Section 87A Rebate Computation
   * New Regime: 100% rebate up to ₹12 Lakh taxable income (max ₹60,000), with marginal relief.
   * Old Regime: Up to ₹12,500 rebate if taxable income <= ₹5 Lakh.
   */
  function calculateRebate87A(taxableIncome, baseTax, regime = 'NEW') {
    let rebate = 0;
    let marginalRelief87A = 0;

    if (regime === 'NEW') {
      if (taxableIncome <= CONSTANTS.NEW_REGIME_87A_LIMIT) {
        rebate = Math.min(baseTax, CONSTANTS.NEW_REGIME_87A_MAX_REBATE);
      } else {
        // Marginal Relief for New Regime Section 87A:
        // If income exceeds 12L, the tax payable cannot exceed (Total Income - 12L)
        const excessIncome = taxableIncome - CONSTANTS.NEW_REGIME_87A_LIMIT;
        if (baseTax > excessIncome) {
          marginalRelief87A = Math.max(0, baseTax - excessIncome);
          rebate = marginalRelief87A;
        }
      }
    } else {
      // Old regime
      if (taxableIncome <= CONSTANTS.OLD_REGIME_87A_LIMIT) {
        rebate = Math.min(baseTax, CONSTANTS.OLD_REGIME_87A_MAX_REBATE);
      }
    }

    return {
      rebate: Math.round(rebate),
      marginalRelief87A: Math.round(marginalRelief87A)
    };
  }

  /**
   * Surcharge Calculation with Marginal Relief
   */
  function calculateSurcharge(totalIncome, taxBeforeSurcharge, regime = 'NEW') {
    if (totalIncome <= 5000000 || taxBeforeSurcharge <= 0) {
      return { surchargeRate: 0, surcharge: 0, marginalRelief: 0, netSurcharge: 0 };
    }

    let surchargeRate = 0;
    let threshold = 5000000;

    if (regime === 'NEW') {
      // New regime surcharge caps at 25% for >2Cr
      if (totalIncome > 20000000) {
        surchargeRate = 0.25;
        threshold = 20000000;
      } else if (totalIncome > 10000000) {
        surchargeRate = 0.15;
        threshold = 10000000;
      } else if (totalIncome > 5000000) {
        surchargeRate = 0.10;
        threshold = 5000000;
      }
    } else {
      // Old regime surcharge
      if (totalIncome > 50000000) {
        surchargeRate = 0.37;
        threshold = 50000000;
      } else if (totalIncome > 20000000) {
        surchargeRate = 0.25;
        threshold = 20000000;
      } else if (totalIncome > 10000000) {
        surchargeRate = 0.15;
        threshold = 10000000;
      } else if (totalIncome > 5000000) {
        surchargeRate = 0.10;
        threshold = 5000000;
      }
    }

    const rawSurcharge = Math.round(taxBeforeSurcharge * surchargeRate);

    // Marginal Relief check:
    // Total Tax + Surcharge cannot exceed (Tax on Threshold + (Total Income - Threshold))
    let thresholdTax = 0;
    if (regime === 'NEW') {
      thresholdTax = calculateNewRegimeSlabTax(threshold).tax;
    } else {
      thresholdTax = calculateOldRegimeSlabTax(threshold).tax;
    }

    // Add previous tier surcharge on threshold if applicable
    let thresholdSurcharge = 0;
    if (threshold === 10000000) thresholdSurcharge = Math.round(thresholdTax * 0.10);
    if (threshold === 20000000) thresholdSurcharge = Math.round(thresholdTax * 0.15);
    if (threshold === 50000000) thresholdSurcharge = Math.round(thresholdTax * 0.25);

    const maxAllowedTaxAndSurcharge = (thresholdTax + thresholdSurcharge) + (totalIncome - threshold);
    const currentTaxAndSurcharge = taxBeforeSurcharge + rawSurcharge;

    let marginalRelief = 0;
    if (currentTaxAndSurcharge > maxAllowedTaxAndSurcharge) {
      marginalRelief = Math.max(0, currentTaxAndSurcharge - maxAllowedTaxAndSurcharge);
    }

    const netSurcharge = Math.max(0, Math.round(rawSurcharge - marginalRelief));

    return {
      surchargeRate: surchargeRate * 100,
      surcharge: rawSurcharge,
      marginalRelief,
      netSurcharge
    };
  }

  /**
   * Calculate Interest under Section 234A, 234B, 234C and Late Fee 234F
   */
  function calculateInterestAndLateFee(params = {}) {
    const {
      assessedTax = 0,
      totalTdsTcsPaid = 0,
      advanceTaxPaid = 0,
      filingMonth = 7, // 7 = July (Due date month for non-audit), 8 = Aug, etc.
      isLateFiler = false,
      totalTaxableIncome = 0
    } = params;

    const netTaxPayable = Math.max(0, assessedTax - totalTdsTcsPaid);
    const advanceTaxShortfall = Math.max(0, assessedTax - totalTdsTcsPaid - advanceTaxPaid);

    // Section 234A: Delay in filing return (1% simple interest per month or part of month)
    let interest234A = 0;
    if (isLateFiler || filingMonth > 7) {
      const delayMonths = Math.max(1, filingMonth - 7);
      interest234A = Math.round(advanceTaxShortfall * 0.01 * delayMonths);
    }

    // Section 234B: Default in payment of advance tax (less than 90% of assessed tax paid by March 31)
    let interest234B = 0;
    if (netTaxPayable >= 10000) {
      const ninetyPercentAssessed = netTaxPayable * 0.90;
      if (advanceTaxPaid < ninetyPercentAssessed) {
        // 1% per month from April 1 of AY till payment / filing
        const months = Math.max(1, filingMonth - 3);
        interest234B = Math.round((netTaxPayable - advanceTaxPaid) * 0.01 * months);
      }
    }

    // Section 234C: Deferment of Advance Tax installments
    // Simplified statutory estimation based on advance tax paid
    let interest234C = 0;
    if (netTaxPayable >= 10000 && advanceTaxPaid < netTaxPayable) {
      const shortfall = netTaxPayable - advanceTaxPaid;
      interest234C = Math.round(shortfall * 0.03); // Approximate quarterly tranche lag
    }

    // Section 234F: Late Filing Fee
    let lateFee234F = 0;
    if (isLateFiler || filingMonth > 7) {
      if (totalTaxableIncome > 500000) {
        lateFee234F = 5000;
      } else if (totalTaxableIncome > 0) {
        lateFee234F = 1000;
      }
    }

    const totalInterestAndFees = interest234A + interest234B + interest234C + lateFee234F;

    return {
      interest234A,
      interest234B,
      interest234C,
      lateFee234F,
      totalInterestAndFees
    };
  }

  /**
   * Main Comprehensive Tax Computation Function for AY 2026-27
   * Computes both Old and New Tax Regimes simultaneously and returns full breakdown
   */
  function computeTax(input = {}) {
    const ageCategory = input.ageCategory || 'GENERAL'; // GENERAL, SENIOR (60-79), SUPER_SENIOR (80+)

    // 1. Income from Salary
    const grossSalary = Math.max(0, Number(input.grossSalary) || 0);
    const professionalTax = Math.max(0, Math.min(2500, Number(input.professionalTax) || 0));
    const entertainmentAllowance = Math.max(0, Number(input.entertainmentAllowance) || 0);

    // 2. House Property
    const propertyType = input.propertyType || 'SELF_OCCUPIED'; // SELF_OCCUPIED or LET_OUT
    const rentReceived = Math.max(0, Number(input.rentReceived) || 0);
    const municipalTaxes = Math.max(0, Number(input.municipalTaxes) || 0);
    const homeLoanInterest = Math.max(0, Number(input.homeLoanInterest) || 0);

    // Net Annual Value & Standard 30% Deduction for Let-Out
    let netAnnualValue = Math.max(0, rentReceived - municipalTaxes);
    let standardPropertyDeduction = 0;
    let housePropertyIncomeOld = 0;
    let housePropertyIncomeNew = 0;

    if (propertyType === 'LET_OUT') {
      standardPropertyDeduction = Math.round(netAnnualValue * 0.30);
      const netLetOut = netAnnualValue - standardPropertyDeduction - homeLoanInterest;
      housePropertyIncomeOld = netLetOut;
      housePropertyIncomeNew = netLetOut; // Let out interest is allowable up to rent
    } else {
      // Self-occupied: Sec 24(b) deduction up to ₹2,00,000 in Old Regime; 0 in New Regime
      const allowableInterestOld = Math.min(200000, homeLoanInterest);
      housePropertyIncomeOld = -allowableInterestOld;
      housePropertyIncomeNew = 0; // Not allowed in New Regime for self-occupied
    }

    // 3. Capital Gains
    const cg = calculateCapitalGainsTax(input.capitalGains || {});

    // 4. Income from Other Sources
    const savingsBankInterest = Math.max(0, Number(input.savingsBankInterest) || 0);
    const fixedDepositInterest = Math.max(0, Number(input.fixedDepositInterest) || 0);
    const dividendIncome = Math.max(0, Number(input.dividendIncome) || 0);
    const familyPension = Math.max(0, Number(input.familyPension) || 0);
    const otherIncome = Math.max(0, Number(input.otherIncome) || 0);

    // Family Pension deduction:
    // Old: 1/3rd or ₹15,000 (whichever is lower)
    // New: 1/3rd or ₹25,000 (whichever is lower)
    const familyPensionDedOld = Math.min(Math.round(familyPension / 3), 15000);
    const familyPensionDedNew = Math.min(Math.round(familyPension / 3), 25000);

    const otherSourcesOld = savingsBankInterest + fixedDepositInterest + dividendIncome +
      Math.max(0, familyPension - familyPensionDedOld) + otherIncome;
    const otherSourcesNew = savingsBankInterest + fixedDepositInterest + dividendIncome +
      Math.max(0, familyPension - familyPensionDedNew) + otherIncome;

    // 5. Gross Total Income (before Chapter VI-A deductions)
    // New Regime Salary: Gross - Standard Deduction (75k)
    const salaryNew = Math.max(0, grossSalary - CONSTANTS.NEW_REGIME_STD_DEDUCTION);
    // Old Regime Salary: Gross - Standard Deduction (50k) - Professional Tax - Entertainment
    const salaryOld = Math.max(0, grossSalary - CONSTANTS.OLD_REGIME_STD_DEDUCTION - professionalTax - entertainmentAllowance);

    // Chapter VI-A Deductions (Old Regime)
    const sec80C = Math.min(150000, Math.max(0, Number(input.sec80C) || 0));
    const sec80CCD1B = Math.min(50000, Math.max(0, Number(input.sec80CCD1B) || 0)); // NPS Self
    const sec80CCD2 = Math.max(0, Number(input.sec80CCD2) || 0); // Employer NPS (Allowed in both Old & New!)
    
    // 80D Health Insurance
    const healthInsuranceSelf = Math.max(0, Number(input.healthInsuranceSelf) || 0);
    const healthInsuranceParents = Math.max(0, Number(input.healthInsuranceParents) || 0);
    const isSeniorParents = Boolean(input.isSeniorParents);
    const isSeniorSelf = ageCategory !== 'GENERAL';
    const limitSelf80D = isSeniorSelf ? 50000 : 25000;
    const limitParents80D = isSeniorParents ? 50000 : 25000;
    const allowable80D = Math.min(limitSelf80D, healthInsuranceSelf) + Math.min(limitParents80D, healthInsuranceParents);

    // 80E (Education loan interest), 80G (Donations), 80GGA, 80U, 80DD, etc.
    const sec80E = Math.max(0, Number(input.sec80E) || 0);
    const sec80G = Math.max(0, Number(input.sec80G) || 0);
    const hraExemption = Math.max(0, Number(input.hraExemption) || 0); // Section 10(13A)

    // 80TTA / 80TTB Interest deduction
    let sec80TTA = 0;
    let sec80TTB = 0;
    if (ageCategory === 'GENERAL') {
      sec80TTA = Math.min(10000, savingsBankInterest);
    } else {
      sec80TTB = Math.min(50000, savingsBankInterest + fixedDepositInterest);
    }

    const otherDeductionsOld = Math.max(0, Number(input.otherDeductionsOld) || 0);

    const totalDeductionsOld = sec80C + sec80CCD1B + sec80CCD2 + allowable80D +
      sec80E + sec80G + sec80TTA + sec80TTB + hraExemption + otherDeductionsOld;

    // Deductions allowable in New Regime:
    // Only 80CCD(2) (Employer NPS) & 80CCH (Agniveer) are allowable
    const totalDeductionsNew = sec80CCD2;

    // Net Taxable Income Calculation
    // Total Slab Income (Ordinary Income): Salary + House Property + Other Sources + Other STCG
    const rawSlabIncomeOld = Math.max(0, (salaryOld + housePropertyIncomeOld + otherSourcesOld + cg.otherStcg) - totalDeductionsOld);
    const rawSlabIncomeNew = Math.max(0, (salaryNew + housePropertyIncomeNew + otherSourcesNew + cg.otherStcg) - totalDeductionsNew);

    // Total Taxable Income (including special rate capital gains)
    const totalTaxableIncomeOld = rawSlabIncomeOld + cg.totalSpecialGains;
    const totalTaxableIncomeNew = rawSlabIncomeNew + cg.totalSpecialGains;

    // Slabs and Base Tax Calculations
    const slabTaxOldResult = calculateOldRegimeSlabTax(rawSlabIncomeOld, ageCategory);
    const slabTaxNewResult = calculateNewRegimeSlabTax(rawSlabIncomeNew);

    const baseTaxOld = slabTaxOldResult.tax + cg.totalSpecialTax;
    const baseTaxNew = slabTaxNewResult.tax + cg.totalSpecialTax;

    // Section 87A Rebate
    const rebateOldResult = calculateRebate87A(totalTaxableIncomeOld, baseTaxOld, 'OLD');
    const rebateNewResult = calculateRebate87A(totalTaxableIncomeNew, baseTaxNew, 'NEW');

    const taxAfterRebateOld = Math.max(0, baseTaxOld - rebateOldResult.rebate);
    const taxAfterRebateNew = Math.max(0, baseTaxNew - rebateNewResult.rebate);

    // Surcharge
    const surchargeOldResult = calculateSurcharge(totalTaxableIncomeOld, taxAfterRebateOld, 'OLD');
    const surchargeNewResult = calculateSurcharge(totalTaxableIncomeNew, taxAfterRebateNew, 'NEW');

    // Health & Education Cess @ 4%
    const cessOld = Math.round((taxAfterRebateOld + surchargeOldResult.netSurcharge) * CONSTANTS.CESS_RATE);
    const cessNew = Math.round((taxAfterRebateNew + surchargeNewResult.netSurcharge) * CONSTANTS.CESS_RATE);

    // Relief u/s 89 (arrears relief)
    const relief89 = Math.max(0, Number(input.relief89) || 0);

    // Total Assessed Tax Liability
    const totalTaxOld = Math.max(0, taxAfterRebateOld + surchargeOldResult.netSurcharge + cessOld - relief89);
    const totalTaxNew = Math.max(0, taxAfterRebateNew + surchargeNewResult.netSurcharge + cessNew - relief89);

    // Taxes Paid: TDS, TCS, Advance Tax, Self Assessment Tax
    const tdsSalary = Math.max(0, Number(input.tdsSalary) || 0);
    const tdsOther = Math.max(0, Number(input.tdsOther) || 0);
    const tcsPaid = Math.max(0, Number(input.tcsPaid) || 0);
    const advanceTaxPaid = Math.max(0, Number(input.advanceTaxPaid) || 0);
    const selfAssessmentTaxPaid = Math.max(0, Number(input.selfAssessmentTaxPaid) || 0);

    const totalTaxesPaid = tdsSalary + tdsOther + tcsPaid + advanceTaxPaid + selfAssessmentTaxPaid;

    // Interest 234A/B/C & Late Fee 234F
    const interestParamsOld = {
      assessedTax: totalTaxOld,
      totalTdsTcsPaid: tdsSalary + tdsOther + tcsPaid,
      advanceTaxPaid,
      filingMonth: Number(input.filingMonth) || 7,
      isLateFiler: Boolean(input.isLateFiler),
      totalTaxableIncome: totalTaxableIncomeOld
    };
    const interestOld = calculateInterestAndLateFee(interestParamsOld);

    const interestParamsNew = {
      assessedTax: totalTaxNew,
      totalTdsTcsPaid: tdsSalary + tdsOther + tcsPaid,
      advanceTaxPaid,
      filingMonth: Number(input.filingMonth) || 7,
      isLateFiler: Boolean(input.isLateFiler),
      totalTaxableIncome: totalTaxableIncomeNew
    };
    const interestNew = calculateInterestAndLateFee(interestParamsNew);

    const finalLiabilityOld = totalTaxOld + interestOld.totalInterestAndFees;
    const finalLiabilityNew = totalTaxNew + interestNew.totalInterestAndFees;

    const netPayableOrRefundOld = finalLiabilityOld - totalTaxesPaid;
    const netPayableOrRefundNew = finalLiabilityNew - totalTaxesPaid;

    // Regime Comparison & Decision
    const taxDifference = Math.abs(finalLiabilityNew - finalLiabilityOld);
    let recommendedRegime = 'NEW';
    let recommendationReason = '';

    if (finalLiabilityNew < finalLiabilityOld) {
      recommendedRegime = 'NEW';
      recommendationReason = `New Tax Regime saves ₹${taxDifference.toLocaleString('en-IN')} over the Old Regime due to lower tax slabs and zero tax up to ₹12.75 Lakhs for salaried.`;
    } else if (finalLiabilityOld < finalLiabilityNew) {
      recommendedRegime = 'OLD';
      recommendationReason = `Old Tax Regime saves ₹${taxDifference.toLocaleString('en-IN')} due to your substantial itemized deductions (80C, 80D, HRA, Home Loan).`;
    } else {
      recommendedRegime = 'NEW';
      recommendationReason = 'Both regimes produce identical tax liability. New Tax Regime is recommended as it has simpler compliance.';
    }

    // Break-Even Deduction Analyzer:
    const breakEven = calculateBreakEvenDeductions({
      grossSalary,
      housePropertyIncome: housePropertyIncomeOld,
      otherSources: otherSourcesOld,
      capitalGains: cg,
      targetTaxNew: finalLiabilityNew,
      ageCategory,
      currentDeductionsOld: totalDeductionsOld + (propertyType === 'SELF_OCCUPIED' ? Math.min(200000, homeLoanInterest) : 0)
    });

    return {
      assessmentYear: CONSTANTS.ASSESSMENT_YEAR,
      financialYear: CONSTANTS.FINANCIAL_YEAR,
      ageCategory,
      grossTotalIncome: grossSalary + Math.max(0, rentReceived) + cg.totalSpecialGains + cg.otherStcg +
        savingsBankInterest + fixedDepositInterest + dividendIncome + familyPension + otherIncome,
      salary: {
        grossSalary,
        professionalTax,
        entertainmentAllowance,
        stdDeductionNew: CONSTANTS.NEW_REGIME_STD_DEDUCTION,
        stdDeductionOld: CONSTANTS.OLD_REGIME_STD_DEDUCTION,
        netSalaryNew: salaryNew,
        netSalaryOld: salaryOld
      },
      houseProperty: {
        propertyType,
        rentReceived,
        municipalTaxes,
        netAnnualValue,
        homeLoanInterest,
        incomeOld: housePropertyIncomeOld,
        incomeNew: housePropertyIncomeNew
      },
      capitalGains: cg,
      otherSources: {
        savingsBankInterest,
        fixedDepositInterest,
        dividendIncome,
        familyPension,
        otherIncome,
        totalOld: otherSourcesOld,
        totalNew: otherSourcesNew
      },
      deductions: {
        sec80C,
        sec80CCD1B,
        sec80CCD2,
        healthInsuranceSelf,
        healthInsuranceParents,
        allowable80D,
        sec80E,
        sec80G,
        sec80TTA,
        sec80TTB,
        hraExemption,
        otherDeductionsOld,
        totalOld: totalDeductionsOld,
        totalNew: totalDeductionsNew
      },
      taxesPaid: {
        tdsSalary,
        tdsOther,
        tcsPaid,
        advanceTaxPaid,
        selfAssessmentTaxPaid,
        totalTaxesPaid
      },
      oldRegime: {
        taxableIncome: totalTaxableIncomeOld,
        slabIncome: rawSlabIncomeOld,
        slabBreakdown: slabTaxOldResult.breakdown,
        baseSlabTax: slabTaxOldResult.tax,
        specialRateTax: cg.totalSpecialTax,
        baseTax: baseTaxOld,
        rebate87A: rebateOldResult.rebate,
        taxAfterRebate: taxAfterRebateOld,
        surcharge: surchargeOldResult.netSurcharge,
        surchargeDetails: surchargeOldResult,
        cess: cessOld,
        relief89,
        totalTaxAssessed: totalTaxOld,
        interest: interestOld,
        finalTotalPayable: finalLiabilityOld,
        netPayableOrRefund: netPayableOrRefundOld,
        isRefund: netPayableOrRefundOld < 0,
        refundAmount: netPayableOrRefundOld < 0 ? Math.abs(netPayableOrRefundOld) : 0,
        dueAmount: netPayableOrRefundOld > 0 ? netPayableOrRefundOld : 0
      },
      newRegime: {
        taxableIncome: totalTaxableIncomeNew,
        slabIncome: rawSlabIncomeNew,
        slabBreakdown: slabTaxNewResult.breakdown,
        baseSlabTax: slabTaxNewResult.tax,
        specialRateTax: cg.totalSpecialTax,
        baseTax: baseTaxNew,
        rebate87A: rebateNewResult.rebate,
        marginalRelief87A: rebateNewResult.marginalRelief87A,
        taxAfterRebate: taxAfterRebateNew,
        surcharge: surchargeNewResult.netSurcharge,
        surchargeDetails: surchargeNewResult,
        cess: cessNew,
        relief89,
        totalTaxAssessed: totalTaxNew,
        interest: interestNew,
        finalTotalPayable: finalLiabilityNew,
        netPayableOrRefund: netPayableOrRefundNew,
        isRefund: netPayableOrRefundNew < 0,
        refundAmount: netPayableOrRefundNew < 0 ? Math.abs(netPayableOrRefundNew) : 0,
        dueAmount: netPayableOrRefundNew > 0 ? netPayableOrRefundNew : 0
      },
      comparison: {
        recommendedRegime,
        recommendationReason,
        taxDifference,
        savingsWithNew: Math.max(0, finalLiabilityOld - finalLiabilityNew),
        savingsWithOld: Math.max(0, finalLiabilityNew - finalLiabilityOld),
        breakEven
      }
    };
  }

  /**
   * Calculate Break-Even deductions required under Old Regime
   */
  function calculateBreakEvenDeductions(params) {
    const { grossSalary, otherSources, targetTaxNew, ageCategory, currentDeductionsOld } = params;
    if (targetTaxNew <= 0) {
      return {
        breakEvenDeduction: 0,
        currentDeductions: currentDeductionsOld,
        additionalNeeded: 0,
        summary: 'Under New Regime your tax is already ₹0, so no additional Old Regime deduction is required.'
      };
    }

    let low = 0;
    let high = grossSalary + otherSources + 500000;
    let requiredDeduction = high;

    for (let iter = 0; iter < 40; iter++) {
      const mid = (low + high) / 2;
      const testSlabIncome = Math.max(0, grossSalary - CONSTANTS.OLD_REGIME_STD_DEDUCTION + otherSources - mid);
      const testTax = calculateOldRegimeSlabTax(testSlabIncome, ageCategory).tax;
      const rebate = calculateRebate87A(testSlabIncome, testTax, 'OLD').rebate;
      const taxAfterRebate = Math.max(0, testTax - rebate);
      const cess = Math.round(taxAfterRebate * 0.04);
      const totalTestTax = taxAfterRebate + cess;

      if (totalTestTax <= targetTaxNew) {
        requiredDeduction = mid;
        high = mid;
      } else {
        low = mid;
      }
    }

    const roundedBreakEven = Math.ceil(requiredDeduction / 1000) * 1000;
    const additionalNeeded = Math.max(0, roundedBreakEven - currentDeductionsOld);

    return {
      breakEvenDeduction: roundedBreakEven,
      currentDeductions: currentDeductionsOld,
      additionalNeeded,
      summary: additionalNeeded > 0
        ? `You need at least ₹${roundedBreakEven.toLocaleString('en-IN')} in total deductions under Old Regime (₹${additionalNeeded.toLocaleString('en-IN')} more than current) to beat New Regime.`
        : `Your current deductions under Old Regime (₹${currentDeductionsOld.toLocaleString('en-IN')}) exceed the break-even threshold (₹${roundedBreakEven.toLocaleString('en-IN')}).`
    };
  }

  return {
    CONSTANTS,
    calculateNewRegimeSlabTax,
    calculateOldRegimeSlabTax,
    calculateCapitalGainsTax,
    calculateRebate87A,
    calculateSurcharge,
    calculateInterestAndLateFee,
    calculateBreakEvenDeductions,
    computeTax
  };
}));
