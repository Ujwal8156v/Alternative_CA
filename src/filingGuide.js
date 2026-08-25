/**
 * ITR Portal Filing Guide & Schedule Line-Item Mapper
 * AY 2026-27 (FY 2025-26)
 * Prepares exact schedule mappings for ITR-1 (Sahaj) and ITR-2.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxFilingGuide = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function generateFilingSchedules(taxResult, userProfile = {}) {
    const isNew = taxResult.comparison.recommendedRegime === 'NEW';
    const activeRegime = isNew ? taxResult.newRegime : taxResult.oldRegime;
    const hasCapitalGains = (taxResult.capitalGains.totalSpecialGains > 0 || taxResult.capitalGains.otherStcg > 0);
    const hasMultipleHouseProperties = userProfile.hasMultipleProperties;
    const recommendedItrForm = (hasCapitalGains || hasMultipleHouseProperties || taxResult.grossTotalIncome > 5000000) ? 'ITR-2' : 'ITR-1 (Sahaj)';

    const schedules = [];

    // Schedule 1: General Information / Section 115BAC Opt-Out
    schedules.push({
      id: 'sched_gen',
      name: 'General Information & Regime Selection',
      form: recommendedItrForm,
      fields: [
        { code: 'AY', label: 'Assessment Year', value: '2026-27', note: 'Select from dropdown' },
        { code: 'FILING_SEC', label: 'Filing Section', value: '139(1) - On or before due date', note: 'Or 139(4) if after July 31' },
        {
          code: '115BAC_OPT',
          label: 'Are you opting out of New Tax Regime under Section 115BAC(6)?',
          value: isNew ? 'No (Continue with default New Regime)' : 'Yes (File Form 10-IEA if applicable and opt out)',
          note: isNew ? 'Default regime selected' : 'Opting for Old Regime'
        }
      ]
    });

    // Schedule 2: Schedule S (Salary)
    schedules.push({
      id: 'sched_s',
      name: 'Schedule S - Income from Salary',
      form: recommendedItrForm,
      fields: [
        { code: '1(a)', label: 'Salary as per section 17(1)', value: taxResult.salary.grossSalary, formatted: `₹${taxResult.salary.grossSalary.toLocaleString('en-IN')}` },
        { code: '1(b)', label: 'Value of perquisites as per section 17(2)', value: 0, formatted: '₹0' },
        { code: '1(c)', label: 'Profits in lieu of salary as per section 17(3)', value: 0, formatted: '₹0' },
        { code: '2', label: 'Total Gross Salary (1a + 1b + 1c)', value: taxResult.salary.grossSalary, formatted: `₹${taxResult.salary.grossSalary.toLocaleString('en-IN')}` },
        {
          code: '3(a)',
          label: 'Standard deduction u/s 16(ia)',
          value: isNew ? taxResult.salary.stdDeductionNew : taxResult.salary.stdDeductionOld,
          formatted: `₹${(isNew ? taxResult.salary.stdDeductionNew : taxResult.salary.stdDeductionOld).toLocaleString('en-IN')}`,
          note: isNew ? '₹75,000 for New Regime' : '₹50,000 for Old Regime'
        },
        {
          code: '3(b)',
          label: 'Entertainment allowance u/s 16(ii)',
          value: isNew ? 0 : taxResult.salary.entertainmentAllowance,
          formatted: `₹${(isNew ? 0 : taxResult.salary.entertainmentAllowance).toLocaleString('en-IN')}`
        },
        {
          code: '3(c)',
          label: 'Professional tax / Tax on employment u/s 16(iii)',
          value: isNew ? 0 : taxResult.salary.professionalTax,
          formatted: `₹${(isNew ? 0 : taxResult.salary.professionalTax).toLocaleString('en-IN')}`
        },
        {
          code: '4',
          label: 'Net Income chargeable under Salary head',
          value: isNew ? taxResult.salary.netSalaryNew : taxResult.salary.netSalaryOld,
          formatted: `₹${(isNew ? taxResult.salary.netSalaryNew : taxResult.salary.netSalaryOld).toLocaleString('en-IN')}`
        }
      ]
    });

    // Schedule 3: Schedule HP (House Property)
    schedules.push({
      id: 'sched_hp',
      name: 'Schedule HP - Income from House Property',
      form: recommendedItrForm,
      fields: [
        { code: 'HP_TYPE', label: 'Type of House Property', value: taxResult.houseProperty.propertyType, note: 'Self-Occupied / Let Out' },
        {
          code: '1(a)',
          label: 'Gross Rent Received / Receivable',
          value: taxResult.houseProperty.rentReceived,
          formatted: `₹${taxResult.houseProperty.rentReceived.toLocaleString('en-IN')}`
        },
        {
          code: '1(b)',
          label: 'Taxes paid to local authorities (Municipal Tax)',
          value: taxResult.houseProperty.municipalTaxes,
          formatted: `₹${taxResult.houseProperty.municipalTaxes.toLocaleString('en-IN')}`
        },
        {
          code: '2',
          label: 'Interest payable on borrowed capital u/s 24(b)',
          value: isNew ? (taxResult.houseProperty.propertyType === 'LET_OUT' ? taxResult.houseProperty.homeLoanInterest : 0) : Math.min(200000, taxResult.houseProperty.homeLoanInterest),
          formatted: `₹${(isNew ? (taxResult.houseProperty.propertyType === 'LET_OUT' ? taxResult.houseProperty.homeLoanInterest : 0) : Math.min(200000, taxResult.houseProperty.homeLoanInterest)).toLocaleString('en-IN')}`,
          note: isNew && taxResult.houseProperty.propertyType === 'SELF_OCCUPIED' ? 'Not allowable in New Regime' : 'Allowable up to ₹2 Lakhs'
        },
        {
          code: '3',
          label: 'Income chargeable under House Property head',
          value: isNew ? taxResult.houseProperty.incomeNew : taxResult.houseProperty.incomeOld,
          formatted: `₹${(isNew ? taxResult.houseProperty.incomeNew : taxResult.houseProperty.incomeOld).toLocaleString('en-IN')}`
        }
      ]
    });

    // Schedule 4: Schedule CG (Capital Gains) if applicable
    if (hasCapitalGains) {
      schedules.push({
        id: 'sched_cg',
        name: 'Schedule CG - Capital Gains (ITR-2)',
        form: 'ITR-2',
        fields: [
          {
            code: '111A',
            label: 'Short Term Capital Gains u/s 111A (Equity @ 20%)',
            value: taxResult.capitalGains.stcg111a,
            formatted: `₹${taxResult.capitalGains.stcg111a.toLocaleString('en-IN')}`
          },
          {
            code: '112A',
            label: 'Long Term Capital Gains u/s 112A (Equity @ 12.5% > ₹1.25L)',
            value: taxResult.capitalGains.ltcg112a,
            formatted: `₹${taxResult.capitalGains.ltcg112a.toLocaleString('en-IN')}`,
            note: `Taxable portion: ₹${taxResult.capitalGains.ltcg112aTaxable.toLocaleString('en-IN')}`
          },
          {
            code: 'OTHER_LTCG',
            label: 'Other Long Term Capital Gains (@ 12.5%)',
            value: taxResult.capitalGains.otherLtcg,
            formatted: `₹${taxResult.capitalGains.otherLtcg.toLocaleString('en-IN')}`
          },
          {
            code: 'OTHER_STCG',
            label: 'Other Short Term Capital Gains (Slab Rate)',
            value: taxResult.capitalGains.otherStcg,
            formatted: `₹${taxResult.capitalGains.otherStcg.toLocaleString('en-IN')}`
          }
        ]
      });
    }

    // Schedule 5: Schedule OS (Other Sources)
    schedules.push({
      id: 'sched_os',
      name: 'Schedule OS - Income from Other Sources',
      form: recommendedItrForm,
      fields: [
        {
          code: '1(a)',
          label: 'Interest from Savings Bank accounts',
          value: taxResult.otherSources.savingsBankInterest,
          formatted: `₹${taxResult.otherSources.savingsBankInterest.toLocaleString('en-IN')}`
        },
        {
          code: '1(b)',
          label: 'Interest from Fixed / Time Deposits',
          value: taxResult.otherSources.fixedDepositInterest,
          formatted: `₹${taxResult.otherSources.fixedDepositInterest.toLocaleString('en-IN')}`
        },
        {
          code: '1(c)',
          label: 'Dividend Income',
          value: taxResult.otherSources.dividendIncome,
          formatted: `₹${taxResult.otherSources.dividendIncome.toLocaleString('en-IN')}`
        },
        {
          code: '1(d)',
          label: 'Family Pension (after allowable deduction)',
          value: isNew ? Math.max(0, taxResult.otherSources.familyPension - 25000) : Math.max(0, taxResult.otherSources.familyPension - 15000),
          formatted: `₹${(isNew ? Math.max(0, taxResult.otherSources.familyPension - 25000) : Math.max(0, taxResult.otherSources.familyPension - 15000)).toLocaleString('en-IN')}`
        },
        {
          code: '2',
          label: 'Total Income from Other Sources',
          value: isNew ? taxResult.otherSources.totalNew : taxResult.otherSources.totalOld,
          formatted: `₹${(isNew ? taxResult.otherSources.totalNew : taxResult.otherSources.totalOld).toLocaleString('en-IN')}`
        }
      ]
    });

    // Schedule 6: Schedule VIA (Deductions)
    schedules.push({
      id: 'sched_via',
      name: 'Schedule VIA - Deductions under Chapter VI-A',
      form: recommendedItrForm,
      fields: isNew ? [
        {
          code: '80CCD(2)',
          label: 'Employer contribution to NPS u/s 80CCD(2)',
          value: taxResult.deductions.sec80CCD2,
          formatted: `₹${taxResult.deductions.sec80CCD2.toLocaleString('en-IN')}`,
          note: 'Allowed under New Regime'
        },
        {
          code: 'TOTAL_VIA',
          label: 'Total Deductions under Chapter VI-A (New Regime)',
          value: taxResult.deductions.totalNew,
          formatted: `₹${taxResult.deductions.totalNew.toLocaleString('en-IN')}`
        }
      ] : [
        { code: '80C', label: 'Life insurance, PF, ELSS, tuition fees (Max ₹1.5L)', value: taxResult.deductions.sec80C, formatted: `₹${taxResult.deductions.sec80C.toLocaleString('en-IN')}` },
        { code: '80CCD(1B)', label: 'NPS - Self contribution (Max ₹50,000)', value: taxResult.deductions.sec80CCD1B, formatted: `₹${taxResult.deductions.sec80CCD1B.toLocaleString('en-IN')}` },
        { code: '80CCD(2)', label: 'Employer contribution to NPS', value: taxResult.deductions.sec80CCD2, formatted: `₹${taxResult.deductions.sec80CCD2.toLocaleString('en-IN')}` },
        { code: '80D', label: 'Health Insurance premium', value: taxResult.deductions.allowable80D, formatted: `₹${taxResult.deductions.allowable80D.toLocaleString('en-IN')}` },
        { code: '80E', label: 'Interest on higher education loan', value: taxResult.deductions.sec80E, formatted: `₹${taxResult.deductions.sec80E.toLocaleString('en-IN')}` },
        { code: '80G', label: 'Donations to charitable funds', value: taxResult.deductions.sec80G, formatted: `₹${taxResult.deductions.sec80G.toLocaleString('en-IN')}` },
        {
          code: taxResult.ageCategory === 'GENERAL' ? '80TTA' : '80TTB',
          label: taxResult.ageCategory === 'GENERAL' ? 'Interest on savings accounts (Max ₹10,000)' : 'Interest on deposits for Senior Citizens (Max ₹50,000)',
          value: taxResult.ageCategory === 'GENERAL' ? taxResult.deductions.sec80TTA : taxResult.deductions.sec80TTB,
          formatted: `₹${(taxResult.ageCategory === 'GENERAL' ? taxResult.deductions.sec80TTA : taxResult.deductions.sec80TTB).toLocaleString('en-IN')}`
        },
        { code: 'TOTAL_VIA', label: 'Total Deductions under Chapter VI-A (Old Regime)', value: taxResult.deductions.totalOld, formatted: `₹${taxResult.deductions.totalOld.toLocaleString('en-IN')}` }
      ]
    });

    // Schedule 7: Part B - TI & TTI (Computation of Total Income & Tax)
    schedules.push({
      id: 'sched_tti',
      name: 'Part B - TI & TTI (Tax Computation & Summary)',
      form: recommendedItrForm,
      fields: [
        { code: 'TI_GROSS', label: 'Gross Total Income', value: taxResult.grossTotalIncome, formatted: `₹${taxResult.grossTotalIncome.toLocaleString('en-IN')}` },
        { code: 'TI_TOTAL', label: 'Total Taxable Income', value: activeRegime.taxableIncome, formatted: `₹${activeRegime.taxableIncome.toLocaleString('en-IN')}` },
        { code: 'TTI_BASE', label: 'Tax at normal rates', value: activeRegime.baseSlabTax, formatted: `₹${activeRegime.baseSlabTax.toLocaleString('en-IN')}` },
        { code: 'TTI_SPECIAL', label: 'Tax at special rates (Capital Gains)', value: activeRegime.specialRateTax, formatted: `₹${activeRegime.specialRateTax.toLocaleString('en-IN')}` },
        { code: 'TTI_87A', label: 'Rebate u/s 87A', value: activeRegime.rebate87A, formatted: `₹${activeRegime.rebate87A.toLocaleString('en-IN')}` },
        { code: 'TTI_SURCHARGE', label: 'Surcharge (after marginal relief)', value: activeRegime.surcharge, formatted: `₹${activeRegime.surcharge.toLocaleString('en-IN')}` },
        { code: 'TTI_CESS', label: 'Health and Education Cess @ 4%', value: activeRegime.cess, formatted: `₹${activeRegime.cess.toLocaleString('en-IN')}` },
        { code: 'TTI_TOTAL_TAX', label: 'Total Tax Assessed', value: activeRegime.totalTaxAssessed, formatted: `₹${activeRegime.totalTaxAssessed.toLocaleString('en-IN')}` },
        { code: 'TTI_INTEREST_234A', label: 'Interest u/s 234A', value: activeRegime.interest.interest234A, formatted: `₹${activeRegime.interest.interest234A.toLocaleString('en-IN')}` },
        { code: 'TTI_INTEREST_234B', label: 'Interest u/s 234B', value: activeRegime.interest.interest234B, formatted: `₹${activeRegime.interest.interest234B.toLocaleString('en-IN')}` },
        { code: 'TTI_INTEREST_234C', label: 'Interest u/s 234C', value: activeRegime.interest.interest234C, formatted: `₹${activeRegime.interest.interest234C.toLocaleString('en-IN')}` },
        { code: 'TTI_FEE_234F', label: 'Late Fee u/s 234F', value: activeRegime.interest.lateFee234F, formatted: `₹${activeRegime.interest.lateFee234F.toLocaleString('en-IN')}` },
        { code: 'TTI_TOTAL_LIAB', label: 'Total Tax, Interest & Fee Payable', value: activeRegime.finalTotalPayable, formatted: `₹${activeRegime.finalTotalPayable.toLocaleString('en-IN')}` },
        { code: 'TTI_TAXES_PAID', label: 'Total Taxes Paid (TDS + TCS + Advance Tax)', value: taxResult.taxesPaid.totalTaxesPaid, formatted: `₹${taxResult.taxesPaid.totalTaxesPaid.toLocaleString('en-IN')}` },
        {
          code: activeRegime.isRefund ? 'TTI_REFUND' : 'TTI_PAYABLE',
          label: activeRegime.isRefund ? 'Amount Refundable (Refund)' : 'Net Amount Payable',
          value: activeRegime.isRefund ? activeRegime.refundAmount : activeRegime.dueAmount,
          formatted: `₹${(activeRegime.isRefund ? activeRegime.refundAmount : activeRegime.dueAmount).toLocaleString('en-IN')}`,
          highlight: true
        }
      ]
    });

    return {
      recommendedItrForm,
      recommendedRegime: taxResult.comparison.recommendedRegime,
      schedules
    };
  }

  const STEP_BY_STEP_INSTRUCTIONS = [
    {
      step: 1,
      title: 'Log in to the Income Tax e-Filing Portal',
      description: 'Visit https://eportal.incometax.gov.in and log in using your PAN and password / Aadhaar OTP.'
    },
    {
      step: 2,
      title: 'Navigate to File Income Tax Return',
      description: 'Go to e-File > Income Tax Returns > File Income Tax Return. Select Assessment Year as "AY 2026-27" and Filing Status as "Individual".'
    },
    {
      step: 3,
      title: 'Select Recommended ITR Form',
      description: 'Select ITR-1 (Sahaj) if you have salary, 1 house property, and other sources (income <= ₹50 Lakhs), or ITR-2 if you have capital gains or multiple properties.'
    },
    {
      step: 4,
      title: 'Choose Tax Regime (Section 115BAC)',
      description: 'New Tax Regime is the default. If Old Tax Regime is cheaper for you, opt "Yes" to opt-out and file Form 10-IEA if applicable.'
    },
    {
      step: 5,
      title: 'Fill Schedules using TaxEase India Copy Tool',
      description: 'Use the 1-click "Copy for Portal" button beside each schedule item in this summary and paste or verify against pre-filled data on the portal.'
    },
    {
      step: 6,
      title: 'Pay Outstanding Tax (if Net Payable > 0)',
      description: 'If you have tax due, click "Pay Now" via e-Pay Tax before proceeding. Enter the Challan BSR code and CRN in the IT Schedule.'
    },
    {
      step: 7,
      title: 'Preview and E-Verify',
      description: 'Preview the generated return, check all schedule figures, and e-verify immediately using Aadhaar OTP (or Net Banking) to complete filing!'
    }
  ];

  return {
    generateFilingSchedules,
    STEP_BY_STEP_INSTRUCTIONS
  };
}));
