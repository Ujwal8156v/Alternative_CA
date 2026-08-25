/**
 * Form 16 and AIS Privacy-First Client-Side Parser
 * AY 2026-27 (FY 2025-26)
 * Processes all documents locally without network requests.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.TaxParsers = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Parse Form 16 text or JSON payload
   */
  function parseForm16(content) {
    if (!content) return null;

    if (typeof content === 'object') {
      return normalizeForm16Json(content);
    }

    const text = String(content).trim();
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const json = JSON.parse(text);
        return normalizeForm16Json(json);
      } catch (e) {
        // Fall back to regex text parsing
      }
    }

    return parseForm16PlainText(text);
  }

  function normalizeForm16Json(json) {
    const res = {
      source: 'Form 16 (JSON)',
      pan: (json.employeePan || json.pan || '').trim().toUpperCase(),
      tan: (json.employerTan || json.tan || '').trim().toUpperCase(),
      employerName: json.employerName || json.employer || '',
      employeeName: json.employeeName || json.name || '',
      grossSalary: Number(json.grossSalary || json.salarySec17_1 || json.salaryAsPerSec17_1 || 0),
      perquisites: Number(json.perquisites || json.salarySec17_2 || 0),
      profitsInLieu: Number(json.profitsInLieu || json.salarySec17_3 || 0),
      exemptionsSec10: Number(json.exemptionsSec10 || json.hraExemption || 0),
      standardDeduction: Number(json.standardDeduction || json.sec16ia || 75000),
      professionalTax: Number(json.professionalTax || json.sec16iii || 0),
      sec80C: Number(json.sec80C || json.deductions80C || 0),
      sec80CCD1B: Number(json.sec80CCD1B || json.npsSelf || 0),
      sec80CCD2: Number(json.sec80CCD2 || json.npsEmployer || 0),
      healthInsuranceSelf: Number(json.healthInsuranceSelf || json.sec80D || 0),
      healthInsuranceParents: Number(json.healthInsuranceParents || 0),
      sec80E: Number(json.sec80E || 0),
      sec80G: Number(json.sec80G || 0),
      sec80TTA: Number(json.sec80TTA || 0),
      homeLoanInterest: Number(json.homeLoanInterest || json.sec24b || 0),
      tdsSalary: Number(json.tdsSalary || json.totalTdsDeducted || json.tdsDeposited || 0),
      raw: json
    };

    if (res.grossSalary === 0 && (res.perquisites > 0 || res.profitsInLieu > 0)) {
      res.grossSalary = res.perquisites + res.profitsInLieu;
    }

    return res;
  }

  function parseForm16PlainText(text) {
    const res = {
      source: 'Form 16 (Text/PDF Extract)',
      pan: '',
      tan: '',
      employerName: '',
      employeeName: '',
      grossSalary: 0,
      perquisites: 0,
      profitsInLieu: 0,
      exemptionsSec10: 0,
      standardDeduction: 75000,
      professionalTax: 0,
      sec80C: 0,
      sec80CCD1B: 0,
      sec80CCD2: 0,
      healthInsuranceSelf: 0,
      healthInsuranceParents: 0,
      sec80E: 0,
      sec80G: 0,
      sec80TTA: 0,
      homeLoanInterest: 0,
      tdsSalary: 0,
      rawText: text
    };

    // Employee PAN regex extraction prioritizing "PAN of Employee"
    const employeePanMatch = text.match(/(?:PAN\s*of\s*(?:the\s*)?Employee|Employee\s*PAN)\s*[:=-]?\s*([A-Z]{5}[0-9]{4}[A-Z]{1})/i);
    if (employeePanMatch && employeePanMatch[1]) {
      res.pan = employeePanMatch[1].toUpperCase();
    } else {
      const allPanMatches = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/g);
      if (allPanMatches && allPanMatches.length > 0) {
        // If two PANs (Employer + Employee), usually second is employee
        res.pan = (allPanMatches.length > 1 ? allPanMatches[1] : allPanMatches[0]).toUpperCase();
      }
    }

    const tanMatch = text.match(/(?:TAN\s*of\s*(?:the\s*)?Deductor|TAN\s*of\s*(?:the\s*)?Employer|Employer\s*TAN|TAN)\s*[:=-]?\s*([A-Z]{4}[0-9]{5}[A-Z]{1})/i) ||
      text.match(/[A-Z]{4}[0-9]{5}[A-Z]{1}/);
    if (tanMatch) res.tan = (tanMatch[1] || tanMatch[0]).toUpperCase();

    // Numbers search
    const parseNum = (regex) => {
      const match = text.match(regex);
      if (match && match[1]) {
        const clean = match[1].replace(/,/g, '').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    res.grossSalary = parseNum(/(?:Gross\s*Salary|Salary\s*as\s*per\s*section\s*17\(1\)|Total\s*Gross\s*Salary)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i) ||
      parseNum(/(?:17\(1\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);

    res.perquisites = parseNum(/(?:Value\s*of\s*perquisites|17\(2\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.profitsInLieu = parseNum(/(?:Profits\s*in\s*lieu\s*of\s*salary|17\(3\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.standardDeduction = parseNum(/(?:Standard\s*Deduction\s*u\/s\s*16\(ia\)|16\(ia\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i) || 75000;
    res.professionalTax = parseNum(/(?:Tax\s*on\s*employment|Professional\s*Tax|16\(iii\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.sec80C = parseNum(/(?:80C|Section\s*80C|Life\s*Insurance|Provident\s*Fund)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.sec80CCD1B = parseNum(/(?:80CCD\(1B\)|NPS\s*Self)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.sec80CCD2 = parseNum(/(?:80CCD\(2\)|NPS\s*Employer)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.healthInsuranceSelf = parseNum(/(?:80D|Health\s*Insurance|Medical\s*Insurance)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.homeLoanInterest = parseNum(/(?:Interest\s*on\s*Housing\s*Loan|Section\s*24\(b\)|24\(b\))\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.tdsSalary = parseNum(/(?:Total\s*tax\s*deducted|Tax\s*deducted\s*at\s*source|TDS\s*Deducted|TDS\s*Paid)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);

    return res;
  }

  /**
   * Parse AIS (Annual Information Statement) JSON or Text
   */
  function parseAIS(content) {
    if (!content) return null;

    if (typeof content === 'object') {
      return normalizeAisJson(content);
    }

    const text = String(content).trim();
    if (text.startsWith('{') && text.endsWith('}')) {
      try {
        const json = JSON.parse(text);
        return normalizeAisJson(json);
      } catch (e) {
        // Fall back to regex
      }
    }

    return parseAisPlainText(text);
  }

  function normalizeAisJson(json) {
    let salaryGross = Number(json.salaryGross || json.salary || 0);
    let savingsInterest = Number(json.savingsInterest || json.savingsBankInterest || 0);
    let fdInterest = Number(json.fdInterest || json.fixedDepositInterest || json.timeDepositInterest || 0);
    let dividendIncome = Number(json.dividendIncome || json.dividend || 0);
    let ltcg112a = Number(json.ltcg112a || json.equityLtcg || 0);
    let stcg111a = Number(json.stcg111a || json.equityStcg || 0);
    let otherLtcg = Number(json.otherLtcg || 0);
    let otherStcg = Number(json.otherStcg || 0);
    let totalTds = Number(json.totalTds || json.tds || 0);
    let totalTcs = Number(json.totalTcs || json.tcs || 0);

    // If structured AIS schema with "information" or "sftDetails" array
    if (Array.isArray(json.information) || Array.isArray(json.details) || Array.isArray(json.sftDetails)) {
      const items = json.information || json.details || json.sftDetails;
      for (const item of items) {
        const code = (item.infoCode || item.code || '').toUpperCase();
        const amt = Number(item.amount || item.totalAmount || item.value || 0);
        const tds = Number(item.tdsAmount || item.tds || 0);

        totalTds += tds;

        if (code.includes('SALARY') || code === 'SFT-001' || code === 'TDS-192') {
          salaryGross += amt;
        } else if (code.includes('SAVING') || code === 'SFT-005' || code === 'INT-SAV') {
          savingsInterest += amt;
        } else if (code.includes('DEPOSIT') || code === 'SFT-006' || code === 'INT-TD' || code === 'TDS-194A') {
          fdInterest += amt;
        } else if (code.includes('DIVIDEND') || code === 'SFT-015' || code === 'DIV') {
          dividendIncome += amt;
        } else if (code.includes('112A') || code === 'SFT-017') {
          ltcg112a += amt;
        } else if (code.includes('111A') || code === 'SFT-018') {
          stcg111a += amt;
        }
      }
    }

    return {
      source: 'AIS (JSON)',
      pan: (json.pan || '').trim().toUpperCase(),
      salaryGross,
      savingsInterest,
      fdInterest,
      dividendIncome,
      ltcg112a,
      stcg111a,
      otherLtcg,
      otherStcg,
      totalTds,
      totalTcs,
      raw: json
    };
  }

  function parseAisPlainText(text) {
    const res = {
      source: 'AIS (Text Extract)',
      pan: '',
      salaryGross: 0,
      savingsInterest: 0,
      fdInterest: 0,
      dividendIncome: 0,
      ltcg112a: 0,
      stcg111a: 0,
      otherLtcg: 0,
      otherStcg: 0,
      totalTds: 0,
      totalTcs: 0,
      rawText: text
    };

    const panMatch = text.match(/[A-Z]{5}[0-9]{4}[A-Z]{1}/);
    if (panMatch) res.pan = panMatch[0];

    const parseNum = (regex) => {
      const match = text.match(regex);
      if (match && match[1]) {
        const clean = match[1].replace(/,/g, '').trim();
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    res.salaryGross = parseNum(/(?:Salary\s*Receipts|Gross\s*Salary|Income\s*from\s*Salary)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.savingsInterest = parseNum(/(?:Interest\s*from\s*Savings\s*Bank|Savings\s*Interest|SFT-005)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.fdInterest = parseNum(/(?:Interest\s*from\s*Deposit|Time\s*Deposit\s*Interest|FD\s*Interest|SFT-006)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.dividendIncome = parseNum(/(?:Dividend\s*Income|Dividend|SFT-015)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.ltcg112a = parseNum(/(?:Long\s*Term\s*Capital\s*Gain|LTCG\s*112A|Sale\s*of\s*listed\s*shares)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.stcg111a = parseNum(/(?:Short\s*Term\s*Capital\s*Gain|STCG\s*111A)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.totalTds = parseNum(/(?:Total\s*TDS|Tax\s*Deducted\s*at\s*Source|TDS\s*Credit)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);
    res.totalTcs = parseNum(/(?:Total\s*TCS|TCS\s*Credit)\s*[:=-]?\s*₹?\s*([\d,]+(?:\.\d+)?)/i);

    return res;
  }

  return {
    parseForm16,
    parseAIS
  };
}));
