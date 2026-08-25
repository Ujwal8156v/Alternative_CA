/**
 * Fiscal Integrity & Tax Profile Validator
 * AY 2026-27
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxValidator = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const TAN_REGEX = /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/;

  function validatePAN(pan) {
    if (!pan) return { valid: false, message: 'PAN is required.' };
    const clean = pan.trim().toUpperCase();
    if (!PAN_REGEX.test(clean)) {
      return { valid: false, message: 'Invalid PAN format. Must be 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F).' };
    }
    return { valid: true, pan: clean };
  }

  function validateTAN(tan) {
    if (!tan) return { valid: true, tan: '' }; // TAN optional if not salaried
    const clean = tan.trim().toUpperCase();
    if (!TAN_REGEX.test(clean)) {
      return { valid: false, message: 'Invalid TAN format. Must be 4 letters, 5 digits, 1 letter (e.g. DELA12345B).' };
    }
    return { valid: true, tan: clean };
  }

  /**
   * Validate user input fields for fiscal integrity, legal limits, and potential errors
   */
  function validateProfile(profile = {}) {
    const errors = [];
    const warnings = [];
    const notices = [];

    // 1. Identification
    if (profile.pan) {
      const panCheck = validatePAN(profile.pan);
      if (!panCheck.valid) errors.push({ field: 'pan', message: panCheck.message });
    }

    // 2. Gross Salary & TDS
    const grossSalary = Number(profile.grossSalary) || 0;
    const tdsSalary = Number(profile.tdsSalary) || 0;

    if (grossSalary < 0) {
      errors.push({ field: 'grossSalary', message: 'Gross salary cannot be negative.' });
    }

    if (tdsSalary < 0) {
      errors.push({ field: 'tdsSalary', message: 'TDS cannot be negative.' });
    }

    if (grossSalary > 0 && tdsSalary > grossSalary) {
      errors.push({ field: 'tdsSalary', message: 'TDS on salary (₹' + tdsSalary.toLocaleString('en-IN') + ') cannot exceed Gross Salary (₹' + grossSalary.toLocaleString('en-IN') + ').' });
    }

    // 3. Deduction Limit Violations (Chapter VI-A)
    const sec80C = Number(profile.sec80C) || 0;
    if (sec80C > 150000) {
      warnings.push({
        field: 'sec80C',
        message: `Section 80C entered is ₹${sec80C.toLocaleString('en-IN')}. The statutory maximum deduction under Section 80CCE is capped at ₹1,50,000.`
      });
    }

    const sec80CCD1B = Number(profile.sec80CCD1B) || 0;
    if (sec80CCD1B > 50000) {
      warnings.push({
        field: 'sec80CCD1B',
        message: `NPS (Self) under 80CCD(1B) is ₹${sec80CCD1B.toLocaleString('en-IN')}. Statutory limit is ₹50,000.`
      });
    }

    // 80D
    const healthSelf = Number(profile.healthInsuranceSelf) || 0;
    const isSeniorSelf = profile.ageCategory && profile.ageCategory !== 'GENERAL';
    const limitSelf80D = isSeniorSelf ? 50000 : 25000;
    if (healthSelf > limitSelf80D) {
      warnings.push({
        field: 'healthInsuranceSelf',
        message: `Health insurance (Self/Family) entered is ₹${healthSelf.toLocaleString('en-IN')}. Maximum allowable under 80D is ₹${limitSelf80D.toLocaleString('en-IN')}.`
      });
    }

    const healthParents = Number(profile.healthInsuranceParents) || 0;
    const isSeniorParents = Boolean(profile.isSeniorParents);
    const limitParents80D = isSeniorParents ? 50000 : 25000;
    if (healthParents > limitParents80D) {
      warnings.push({
        field: 'healthInsuranceParents',
        message: `Health insurance (Parents) entered is ₹${healthParents.toLocaleString('en-IN')}. Maximum allowable under 80D is ₹${limitParents80D.toLocaleString('en-IN')}.`
      });
    }

    // Section 24(b) Home Loan
    const homeLoanInterest = Number(profile.homeLoanInterest) || 0;
    const propertyType = profile.propertyType || 'SELF_OCCUPIED';
    if (propertyType === 'SELF_OCCUPIED' && homeLoanInterest > 200000) {
      warnings.push({
        field: 'homeLoanInterest',
        message: `Home loan interest on Self-Occupied property is capped at ₹2,00,000 loss under Section 24(b).`
      });
    }

    // 4. AIS vs Form 16 Cross-Check
    if (profile.aisData && profile.form16Data) {
      const aisSalary = Number(profile.aisData.salaryGross) || 0;
      const f16Salary = Number(profile.form16Data.grossSalary) || 0;
      if (aisSalary > 0 && f16Salary > 0 && Math.abs(aisSalary - f16Salary) > 1000) {
        warnings.push({
          field: 'discrepancySalary',
          message: `Form 16 Salary (₹${f16Salary.toLocaleString('en-IN')}) differs from AIS reported salary (₹${aisSalary.toLocaleString('en-IN')}). Ensure all employer income is accounted for.`
        });
      }

      // Check if AIS reports bank interest or dividends that user omitted
      const aisInterest = (Number(profile.aisData.savingsInterest) || 0) + (Number(profile.aisData.fdInterest) || 0);
      const userInterest = (Number(profile.savingsBankInterest) || 0) + (Number(profile.fixedDepositInterest) || 0);
      if (aisInterest > 0 && userInterest === 0) {
        warnings.push({
          field: 'discrepancyInterest',
          message: `AIS indicates ₹${aisInterest.toLocaleString('en-IN')} in interest income from banks, but ₹0 is entered in your profile. Omission may trigger an automated notice.`
        });
      }

      const aisDividend = Number(profile.aisData.dividendIncome) || 0;
      const userDividend = Number(profile.dividendIncome) || 0;
      if (aisDividend > 0 && userDividend === 0) {
        warnings.push({
          field: 'discrepancyDividend',
          message: `AIS records ₹${aisDividend.toLocaleString('en-IN')} in dividend income. Don't forget to include this under Income from Other Sources.`
        });
      }

      // Check TDS in 26AS/AIS vs Claimed TDS
      const aisTds = Number(profile.aisData.totalTds) || 0;
      const userTds = (Number(profile.tdsSalary) || 0) + (Number(profile.tdsOther) || 0);
      if (aisTds > 0 && userTds > 0 && Math.abs(aisTds - userTds) > 500) {
        notices.push({
          field: 'tdsMismatch',
          message: `Total TDS in profile (₹${userTds.toLocaleString('en-IN')}) differs from AIS/26AS recorded TDS (₹${aisTds.toLocaleString('en-IN')}). You can only claim TDS matching portal records.`
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      notices
    };
  }

  return {
    validatePAN,
    validateTAN,
    validateProfile
  };
}));
