/**
 * Sample Personas & Demo Presets for AY 2026-27
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxPresets = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PRESETS = [
    {
      id: 'salaried_zero_tax',
      name: 'Salaried Professional (Zero Tax u/s 87A)',
      tagline: 'Gross ₹12.5L - Pays ₹0 tax under New Regime',
      description: 'Salaried employee with ₹12,50,000 gross salary and ₹25,000 savings interest. Standard deduction of ₹75,000 brings taxable income to ₹12,00,000, fully eligible for 100% 87A rebate!',
      data: {
        pan: 'ABCDE1234F',
        tan: 'MUMB12345A',
        employerName: 'Acme Technologies Pvt Ltd',
        ageCategory: 'GENERAL',
        grossSalary: 1250000,
        professionalTax: 2500,
        propertyType: 'SELF_OCCUPIED',
        homeLoanInterest: 0,
        rentReceived: 0,
        savingsBankInterest: 25000,
        fixedDepositInterest: 0,
        dividendIncome: 0,
        familyPension: 0,
        otherIncome: 0,
        capitalGains: { ltcg112a: 0, stcg111a: 0, otherLtcg: 0, otherStcg: 0 },
        sec80C: 150000,
        sec80CCD1B: 0,
        sec80CCD2: 0,
        healthInsuranceSelf: 20000,
        healthInsuranceParents: 0,
        sec80E: 0,
        sec80G: 0,
        hraExemption: 0,
        tdsSalary: 0,
        tdsOther: 0,
        advanceTaxPaid: 0
      }
    },
    {
      id: 'tech_lead_investments',
      name: 'Senior Tech Lead (RSUs & Home Loan)',
      tagline: 'Gross ₹32L + ₹2.5L LTCG + Home Loan & 80C/80D',
      description: 'High-earning software engineer with ₹32,00,000 salary, ₹2,50,000 LTCG on equity mutual funds, ₹1,20,000 STCG, ₹2,00,000 home loan interest, and maxed 80C, 80CCD(1B), 80D.',
      data: {
        pan: 'BNZPT8941K',
        tan: 'BLRE98765C',
        employerName: 'CloudScale Systems India Ltd',
        ageCategory: 'GENERAL',
        grossSalary: 3200000,
        professionalTax: 2500,
        propertyType: 'SELF_OCCUPIED',
        homeLoanInterest: 200000,
        rentReceived: 0,
        savingsBankInterest: 18000,
        fixedDepositInterest: 45000,
        dividendIncome: 35000,
        familyPension: 0,
        otherIncome: 0,
        capitalGains: {
          ltcg112a: 250000,
          stcg111a: 120000,
          otherLtcg: 0,
          otherStcg: 0
        },
        sec80C: 150000,
        sec80CCD1B: 50000,
        sec80CCD2: 120000,
        healthInsuranceSelf: 25000,
        healthInsuranceParents: 40000,
        isSeniorParents: true,
        sec80E: 0,
        sec80G: 25000,
        hraExemption: 0,
        tdsSalary: 450000,
        tdsOther: 8000,
        advanceTaxPaid: 50000
      }
    },
    {
      id: 'senior_citizen_pensioner',
      name: 'Retired Senior Citizen (Pension & FDs)',
      tagline: 'Age 68 | ₹8.5L Pension + ₹2.4L Interest Income',
      description: 'Retired government officer with ₹8,50,000 pension, ₹2,40,000 in bank fixed deposit interest, claiming 80TTB interest deduction and 80D senior health insurance.',
      data: {
        pan: 'CGHPS6543M',
        tan: 'DELC54321D',
        employerName: 'Central Pension Processing Cell',
        ageCategory: 'SENIOR',
        grossSalary: 850000,
        professionalTax: 0,
        propertyType: 'SELF_OCCUPIED',
        homeLoanInterest: 0,
        rentReceived: 0,
        savingsBankInterest: 35000,
        fixedDepositInterest: 205000,
        dividendIncome: 12000,
        familyPension: 0,
        otherIncome: 0,
        capitalGains: { ltcg112a: 0, stcg111a: 0, otherLtcg: 0, otherStcg: 0 },
        sec80C: 150000,
        sec80CCD1B: 0,
        sec80CCD2: 0,
        healthInsuranceSelf: 45000,
        healthInsuranceParents: 0,
        sec80E: 0,
        sec80G: 10000,
        hraExemption: 0,
        tdsSalary: 35000,
        tdsOther: 24000,
        advanceTaxPaid: 0
      }
    },
    {
      id: 'consultant_multisource',
      name: 'Independent Consultant / Landlord',
      tagline: '₹18L Salary/Consulting + Rental Income + Stocks',
      description: 'Professional with let-out property generating rental income, mutual fund redemptions, and moderate deductions.',
      data: {
        pan: 'DKLPA4321R',
        tan: 'HYDE11223F',
        employerName: 'Fintech Solutions LLP',
        ageCategory: 'GENERAL',
        grossSalary: 1800000,
        professionalTax: 2500,
        propertyType: 'LET_OUT',
        rentReceived: 360000,
        municipalTaxes: 20000,
        homeLoanInterest: 180000,
        savingsBankInterest: 22000,
        fixedDepositInterest: 60000,
        dividendIncome: 25000,
        familyPension: 0,
        otherIncome: 0,
        capitalGains: {
          ltcg112a: 180000,
          stcg111a: 90000,
          otherLtcg: 0,
          otherStcg: 0
        },
        sec80C: 150000,
        sec80CCD1B: 50000,
        sec80CCD2: 0,
        healthInsuranceSelf: 25000,
        healthInsuranceParents: 30000,
        isSeniorParents: true,
        sec80E: 40000,
        sec80G: 0,
        hraExemption: 0,
        tdsSalary: 180000,
        tdsOther: 15000,
        advanceTaxPaid: 30000
      }
    }
  ];

  const MOCK_FORM16_TEXT = `
PART B (Annexure)
Certificate under section 203 of the Income-tax Act, 1961 for tax deducted at source
Assessment Year: 2026-27 | Financial Year: 2025-26
Name of Employer: CloudScale Systems India Ltd
PAN of Employer: AAACC1234D | TAN of Employer: BLRE98765C
Name of Employee: Rohan Sharma | PAN of Employee: BNZPT8941K

1. Gross Salary:
   (a) Salary as per section 17(1): ₹32,00,000
   (b) Value of perquisites u/s 17(2): ₹0
   (c) Profits in lieu of salary u/s 17(3): ₹0
   Total: ₹32,00,000

2. Deductions under section 16:
   (a) Standard deduction u/s 16(ia): ₹75,000
   (b) Tax on employment u/s 16(iii): ₹2,500

3. Total amount of other income reported by employee:
   (a) Interest on Housing Loan u/s 24(b): ₹2,00,000

4. Deductions under Chapter VI-A:
   (a) Section 80C (PF/ELSS/Life Insurance): ₹1,50,000
   (b) Section 80CCD(1B) (NPS Self): ₹50,000
   (c) Section 80CCD(2) (NPS Employer): ₹1,20,000
   (d) Section 80D (Health Insurance): ₹25,000

5. Total Tax Deducted at Source (TDS): ₹4,50,000
`;

  const MOCK_AIS_JSON = {
    pan: "BNZPT8941K",
    assessmentYear: "2026-27",
    financialYear: "2025-26",
    details: [
      { code: "SFT-001", infoCode: "SALARY", description: "Salary from CloudScale Systems India Ltd", amount: 3200000, tds: 450000 },
      { code: "SFT-005", infoCode: "INT-SAV", description: "Interest from HDFC Bank Savings Account", amount: 18000, tds: 0 },
      { code: "SFT-006", infoCode: "INT-TD", description: "Interest from ICICI Bank Fixed Deposit", amount: 45000, tds: 4500 },
      { code: "SFT-015", infoCode: "DIV", description: "Dividend from Infosys & TCS", amount: 35000, tds: 3500 },
      { code: "SFT-017", infoCode: "112A", description: "Sale of Equity Shares / Mutual Funds (LTCG)", amount: 250000, tds: 0 },
      { code: "SFT-018", infoCode: "111A", description: "Sale of Equity Shares (STCG)", amount: 120000, tds: 0 }
    ]
  };

  return {
    PRESETS,
    MOCK_FORM16_TEXT,
    MOCK_AIS_JSON
  };
}));
