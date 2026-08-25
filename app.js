/**
 * TaxEase India (Alternative CA) - Web Application Controller (AY 2026-27)
 * Author: Ujwal Kumar Behera (@Ujwal8156v)
 * Repository: https://github.com/Ujwal8156v/Alternative_CA
 * Copyright (c) 2026 Alternative_CA
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- STATE ---
  let currentStep = 1;
  let userProfile = {
    pan: '',
    tan: '',
    employerName: '',
    ageCategory: 'GENERAL',
    filingMonth: 7,
    isLateFiler: false,
    grossSalary: 0,
    professionalTax: 0,
    entertainmentAllowance: 0,
    propertyType: 'SELF_OCCUPIED',
    rentReceived: 0,
    municipalTaxes: 0,
    homeLoanInterest: 0,
    capitalGains: {
      ltcg112a: 0,
      stcg111a: 0,
      otherLtcg: 0,
      otherStcg: 0
    },
    savingsBankInterest: 0,
    fixedDepositInterest: 0,
    dividendIncome: 0,
    familyPension: 0,
    otherIncome: 0,
    sec80C: 0,
    sec80CCD1B: 0,
    sec80CCD2: 0,
    healthInsuranceSelf: 0,
    healthInsuranceParents: 0,
    isSeniorParents: false,
    sec80E: 0,
    sec80G: 0,
    hraExemption: 0,
    otherDeductionsOld: 0,
    tdsSalary: 0,
    tdsOther: 0,
    tcsPaid: 0,
    advanceTaxPaid: 0,
    selfAssessmentTaxPaid: 0,
    relief89: 0,
    form16Data: null,
    aisData: null
  };

  let latestTaxResult = null;

  // --- INITIALIZATION ---
  initNavigation();
  initPersonas();
  initDocumentUploads();
  initFormInputs();
  initTestRunner();
  initModalsAndActions();

  // Load default salaried persona initially for a delightful out-of-the-box experience
  loadPersonaById('salaried_zero_tax', false);

  // --- NAVIGATION CONTROLLER ---
  function initNavigation() {
    const stepButtons = document.querySelectorAll('.step-nav-btn');
    stepButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-step'), 10);
        goToStep(target);
      });
    });

    document.querySelectorAll('.btnNextStep').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-target'), 10);
        goToStep(target);
      });
    });

    document.querySelectorAll('.btnPrevStep').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = parseInt(btn.getAttribute('data-target'), 10);
        goToStep(target);
      });
    });

    document.getElementById('btnRunTestsNav').addEventListener('click', () => {
      goToStep(5);
      runBrowserTests();
    });
  }

  function goToStep(stepNumber) {
    currentStep = stepNumber;

    // Update nav active tab
    document.querySelectorAll('.step-nav-btn').forEach(btn => {
      const step = parseInt(btn.getAttribute('data-step'), 10);
      const circle = btn.querySelector('span:first-child');
      if (step === stepNumber) {
        btn.classList.add('tab-active');
        btn.classList.remove('border-transparent', 'text-on-surface-variant');
        if (circle) circle.className = 'w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold';
      } else {
        btn.classList.remove('tab-active');
        btn.classList.add('border-transparent', 'text-on-surface-variant');
        if (circle) circle.className = 'w-5 h-5 rounded-full bg-surface-container-highest text-on-surface text-xs flex items-center justify-center font-bold';
      }
    });

    // Hide all step sections & show target
    document.querySelectorAll('.step-content').forEach(section => {
      section.classList.add('hidden');
    });

    const activeSection = document.getElementById(`step${stepNumber}`);
    if (activeSection) {
      activeSection.classList.remove('hidden');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    if (stepNumber === 3 || stepNumber === 4) {
      renderTaxComputation();
    }
    if (stepNumber === 4) {
      renderSchedules();
    }
  }

  // --- PERSONAS CONTROLLER ---
  function initPersonas() {
    const container = document.getElementById('personasContainer');
    const modalList = document.getElementById('modalPersonasList');
    if (!container || !TaxPresets) return;

    container.innerHTML = '';
    modalList.innerHTML = '';

    TaxPresets.PRESETS.forEach(p => {
      // Home cards
      const card = document.createElement('div');
      card.className = 'p-4 rounded-xl border border-outline-variant bg-white hover:border-primary/60 hover:shadow-md transition cursor-pointer flex flex-col justify-between';
      card.innerHTML = `
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-primary">${p.name}</span>
            <span class="material-symbols-outlined text-sm text-blue-600">person</span>
          </div>
          <p class="text-[11px] text-emerald-800 font-medium mb-1">${p.tagline}</p>
          <p class="text-[11px] text-on-surface-variant line-clamp-2">${p.description}</p>
        </div>
        <button class="mt-3 w-full py-1.5 bg-surface-container-high hover:bg-primary hover:text-white text-primary text-xs font-semibold rounded-lg transition">
          Load Persona
        </button>
      `;
      card.addEventListener('click', () => {
        loadPersonaById(p.id, true);
      });
      container.appendChild(card);

      // Modal list items
      const mItem = document.createElement('div');
      mItem.className = 'p-3 rounded-xl border border-outline-variant hover:bg-surface-container-low transition cursor-pointer flex items-center justify-between';
      mItem.innerHTML = `
        <div>
          <h4 class="text-xs font-bold text-primary">${p.name}</h4>
          <p class="text-[11px] text-on-surface-variant">${p.description}</p>
        </div>
        <button class="px-3 py-1 bg-primary text-white text-xs font-semibold rounded-lg">Select</button>
      `;
      mItem.addEventListener('click', () => {
        loadPersonaById(p.id, true);
        document.getElementById('modalPersona').classList.add('hidden');
      });
      modalList.appendChild(mItem);
    });

    document.getElementById('btnQuickSalariedDemo')?.addEventListener('click', () => {
      loadPersonaById('salaried_zero_tax', true);
    });
  }

  function loadPersonaById(id, notify = true) {
    const persona = TaxPresets.PRESETS.find(p => p.id === id);
    if (!persona) return;

    userProfile = {
      ...userProfile,
      ...persona.data,
      capitalGains: { ...persona.data.capitalGains }
    };

    populateFormFields();
    recalculateTax();

    if (notify) {
      showToast(`Loaded Persona: ${persona.name}`);
      goToStep(2);
    }
  }

  // --- DOCUMENT UPLOAD & PARSER INTEGRATION ---
  function initDocumentUploads() {
    // Form 16 Dropzone & File Input
    const dropzoneF16 = document.getElementById('dropzoneF16');
    const fileInpF16 = document.getElementById('fileInputF16');
    dropzoneF16.addEventListener('click', () => fileInpF16.click());
    fileInpF16.addEventListener('change', (e) => handleFileSelected(e.target.files[0], 'FORM16'));

    dropzoneF16.addEventListener('dragover', (e) => { e.preventDefault(); dropzoneF16.classList.add('bg-blue-50'); });
    dropzoneF16.addEventListener('dragleave', () => { dropzoneF16.classList.remove('bg-blue-50'); });
    dropzoneF16.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneF16.classList.remove('bg-blue-50');
      if (e.dataTransfer.files.length > 0) handleFileSelected(e.dataTransfer.files[0], 'FORM16');
    });

    // AIS Dropzone & File Input
    const dropzoneAIS = document.getElementById('dropzoneAIS');
    const fileInpAIS = document.getElementById('fileInputAIS');
    dropzoneAIS.addEventListener('click', () => fileInpAIS.click());
    fileInpAIS.addEventListener('change', (e) => handleFileSelected(e.target.files[0], 'AIS'));

    dropzoneAIS.addEventListener('dragover', (e) => { e.preventDefault(); dropzoneAIS.classList.add('bg-indigo-50'); });
    dropzoneAIS.addEventListener('dragleave', () => { dropzoneAIS.classList.remove('bg-indigo-50'); });
    dropzoneAIS.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzoneAIS.classList.remove('bg-indigo-50');
      if (e.dataTransfer.files.length > 0) handleFileSelected(e.dataTransfer.files[0], 'AIS');
    });

    // Paste toggles
    document.getElementById('btnTogglePasteF16').addEventListener('click', () => {
      document.getElementById('pasteAreaF16').classList.toggle('hidden');
    });
    document.getElementById('btnTogglePasteAIS').addEventListener('click', () => {
      document.getElementById('pasteAreaAIS').classList.toggle('hidden');
    });

    // Mock Sample Buttons
    document.getElementById('btnSampleF16').addEventListener('click', () => {
      processParsedForm16(TaxParsers.parseForm16(TaxPresets.MOCK_FORM16_TEXT));
      showToast('Loaded Mock Form 16 Text Extract!');
    });
    document.getElementById('btnSampleAIS').addEventListener('click', () => {
      processParsedAIS(TaxParsers.parseAIS(TaxPresets.MOCK_AIS_JSON));
      showToast('Loaded Mock AIS JSON Extract!');
    });

    // Parse pasted text buttons
    document.getElementById('btnParsePasteF16').addEventListener('click', () => {
      const text = document.getElementById('txtPasteF16').value;
      if (!text.trim()) return;
      const res = TaxParsers.parseForm16(text);
      processParsedForm16(res);
      showToast('Parsed pasted Form 16!');
    });

    document.getElementById('btnParsePasteAIS').addEventListener('click', () => {
      const text = document.getElementById('txtPasteAIS').value;
      if (!text.trim()) return;
      const res = TaxParsers.parseAIS(text);
      processParsedAIS(res);
      showToast('Parsed pasted AIS!');
    });
  }

  function handleFileSelected(file, type) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      if (type === 'FORM16') {
        const parsed = TaxParsers.parseForm16(content);
        processParsedForm16(parsed);
        showToast(`Loaded ${file.name} as Form 16!`);
      } else {
        const parsed = TaxParsers.parseAIS(content);
        processParsedAIS(parsed);
        showToast(`Loaded ${file.name} as AIS!`);
      }
    };
    reader.readAsText(file);
  }

  function processParsedForm16(parsed) {
    if (!parsed) return;
    userProfile.form16Data = parsed;
    if (parsed.pan) userProfile.pan = parsed.pan;
    if (parsed.tan) userProfile.tan = parsed.tan;
    if (parsed.employerName) userProfile.employerName = parsed.employerName;
    if (parsed.grossSalary > 0) userProfile.grossSalary = parsed.grossSalary;
    if (parsed.professionalTax > 0) userProfile.professionalTax = parsed.professionalTax;
    if (parsed.sec80C > 0) userProfile.sec80C = parsed.sec80C;
    if (parsed.sec80CCD1B > 0) userProfile.sec80CCD1B = parsed.sec80CCD1B;
    if (parsed.sec80CCD2 > 0) userProfile.sec80CCD2 = parsed.sec80CCD2;
    if (parsed.healthInsuranceSelf > 0) userProfile.healthInsuranceSelf = parsed.healthInsuranceSelf;
    if (parsed.homeLoanInterest > 0) userProfile.homeLoanInterest = parsed.homeLoanInterest;
    if (parsed.tdsSalary > 0) userProfile.tdsSalary = parsed.tdsSalary;

    // Update UI status badge
    const dot = document.getElementById('dotF16');
    const label = document.getElementById('labelF16Status');
    dot.className = 'w-2 h-2 rounded-full bg-emerald-500 inline-block';
    label.innerHTML = `<strong class="text-emerald-700">Parsed:</strong> Gross ₹${parsed.grossSalary.toLocaleString('en-IN')} (PAN: ${parsed.pan || 'N/A'})`;

    populateFormFields();
    recalculateTax();
  }

  function processParsedAIS(parsed) {
    if (!parsed) return;
    userProfile.aisData = parsed;
    if (parsed.pan && !userProfile.pan) userProfile.pan = parsed.pan;
    if (parsed.savingsInterest > 0) userProfile.savingsBankInterest = parsed.savingsInterest;
    if (parsed.fdInterest > 0) userProfile.fixedDepositInterest = parsed.fdInterest;
    if (parsed.dividendIncome > 0) userProfile.dividendIncome = parsed.dividendIncome;
    if (parsed.ltcg112a > 0) userProfile.capitalGains.ltcg112a = parsed.ltcg112a;
    if (parsed.stcg111a > 0) userProfile.capitalGains.stcg111a = parsed.stcg111a;
    if (parsed.totalTds > 0 && userProfile.tdsSalary === 0) userProfile.tdsOther = parsed.totalTds;

    // Update UI status badge
    const dot = document.getElementById('dotAIS');
    const label = document.getElementById('labelAISStatus');
    dot.className = 'w-2 h-2 rounded-full bg-indigo-500 inline-block';
    label.innerHTML = `<strong class="text-indigo-700">Parsed AIS:</strong> Interest: ₹${(parsed.savingsInterest + parsed.fdInterest).toLocaleString('en-IN')}, Div: ₹${parsed.dividendIncome.toLocaleString('en-IN')}`;

    populateFormFields();
    recalculateTax();
  }

  // --- FORM INPUTS BINDING ---
  function initFormInputs() {
    const bindNum = (id, setter) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        setter(Math.max(0, parseFloat(el.value) || 0));
        recalculateTax();
      });
    };

    document.getElementById('inpPAN')?.addEventListener('input', (e) => {
      userProfile.pan = e.target.value.toUpperCase();
      const check = TaxValidator.validatePAN(userProfile.pan);
      const errEl = document.getElementById('errPAN');
      if (!check.valid && userProfile.pan.length > 0) {
        errEl.classList.remove('hidden');
        errEl.innerText = check.message;
      } else {
        errEl.classList.add('hidden');
      }
      recalculateTax();
    });

    document.getElementById('inpAgeCategory')?.addEventListener('change', (e) => {
      userProfile.ageCategory = e.target.value;
      recalculateTax();
    });

    document.getElementById('inpFilingMonth')?.addEventListener('change', (e) => {
      userProfile.filingMonth = parseInt(e.target.value, 10);
      userProfile.isLateFiler = userProfile.filingMonth > 7;
      recalculateTax();
    });

    document.getElementById('inpPropertyType')?.addEventListener('change', (e) => {
      userProfile.propertyType = e.target.value;
      const rentContainer = document.getElementById('containerLetOutRent');
      if (userProfile.propertyType === 'LET_OUT') {
        rentContainer.classList.remove('hidden');
      } else {
        rentContainer.classList.add('hidden');
      }
      recalculateTax();
    });

    document.getElementById('chkSeniorParents')?.addEventListener('change', (e) => {
      userProfile.isSeniorParents = e.target.checked;
      recalculateTax();
    });

    bindNum('inpGrossSalary', (v) => userProfile.grossSalary = v);
    bindNum('inpProfessionalTax', (v) => userProfile.professionalTax = v);
    bindNum('inpHomeLoanInterest', (v) => userProfile.homeLoanInterest = v);
    bindNum('inpRentReceived', (v) => userProfile.rentReceived = v);
    bindNum('inpLtcg112a', (v) => userProfile.capitalGains.ltcg112a = v);
    bindNum('inpStcg111a', (v) => userProfile.capitalGains.stcg111a = v);
    bindNum('inpOtherLtcg', (v) => userProfile.capitalGains.otherLtcg = v);
    bindNum('inpOtherStcg', (v) => userProfile.capitalGains.otherStcg = v);
    bindNum('inpSavingsInterest', (v) => userProfile.savingsBankInterest = v);
    bindNum('inpFdInterest', (v) => userProfile.fixedDepositInterest = v);
    bindNum('inpDividendIncome', (v) => userProfile.dividendIncome = v);
    bindNum('inpSec80C', (v) => userProfile.sec80C = v);
    bindNum('inpSec80CCD1B', (v) => userProfile.sec80CCD1B = v);
    bindNum('inpSec80CCD2', (v) => userProfile.sec80CCD2 = v);
    bindNum('inpHealthSelf', (v) => userProfile.healthInsuranceSelf = v);
    bindNum('inpHealthParents', (v) => userProfile.healthInsuranceParents = v);
    bindNum('inpHraExemption', (v) => userProfile.hraExemption = v);
    bindNum('inpTdsSalary', (v) => userProfile.tdsSalary = v);
    bindNum('inpTdsOther', (v) => userProfile.tdsOther = v);
    bindNum('inpAdvanceTax', (v) => userProfile.advanceTaxPaid = v);
  }

  function populateFormFields() {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };

    setVal('inpPAN', userProfile.pan);
    setVal('inpAgeCategory', userProfile.ageCategory || 'GENERAL');
    setVal('inpFilingMonth', userProfile.filingMonth || 7);
    setVal('inpPropertyType', userProfile.propertyType || 'SELF_OCCUPIED');
    setVal('inpGrossSalary', userProfile.grossSalary || '');
    setVal('inpProfessionalTax', userProfile.professionalTax || '');
    setVal('inpHomeLoanInterest', userProfile.homeLoanInterest || '');
    setVal('inpRentReceived', userProfile.rentReceived || '');
    setVal('inpLtcg112a', userProfile.capitalGains.ltcg112a || '');
    setVal('inpStcg111a', userProfile.capitalGains.stcg111a || '');
    setVal('inpOtherLtcg', userProfile.capitalGains.otherLtcg || '');
    setVal('inpOtherStcg', userProfile.capitalGains.otherStcg || '');
    setVal('inpSavingsInterest', userProfile.savingsBankInterest || '');
    setVal('inpFdInterest', userProfile.fixedDepositInterest || '');
    setVal('inpDividendIncome', userProfile.dividendIncome || '');
    setVal('inpSec80C', userProfile.sec80C || '');
    setVal('inpSec80CCD1B', userProfile.sec80CCD1B || '');
    setVal('inpSec80CCD2', userProfile.sec80CCD2 || '');
    setVal('inpHealthSelf', userProfile.healthInsuranceSelf || '');
    setVal('inpHealthParents', userProfile.healthInsuranceParents || '');
    setVal('inpHraExemption', userProfile.hraExemption || '');
    setVal('inpTdsSalary', userProfile.tdsSalary || '');
    setVal('inpTdsOther', userProfile.tdsOther || '');
    setVal('inpAdvanceTax', userProfile.advanceTaxPaid || '');

    const chkSenior = document.getElementById('chkSeniorParents');
    if (chkSenior) chkSenior.checked = Boolean(userProfile.isSeniorParents);

    const rentContainer = document.getElementById('containerLetOutRent');
    if (userProfile.propertyType === 'LET_OUT') {
      rentContainer?.classList.remove('hidden');
    } else {
      rentContainer?.classList.add('hidden');
    }
  }

  // --- DETERMINISTIC TAX CALCULATION & INTEGRITY EVALUATION ---
  function recalculateTax() {
    latestTaxResult = TaxEngine.computeTax(userProfile);
    const integrity = TaxValidator.validateProfile(userProfile);

    // Update Top / Live Header Widgets
    const isNew = latestTaxResult.comparison.recommendedRegime === 'NEW';
    const minTax = isNew ? latestTaxResult.newRegime.finalTotalPayable : latestTaxResult.oldRegime.finalTotalPayable;
    document.getElementById('headerQuickTax').innerText = `Live Tax: ₹${minTax.toLocaleString('en-IN')} (${isNew ? 'New Regime' : 'Old Regime'})`;

    // Update Step 2 Quick Summary Box
    document.getElementById('quickGrossIncome').innerText = `₹${latestTaxResult.grossTotalIncome.toLocaleString('en-IN')}`;
    document.getElementById('quickDeductions').innerText = `₹${(latestTaxResult.salary.stdDeductionNew + latestTaxResult.deductions.totalNew).toLocaleString('en-IN')} / ₹${(latestTaxResult.salary.stdDeductionOld + latestTaxResult.deductions.totalOld).toLocaleString('en-IN')}`;
    document.getElementById('quickTaxableNew').innerText = `₹${latestTaxResult.newRegime.taxableIncome.toLocaleString('en-IN')}`;
    document.getElementById('quickTaxNew').innerText = `₹${latestTaxResult.newRegime.finalTotalPayable.toLocaleString('en-IN')}`;
    document.getElementById('quickTaxOld').innerText = `₹${latestTaxResult.oldRegime.finalTotalPayable.toLocaleString('en-IN')}`;
    document.getElementById('quickSavings').innerText = `Save ₹${latestTaxResult.comparison.taxDifference.toLocaleString('en-IN')}`;

    const liveBadge = document.getElementById('badgeLiveRegime');
    if (isNew) {
      liveBadge.className = 'px-2 py-0.5 text-xs font-bold rounded bg-emerald-100 text-emerald-800';
      liveBadge.innerText = 'NEW REGIME CHEAPER';
    } else {
      liveBadge.className = 'px-2 py-0.5 text-xs font-bold rounded bg-blue-100 text-blue-800';
      liveBadge.innerText = 'OLD REGIME CHEAPER';
    }

    // Render Integrity Checklist
    const listEl = document.getElementById('quickIntegrityList');
    listEl.innerHTML = '';

    const addCheck = (icon, text, isGood) => {
      const row = document.createElement('div');
      row.className = `flex items-center gap-1.5 ${isGood ? 'text-emerald-700' : 'text-amber-700'}`;
      row.innerHTML = `<span class="material-symbols-outlined text-xs">${icon}</span> <span>${text}</span>`;
      listEl.appendChild(row);
    };

    addCheck(userProfile.pan ? 'check_circle' : 'pending', userProfile.pan ? `PAN: ${userProfile.pan}` : 'PAN not entered', Boolean(userProfile.pan));
    addCheck('check_circle', `Standard Ded: ₹${latestTaxResult.salary.stdDeductionNew.toLocaleString('en-IN')} (New)`, true);
    if (integrity.warnings.length > 0) {
      addCheck('warning', `${integrity.warnings.length} limit/discrepancy warning(s)`, false);
    } else {
      addCheck('check_circle', 'All deduction caps valid', true);
    }

    // Global Banner update if warnings exist
    const banner = document.getElementById('integrityBanner');
    if (integrity.warnings.length > 0 || integrity.errors.length > 0) {
      banner.className = 'mb-6 p-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 text-xs block shadow-sm';
      const items = [...integrity.errors, ...integrity.warnings].map(w => `<li>• ${w.message}</li>`).join('');
      banner.innerHTML = `
        <div class="flex items-start gap-2">
          <span class="material-symbols-outlined text-amber-600 text-lg">warning</span>
          <div>
            <strong class="font-bold">Fiscal Integrity Review:</strong>
            <ul class="mt-1 space-y-0.5">${items}</ul>
          </div>
        </div>
      `;
    } else {
      banner.className = 'hidden';
    }
  }

  // --- STEP 3: COMPARISON VIEW RENDERER ---
  function renderTaxComputation() {
    if (!latestTaxResult) recalculateTax();
    const res = latestTaxResult;
    const isNew = res.comparison.recommendedRegime === 'NEW';

    // 1. Big Recommendation Card
    const recCard = document.getElementById('regimeRecommendationCard');
    recCard.className = `p-6 rounded-2xl shadow-md border ${isNew ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 text-emerald-950' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-950'}`;
    recCard.innerHTML = `
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-2xl ${isNew ? 'text-emerald-700' : 'text-blue-700'}">verified</span>
            <h3 class="text-xl font-extrabold">${isNew ? 'NEW TAX REGIME (Sec 115BAC) IS RECOMMENDED' : 'OLD TAX REGIME IS RECOMMENDED'}</h3>
          </div>
          <p class="text-xs mt-1 max-w-2xl leading-relaxed">${res.comparison.recommendationReason}</p>
        </div>
        <div class="text-right whitespace-nowrap">
          <span class="text-xs uppercase tracking-wider font-semibold opacity-75">You Save</span>
          <div class="text-2xl font-black ${isNew ? 'text-emerald-700' : 'text-blue-800'} mono-num">₹${res.comparison.taxDifference.toLocaleString('en-IN')}</div>
        </div>
      </div>
    `;

    // 2. Break-Even Deduction Box
    const breakEvenCard = document.getElementById('breakEvenCard');
    breakEvenCard.innerHTML = `
      <div>
        <h4 class="text-xs font-bold text-primary flex items-center gap-1.5">
          <span class="material-symbols-outlined text-blue-600 text-base">psychology</span>
          Break-Even Deduction Analyzer (AY 2026-27)
        </h4>
        <p class="text-xs text-on-surface-variant mt-1 max-w-2xl">${res.comparison.breakEven.summary}</p>
      </div>
      <div class="text-right">
        <span class="text-[11px] text-on-surface-variant uppercase font-medium">Break-Even Old Deductions</span>
        <div class="text-base font-bold text-primary mono-num">₹${res.comparison.breakEven.breakEvenDeduction.toLocaleString('en-IN')}</div>
      </div>
    `;

    // 3. New Regime Values
    const nr = res.newRegime;
    document.getElementById('nrGrossIncome').innerText = `₹${res.grossTotalIncome.toLocaleString('en-IN')}`;
    document.getElementById('nr80ccd2').innerText = `-₹${res.deductions.sec80CCD2.toLocaleString('en-IN')}`;
    document.getElementById('nrTaxableIncome').innerText = `₹${nr.taxableIncome.toLocaleString('en-IN')}`;
    document.getElementById('nrBaseSlabTax').innerText = `₹${nr.baseSlabTax.toLocaleString('en-IN')}`;
    document.getElementById('nrSpecialTax').innerText = `₹${nr.specialRateTax.toLocaleString('en-IN')}`;
    document.getElementById('nrRebate87A').innerText = `-₹${nr.rebate87A.toLocaleString('en-IN')}`;
    document.getElementById('nrSurcharge').innerText = `₹${nr.surcharge.toLocaleString('en-IN')}`;
    document.getElementById('nrCess').innerText = `₹${nr.cess.toLocaleString('en-IN')}`;
    document.getElementById('nrAssessedTax').innerText = `₹${nr.totalTaxAssessed.toLocaleString('en-IN')}`;
    document.getElementById('nrInterestFees').innerText = `₹${nr.interest.totalInterestAndFees.toLocaleString('en-IN')}`;
    document.getElementById('nrTaxesPaid').innerText = `-₹${res.taxesPaid.totalTaxesPaid.toLocaleString('en-IN')}`;

    // Render New Regime Slabs Detail
    const nrSlabsEl = document.getElementById('nrSlabDetails');
    nrSlabsEl.innerHTML = '<strong class="block text-primary font-semibold">Slab Tax Computations:</strong>' +
      nr.slabBreakdown.map(s => `
        <div class="flex justify-between text-on-surface-variant">
          <span>${s.slab} (${s.rate}%):</span>
          <span class="mono-num">₹${s.taxableAmount.toLocaleString('en-IN')} → ₹${s.tax.toLocaleString('en-IN')}</span>
        </div>
      `).join('');

    // New Regime Result Box
    const nrBox = document.getElementById('nrFinalResultBox');
    if (nr.isRefund) {
      nrBox.className = 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center';
      nrBox.innerHTML = `
        <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Net Refund Amount</span>
        <div class="text-2xl font-black text-emerald-700 mono-num mt-1">₹${nr.refundAmount.toLocaleString('en-IN')}</div>
        <p class="text-[11px] text-emerald-800 mt-1">To be credited to your verified bank account</p>
      `;
    } else {
      nrBox.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 text-center';
      nrBox.innerHTML = `
        <span class="text-xs font-semibold text-primary uppercase tracking-wider">Net Tax Payable</span>
        <div class="text-2xl font-black text-primary mono-num mt-1">₹${nr.dueAmount.toLocaleString('en-IN')}</div>
        <p class="text-[11px] text-on-surface-variant mt-1">Payable before filing via e-Pay Tax</p>
      `;
    }

    // 4. Old Regime Values
    const or = res.oldRegime;
    document.getElementById('orGrossIncome').innerText = `₹${res.grossTotalIncome.toLocaleString('en-IN')}`;
    document.getElementById('orSec24b').innerText = `-₹${Math.abs(res.houseProperty.incomeOld).toLocaleString('en-IN')}`;
    document.getElementById('orChapterVia').innerText = `-₹${res.deductions.totalOld.toLocaleString('en-IN')}`;
    document.getElementById('orTaxableIncome').innerText = `₹${or.taxableIncome.toLocaleString('en-IN')}`;
    document.getElementById('orBaseSlabTax').innerText = `₹${or.baseSlabTax.toLocaleString('en-IN')}`;
    document.getElementById('orSpecialTax').innerText = `₹${or.specialRateTax.toLocaleString('en-IN')}`;
    document.getElementById('orRebate87A').innerText = `-₹${or.rebate87A.toLocaleString('en-IN')}`;
    document.getElementById('orSurcharge').innerText = `₹${or.surcharge.toLocaleString('en-IN')}`;
    document.getElementById('orCess').innerText = `₹${or.cess.toLocaleString('en-IN')}`;
    document.getElementById('orAssessedTax').innerText = `₹${or.totalTaxAssessed.toLocaleString('en-IN')}`;
    document.getElementById('orInterestFees').innerText = `₹${or.interest.totalInterestAndFees.toLocaleString('en-IN')}`;
    document.getElementById('orTaxesPaid').innerText = `-₹${res.taxesPaid.totalTaxesPaid.toLocaleString('en-IN')}`;

    // Render Old Regime Slabs Detail
    const orSlabsEl = document.getElementById('orSlabDetails');
    orSlabsEl.innerHTML = '<strong class="block text-primary font-semibold">Slab Tax Computations:</strong>' +
      or.slabBreakdown.map(s => `
        <div class="flex justify-between text-on-surface-variant">
          <span>${s.slab} (${s.rate}%):</span>
          <span class="mono-num">₹${s.taxableAmount.toLocaleString('en-IN')} → ₹${s.tax.toLocaleString('en-IN')}</span>
        </div>
      `).join('');

    // Old Regime Result Box
    const orBox = document.getElementById('orFinalResultBox');
    if (or.isRefund) {
      orBox.className = 'p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center';
      orBox.innerHTML = `
        <span class="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Net Refund Amount</span>
        <div class="text-2xl font-black text-emerald-700 mono-num mt-1">₹${or.refundAmount.toLocaleString('en-IN')}</div>
      `;
    } else {
      orBox.className = 'p-4 rounded-xl bg-slate-50 border border-slate-200 text-center';
      orBox.innerHTML = `
        <span class="text-xs font-semibold text-primary uppercase tracking-wider">Net Tax Payable</span>
        <div class="text-2xl font-black text-primary mono-num mt-1">₹${or.dueAmount.toLocaleString('en-IN')}</div>
      `;
    }
  }

  // --- STEP 4: ITR SCHEDULES & FILING GUIDE RENDERER ---
  function renderSchedules() {
    if (!latestTaxResult) recalculateTax();
    const guideData = TaxFilingGuide.generateFilingSchedules(latestTaxResult, userProfile);

    // Form badge
    document.getElementById('badgeItrForm').innerText = guideData.recommendedItrForm;

    // Render Step Checklist
    const stepsContainer = document.getElementById('filingStepsContainer');
    stepsContainer.innerHTML = '';
    TaxFilingGuide.STEP_BY_STEP_INSTRUCTIONS.forEach(s => {
      const box = document.createElement('div');
      box.className = 'p-3 rounded-xl border border-outline-variant bg-surface-container-low flex flex-col justify-between';
      box.innerHTML = `
        <div>
          <div class="flex items-center gap-2 mb-1.5">
            <span class="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">${s.step}</span>
            <span class="text-xs font-bold text-primary">${s.title}</span>
          </div>
          <p class="text-[11px] text-on-surface-variant">${s.description}</p>
        </div>
      `;
      stepsContainer.appendChild(box);
    });

    // Render Schedules
    const schedContainer = document.getElementById('schedulesContainer');
    schedContainer.innerHTML = '';

    guideData.schedules.forEach(sched => {
      const card = document.createElement('div');
      card.className = 'bg-white rounded-2xl border border-outline-variant p-5 shadow-sm';
      card.innerHTML = `
        <div class="flex items-center justify-between pb-3 border-b border-outline-variant mb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-600">article</span>
            <h3 class="text-sm font-bold text-primary">${sched.name}</h3>
          </div>
          <span class="text-[11px] text-on-surface-variant font-medium">${sched.form}</span>
        </div>
        <div class="space-y-2">
          ${sched.fields.map(f => `
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2 rounded-lg hover:bg-surface-container-low transition text-xs">
              <div class="flex items-start gap-2">
                <span class="font-mono font-bold text-primary min-w-[50px]">${f.code}</span>
                <div>
                  <span class="text-on-surface font-medium">${f.label}</span>
                  ${f.note ? `<p class="text-[10px] text-on-surface-variant">${f.note}</p>` : ''}
                </div>
              </div>
              <div class="flex items-center gap-2 self-end sm:self-auto">
                <span class="font-bold mono-num text-primary">${f.formatted !== undefined ? f.formatted : f.value}</span>
                <button class="btnCopyField px-2.5 py-1 text-[11px] font-semibold bg-surface-container-high hover:bg-primary hover:text-white text-primary rounded transition flex items-center gap-1" data-val="${f.value}">
                  <span class="material-symbols-outlined text-xs">content_copy</span>
                  <span>Copy</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
      schedContainer.appendChild(card);
    });

    // Attach copy button listeners
    document.querySelectorAll('.btnCopyField').forEach(btn => {
      btn.addEventListener('click', () => {
        const val = btn.getAttribute('data-val');
        navigator.clipboard.writeText(val);
        showToast(`Copied "${val}" to clipboard!`);
      });
    });
  }

  // --- STEP 5: AUTOMATED IN-BROWSER TEST SUITE ---
  function initTestRunner() {
    document.getElementById('btnRunAllTestsUI')?.addEventListener('click', runBrowserTests);
  }

  function runBrowserTests() {
    const t0 = performance.now();
    const suiteRes = TaxTestSuite.runAllTests();
    const t1 = performance.now();

    document.getElementById('statTotalTests').innerText = suiteRes.totalTests;
    document.getElementById('statPassedTests').innerText = suiteRes.passedCount;
    document.getElementById('statFailedTests').innerText = suiteRes.failedCount;
    document.getElementById('testSuiteExecutionTime').innerText = `Runtime: ${(t1 - t0).toFixed(2)} ms`;

    const container = document.getElementById('testResultsContainer');
    container.innerHTML = '';

    suiteRes.results.forEach((test, idx) => {
      const isPass = test.status === 'PASSED';
      const card = document.createElement('div');
      card.className = `p-3.5 rounded-xl border text-xs flex flex-col gap-1.5 transition ${isPass ? 'bg-emerald-50/50 border-emerald-200' : 'bg-red-50/50 border-red-200'}`;
      card.innerHTML = `
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-base ${isPass ? 'text-emerald-600' : 'text-error'}">${isPass ? 'check_circle' : 'cancel'}</span>
            <strong class="font-bold text-primary">${test.name}</strong>
          </div>
          <span class="px-2 py-0.5 rounded text-[10px] font-bold ${isPass ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}">${test.status}</span>
        </div>
        <div class="text-[11px] text-on-surface-variant font-mono pl-6">
          <div><span class="text-on-surface font-semibold">Expected:</span> ${test.expected}</div>
          <div><span class="text-on-surface font-semibold">Actual:</span> ${test.actual}</div>
          ${test.details ? `<div class="text-slate-600 mt-0.5 font-sans">${test.details}</div>` : ''}
        </div>
      `;
      container.appendChild(card);
    });

    showToast(`Executed ${suiteRes.totalTests} tests (${suiteRes.passedCount} Passed, ${suiteRes.failedCount} Failed)`);
  }

  // --- MODALS & EXPORT/RESET ACTIONS ---
  function initModalsAndActions() {
    const modal = document.getElementById('modalPersona');
    document.getElementById('btnLoadPersonaModal')?.addEventListener('click', () => modal.classList.remove('hidden'));
    document.getElementById('btnClosePersonaModal')?.addEventListener('click', () => modal.classList.add('hidden'));
    modal?.addEventListener('click', (e) => { if (e.target === modal) modal.classList.add('hidden'); });

    document.getElementById('btnExportJson')?.addEventListener('click', () => {
      const exportObj = {
        app: "TaxEase India",
        assessmentYear: "2026-27",
        financialYear: "2025-26",
        exportedAt: new Date().toISOString(),
        userProfile,
        taxResult: latestTaxResult,
        filingSchedules: TaxFilingGuide.generateFilingSchedules(latestTaxResult, userProfile)
      };
      const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TaxEase_AY2026-27_${userProfile.pan || 'ITR_Draft'}.json`;
      a.click();
      showToast('Filing Summary JSON exported!');
    });

    document.getElementById('btnPrintSummary')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btnResetData')?.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all entered tax profile data?')) {
        userProfile = {
          pan: '',
          tan: '',
          employerName: '',
          ageCategory: 'GENERAL',
          filingMonth: 7,
          isLateFiler: false,
          grossSalary: 0,
          professionalTax: 0,
          entertainmentAllowance: 0,
          propertyType: 'SELF_OCCUPIED',
          rentReceived: 0,
          municipalTaxes: 0,
          homeLoanInterest: 0,
          capitalGains: { ltcg112a: 0, stcg111a: 0, otherLtcg: 0, otherStcg: 0 },
          savingsBankInterest: 0,
          fixedDepositInterest: 0,
          dividendIncome: 0,
          familyPension: 0,
          otherIncome: 0,
          sec80C: 0,
          sec80CCD1B: 0,
          sec80CCD2: 0,
          healthInsuranceSelf: 0,
          healthInsuranceParents: 0,
          isSeniorParents: false,
          sec80E: 0,
          sec80G: 0,
          hraExemption: 0,
          otherDeductionsOld: 0,
          tdsSalary: 0,
          tdsOther: 0,
          tcsPaid: 0,
          advanceTaxPaid: 0,
          selfAssessmentTaxPaid: 0,
          relief89: 0,
          form16Data: null,
          aisData: null
        };
        populateFormFields();
        recalculateTax();
        showToast('All tax data cleared!');
      }
    });
  }

  function showToast(msg) {
    const toast = document.getElementById('toastNotification');
    const msgEl = document.getElementById('toastMessage');
    if (!toast || !msgEl) return;
    msgEl.innerText = msg;
    toast.classList.remove('translate-y-20', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
  }

});
