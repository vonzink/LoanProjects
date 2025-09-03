// ————— Helpers —————
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

function fmtMoney(n) {
  if (n == null || isNaN(n)) return '$0';
  return '$' + Math.abs(n).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function fmtPercent(n) {
  if (n == null || isNaN(n)) return '0.000%';
  return n.toFixed(3) + '%';
}

function readNumber(el) {
  const val = parseFloat(el.value);
  return isNaN(val) ? 0 : val;
}

function setChip(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}

// ————— Mortgage Payment Calculator —————
function calculateMonthlyPayment(principal, annualRate, years) {
  if (principal <= 0 || annualRate <= 0 || years <= 0) return 0;
  
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) / 
                 (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return payment;
}

// ————— Buydown Calculations —————
function getBuydownRates(buydownType, noteRate) {
  switch (buydownType) {
    case '3-2-1':
      return {
        year1: noteRate - 3,
        year2: noteRate - 2,
        year3: noteRate - 1,
        year4: noteRate
      };
    case '2-1':
      return {
        year1: noteRate - 2,
        year2: noteRate - 1,
        year3: noteRate,
        year4: noteRate
      };
    case '1-0':
      return {
        year1: noteRate - 1,
        year2: noteRate,
        year3: noteRate,
        year4: noteRate
      };
    default:
      return {
        year1: noteRate,
        year2: noteRate,
        year3: noteRate,
        year4: noteRate
      };
  }
}

function calculateBuydownCost(loanAmount, noteRate, buydownRates, loanTerm) {
  const basePayment = calculateMonthlyPayment(loanAmount, noteRate, loanTerm);
  let totalCost = 0;
  
  // Calculate the cost for each year
  for (let year = 1; year <= 3; year++) {
    const yearRate = buydownRates[`year${year}`];
    const yearPayment = calculateMonthlyPayment(loanAmount, yearRate, loanTerm);
    const monthlySavings = basePayment - yearPayment;
    const yearlySavings = monthlySavings * 12;
    totalCost += yearlySavings;
  }
  
  return totalCost;
}

function calculateYearlyPayments(loanAmount, buydownRates, loanTerm, includeTaxes = false, includeInsurance = false, taxes = 0, insurance = 0, hoa = 0) {
  const monthlyTaxes = taxes / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyHOA = hoa / 12;
  
  const years = [];
  
  for (let year = 1; year <= 4; year++) {
    const yearRate = buydownRates[`year${year}`];
    const principalInterest = calculateMonthlyPayment(loanAmount, yearRate, loanTerm);
    
    let totalPayment = principalInterest;
    if (includeTaxes) totalPayment += monthlyTaxes;
    if (includeInsurance) totalPayment += monthlyInsurance;
    if (hoa > 0) totalPayment += monthlyHOA;
    
    years.push({
      year,
      rate: yearRate,
      principalInterest,
      totalPayment,
      monthlyTaxes: includeTaxes ? monthlyTaxes : 0,
      monthlyInsurance: includeInsurance ? monthlyInsurance : 0,
      monthlyHOA: hoa > 0 ? monthlyHOA : 0
    });
  }
  
  return years;
}

// ————— State Management —————
let currentState = {
  loanAmount: 0,
  noteRate: 0,
  loanTerm: 30,
  buydownType: '3-2-1',
  includeTaxes: false,
  includeInsurance: false,
  propertyTaxes: 0,
  insurance: 0,
  hoa: 0
};

function getCurrentState() {
  return {
    loanAmount: readNumber($('#loanAmount')),
    noteRate: readNumber($('#noteRate')),
    loanTerm: parseInt($('#loanTerm').value),
    buydownType: $('#buydownType').value,
    includeTaxes: $('#includeTaxes').classList.contains('active'),
    includeInsurance: $('#includeInsurance').classList.contains('active'),
    propertyTaxes: readNumber($('#propertyTaxes')),
    insurance: readNumber($('#insurance')),
    hoa: readNumber($('#hoa'))
  };
}

function applyState(state) {
  $('#loanAmount').value = state.loanAmount;
  $('#noteRate').value = state.noteRate;
  $('#loanTerm').value = state.loanTerm;
  $('#buydownType').value = state.buydownType;

  $('#includeTaxes').classList.toggle('active', state.includeTaxes);
  $('#includeInsurance').classList.toggle('active', state.includeInsurance);
  $('#propertyTaxes').value = state.propertyTaxes;
  $('#insurance').value = state.insurance;
  $('#hoa').value = state.hoa;
  
  // Show/hide tax/insurance section
  $('#taxInsuranceSection').style.display = (state.includeTaxes || state.includeInsurance) ? 'block' : 'none';
}

// ————— Calculations —————
function calculateResults(state) {
  const buydownRates = getBuydownRates(state.buydownType, state.noteRate);
  const basePayment = calculateMonthlyPayment(state.loanAmount, state.noteRate, state.loanTerm);
  const year1Payment = calculateMonthlyPayment(state.loanAmount, buydownRates.year1, state.loanTerm);
  const monthlySavings = basePayment - year1Payment;
  const totalCost = calculateBuydownCost(state.loanAmount, state.noteRate, buydownRates, state.loanTerm);
  
  const yearlyPayments = calculateYearlyPayments(
    state.loanAmount, 
    buydownRates, 
    state.loanTerm, 
    state.includeTaxes, 
    state.includeInsurance, 
    state.propertyTaxes, 
    state.insurance, 
    state.hoa
  );
  
  return {
    buydownRates,
    basePayment,
    year1Payment,
    monthlySavings,
    totalCost,
    yearlyPayments
  };
}

// ————— Rendering —————
function renderSummary(state, results) {
  setChip('#chipLoanAmount', `Loan: ${fmtMoney(state.loanAmount)}`);
  setChip('#chipNoteRate', `Note Rate: ${fmtPercent(state.noteRate)}`);
  setChip('#chipBuydownType', `${state.buydownType} Buydown`);
  setChip('#chipTotalCost', `Buydown Cost: ${fmtMoney(results.totalCost)}`);

  $('#kvBasePayment').textContent = fmtMoney(results.basePayment);
  $('#kvYear1Payment').textContent = fmtMoney(results.year1Payment);
  $('#kvMonthlySavings').textContent = fmtMoney(results.monthlySavings);
  $('#kvTotalCost').textContent = fmtMoney(results.totalCost);
}

function renderPaymentComparison(yearlyPayments, buydownType) {
  const fullPayment = yearlyPayments[3].totalPayment; // Year 4+ (full rate)
  
  $('#fullPaymentValue').textContent = fmtMoney(fullPayment);
  
  // Show/hide years based on buydown type
  const year1Row = $('#year1PaymentValue').closest('.comparison-row');
  const year2Row = $('#year2PaymentValue').closest('.comparison-row');
  const year3Row = $('#year3PaymentValue').closest('.comparison-row');
  
  // Always show Year 1
  year1Row.style.display = 'flex';
  $('#year1PaymentValue').textContent = fmtMoney(yearlyPayments[0].totalPayment);
  const year1Diff = fullPayment - yearlyPayments[0].totalPayment;
  $('#year1Diff').textContent = fmtMoney(year1Diff);
  $('#year1Diff').className = 'comparison-diff savings';
  
  // Show Year 2 for 2-1 and 3-2-1 buydowns
  if (buydownType === '2-1' || buydownType === '3-2-1') {
    year2Row.style.display = 'flex';
    $('#year2PaymentValue').textContent = fmtMoney(yearlyPayments[1].totalPayment);
    const year2Diff = fullPayment - yearlyPayments[1].totalPayment;
    $('#year2Diff').textContent = fmtMoney(year2Diff);
    $('#year2Diff').className = 'comparison-diff savings';
  } else {
    year2Row.style.display = 'none';
  }
  
  // Show Year 3 only for 3-2-1 buydown
  if (buydownType === '3-2-1') {
    year3Row.style.display = 'flex';
    $('#year3PaymentValue').textContent = fmtMoney(yearlyPayments[2].totalPayment);
    const year3Diff = fullPayment - yearlyPayments[2].totalPayment;
    $('#year3Diff').textContent = fmtMoney(year3Diff);
    $('#year3Diff').className = 'comparison-diff savings';
  } else {
    year3Row.style.display = 'none';
  }
}

function renderYearlyBreakdown(yearlyPayments, buydownType) {
  const container = $('#yearlyBreakdown');
  container.innerHTML = '';
  
  // Determine which years to show based on buydown type
  let yearsToShow = [];
  if (buydownType === '3-2-1') {
    yearsToShow = [0, 1, 2, 3]; // All years
  } else if (buydownType === '2-1') {
    yearsToShow = [0, 1, 3]; // Year 1, 2, and 4+
  } else if (buydownType === '1-0') {
    yearsToShow = [0, 3]; // Year 1 and 4+
  }
  
  yearsToShow.forEach(index => {
    const year = yearlyPayments[index];
    const yearDiv = document.createElement('div');
    yearDiv.className = 'buydown-year';
    
    const hasTaxes = year.monthlyTaxes > 0;
    const hasInsurance = year.monthlyInsurance > 0;
    const hasHOA = year.monthlyHOA > 0;
    
    // Adjust year label for clarity
    let yearLabel = `Year ${year.year}`;
    if (year.year === 4) yearLabel = 'Full Rate';
    
    yearDiv.innerHTML = `
      <h4>${yearLabel} - ${fmtPercent(year.rate)}</h4>
      <div class="year-grid">
        <div class="year-kv">
          <div class="k">Principal & Interest</div>
          <div class="v">${fmtMoney(year.principalInterest)}</div>
        </div>
        ${hasTaxes ? `
        <div class="year-kv">
          <div class="k">Property Taxes</div>
          <div class="v">${fmtMoney(year.monthlyTaxes)}</div>
        </div>
        ` : ''}
        ${hasInsurance ? `
        <div class="year-kv">
          <div class="k">Insurance</div>
          <div class="v">${fmtMoney(year.monthlyInsurance)}</div>
        </div>
        ` : ''}
        ${hasHOA ? `
        <div class="year-kv">
          <div class="k">HOA</div>
          <div class="v">${fmtMoney(year.monthlyHOA)}</div>
        </div>
        ` : ''}
        <div class="year-kv">
          <div class="k">Total Payment</div>
          <div class="v">${fmtMoney(year.totalPayment)}</div>
        </div>
      </div>
    `;
    
    container.appendChild(yearDiv);
  });
}

function updateCalculations() {
  currentState = getCurrentState();
  const results = calculateResults(currentState);
  
  renderSummary(currentState, results);
  renderPaymentComparison(results.yearlyPayments, currentState.buydownType);
  renderYearlyBreakdown(results.yearlyPayments, currentState.buydownType);
  updateURL();
  hideWarning();
}

// ————— URL State —————
function serializeState(state) {
  const params = new URLSearchParams();
  params.set('la', state.loanAmount);
  params.set('nr', state.noteRate);
  params.set('lt', state.loanTerm);
  params.set('bt', state.buydownType);
  params.set('it', state.includeTaxes ? '1' : '0');
  params.set('ii', state.includeInsurance ? '1' : '0');
  params.set('pt', state.propertyTaxes);
  params.set('ins', state.insurance);
  params.set('hoa', state.hoa);
  return params.toString();
}

function deserializeState(queryString) {
  const params = new URLSearchParams(queryString);
  const state = { ...currentState };
  
  if (params.has('la')) state.loanAmount = parseFloat(params.get('la')) || 0;
  if (params.has('nr')) state.noteRate = parseFloat(params.get('nr')) || 0;
  if (params.has('lt')) state.loanTerm = parseInt(params.get('lt')) || 30;
  if (params.has('bt')) state.buydownType = params.get('bt') || '3-2-1';

  if (params.has('it')) state.includeTaxes = params.get('it') === '1';
  if (params.has('ii')) state.includeInsurance = params.get('ii') === '1';
  if (params.has('pt')) state.propertyTaxes = parseFloat(params.get('pt')) || 0;
  if (params.has('ins')) state.insurance = parseFloat(params.get('ins')) || 0;
  if (params.has('hoa')) state.hoa = parseFloat(params.get('hoa')) || 0;
  
  return state;
}

function updateURL() {
  const queryString = serializeState(currentState);
  const newURL = window.location.pathname + (queryString ? '?' + queryString : '');
  history.replaceState(null, '', newURL);
}

function loadFromURL() {
  const state = deserializeState(window.location.search);
  applyState(state);
  updateCalculations();
}

// ————— Validation & Warnings —————
function showWarning(message) {
  const warning = $('#warning');
  warning.textContent = message;
  warning.classList.remove('hidden');
}

function hideWarning() {
  $('#warning').classList.add('hidden');
}

function validateInputs(state) {
  if (!state.loanAmount || state.loanAmount <= 0) {
    showWarning('Loan Amount must be greater than 0');
    return false;
  }
  if (!state.noteRate || state.noteRate <= 0) {
    showWarning('Note Rate must be greater than 0');
    return false;
  }
  if (state.noteRate > 20) {
    showWarning('Note Rate seems unusually high');
    return false;
  }
  return true;
}

// ————— Export & Print —————
function exportCSV() {
  const state = getCurrentState();
  const results = calculateResults(state);
  
  const lines = [
    ['Category', 'Value', '', ''],
    ['Loan Amount', fmtMoney(state.loanAmount), '', ''],
    ['Note Rate', fmtPercent(state.noteRate), '', ''],
    ['Loan Term', `${state.loanTerm} years`, '', ''],
    ['Buydown Type', state.buydownType, '', ''],
    ['Include Taxes', state.includeTaxes ? 'Yes' : 'No', '', ''],
    ['Include Insurance', state.includeInsurance ? 'Yes' : 'No', '', ''],
    ['Property Taxes', fmtMoney(state.propertyTaxes), '', ''],
    ['Insurance', fmtMoney(state.insurance), '', ''],
    ['HOA', fmtMoney(state.hoa), '', ''],
    ['', '', '', ''],
    ['Year', 'Rate', 'Payment', 'Total Payment'],
    ...results.yearlyPayments.map(year => [
      `Year ${year.year}`,
      fmtPercent(year.rate),
      fmtMoney(year.principalInterest),
      fmtMoney(year.totalPayment)
    ]),
    ['', '', '', ''],
    ['Base Payment', fmtMoney(results.basePayment), '', ''],
    ['Year 1 Payment', fmtMoney(results.year1Payment), '', ''],
    ['Monthly Savings', fmtMoney(results.monthlySavings), '', ''],
    ['Total Buydown Cost', fmtMoney(results.totalCost), '', '']
  ];
  
  const csv = lines.map(row => 
    row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')
  ).join('\n');
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `buydown-calculator-${Date.now()}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printView() {
  window.print();
}

function copyShareLink() {
  const url = window.location.origin + window.location.pathname + '?' + serializeState(currentState);
  navigator.clipboard.writeText(url).then(() => {
    const btn = $('#btnShare');
    const originalText = btn.textContent;
    btn.textContent = 'Copied ✓';
    setTimeout(() => { btn.textContent = originalText; }, 2000);
  });
}

// ————— Chart Functions —————
let currentChart = null;

function createPaymentChart(yearlyPayments, buydownType) {
  const ctx = document.getElementById('buydownChart').getContext('2d');
  
  if (currentChart) {
    currentChart.destroy();
  }
  
  // Determine which years to show based on buydown type
  let labels = [];
  let payments = [];
  let colors = [];
  
  if (buydownType === '3-2-1') {
    labels = ['Year 1', 'Year 2', 'Year 3', 'Year 4+'];
    payments = yearlyPayments.map(year => year.totalPayment);
    colors = [
      'rgba(46, 204, 113, 0.8)',
      'rgba(52, 152, 219, 0.8)',
      'rgba(155, 89, 182, 0.8)',
      'rgba(231, 76, 60, 0.8)'
    ];
  } else if (buydownType === '2-1') {
    labels = ['Year 1', 'Year 2', 'Year 4+'];
    payments = [yearlyPayments[0].totalPayment, yearlyPayments[1].totalPayment, yearlyPayments[3].totalPayment];
    colors = [
      'rgba(46, 204, 113, 0.8)',
      'rgba(52, 152, 219, 0.8)',
      'rgba(231, 76, 60, 0.8)'
    ];
  } else if (buydownType === '1-0') {
    labels = ['Year 1', 'Year 4+'];
    payments = [yearlyPayments[0].totalPayment, yearlyPayments[3].totalPayment];
    colors = [
      'rgba(46, 204, 113, 0.8)',
      'rgba(231, 76, 60, 0.8)'
    ];
  }
  
  currentChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Monthly Payment',
        data: payments,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace('0.8', '1')),
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Monthly Payment by Year',
          color: '#e9eef5',
          font: {
            size: 16
          }
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#a4b1c2',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: '#223042'
          }
        },
        x: {
          ticks: {
            color: '#a4b1c2'
          },
          grid: {
            color: '#223042'
          }
        }
      }
    }
  });
}



function createRemainingChart(yearlyPayments, buydownType, totalCost) {
  const ctx = document.getElementById('buydownChart').getContext('2d');
  
  if (currentChart) {
    currentChart.destroy();
  }
  
  const fullPayment = yearlyPayments[3].totalPayment;
  let labels = [];
  let remaining = [];
  
  // Calculate monthly progression of remaining buydown credit
  if (buydownType === '3-2-1') {
    // 36 months total (3 years)
    labels = [];
    remaining = [];
    
    for (let month = 0; month <= 36; month++) {
      let monthlyUsed = 0;
      
      if (month <= 12) {
        // Year 1: 3% reduction
        monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * month;
      } else if (month <= 24) {
        // Year 2: 2% reduction
        monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * 12 + 
                     (fullPayment - yearlyPayments[1].totalPayment) * (month - 12);
      } else {
        // Year 3: 1% reduction
        monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * 12 + 
                     (fullPayment - yearlyPayments[1].totalPayment) * 12 + 
                     (fullPayment - yearlyPayments[2].totalPayment) * (month - 24);
      }
      
      labels.push(month === 0 ? 'Start' : `Month ${month}`);
      remaining.push(Math.max(0, totalCost - monthlyUsed));
    }
  } else if (buydownType === '2-1') {
    // 24 months total (2 years)
    labels = [];
    remaining = [];
    
    for (let month = 0; month <= 24; month++) {
      let monthlyUsed = 0;
      
      if (month <= 12) {
        // Year 1: 2% reduction
        monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * month;
      } else {
        // Year 2: 1% reduction
        monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * 12 + 
                     (fullPayment - yearlyPayments[1].totalPayment) * (month - 12);
      }
      
      labels.push(month === 0 ? 'Start' : `Month ${month}`);
      remaining.push(Math.max(0, totalCost - monthlyUsed));
    }
  } else if (buydownType === '1-0') {
    // 12 months total (1 year)
    labels = [];
    remaining = [];
    
    for (let month = 0; month <= 12; month++) {
      // Year 1: 1% reduction
      const monthlyUsed = (fullPayment - yearlyPayments[0].totalPayment) * month;
      
      labels.push(month === 0 ? 'Start' : `Month ${month}`);
      remaining.push(Math.max(0, totalCost - monthlyUsed));
    }
  }
  
  currentChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Buydown Remaining',
        data: remaining,
        borderColor: 'rgba(52, 152, 219, 1)',
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.1
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Buydown Credit Remaining (Monthly Progression)',
          color: '#e9eef5',
          font: {
            size: 16
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Remaining: $' + context.parsed.y.toLocaleString();
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: '#a4b1c2',
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          },
          grid: {
            color: '#223042'
          }
        },
        x: {
          ticks: {
            color: '#a4b1c2',
            maxTicksLimit: 12,
            callback: function(value, index) {
              const label = this.getLabelForValue(value);
              if (label === 'Start' || label.includes('12') || label.includes('24') || label.includes('36')) {
                return label;
              }
              return '';
            }
          },
          grid: {
            color: '#223042'
          }
        }
      }
    }
  });
}

function showChart() {
  $('#chartContainer').style.display = 'block';
}

// ————— Event Handlers —————
function wireEvents() {
  // Input changes
  $('#loanAmount').addEventListener('input', updateCalculations);
  $('#noteRate').addEventListener('input', updateCalculations);
  $('#loanTerm').addEventListener('change', updateCalculations);
  $('#buydownType').addEventListener('change', updateCalculations);
  $('#propertyTaxes').addEventListener('input', updateCalculations);
  $('#insurance').addEventListener('input', updateCalculations);
  $('#hoa').addEventListener('input', updateCalculations);
  
  // Toggles
  $('#includeTaxes').addEventListener('click', function() {
    this.classList.toggle('active');
    $('#taxInsuranceSection').style.display = (this.classList.contains('active') || $('#includeInsurance').classList.contains('active')) ? 'block' : 'none';
    updateCalculations();
  });
  $('#includeInsurance').addEventListener('click', function() {
    this.classList.toggle('active');
    $('#taxInsuranceSection').style.display = (this.classList.contains('active') || $('#includeTaxes').classList.contains('active')) ? 'block' : 'none';
    updateCalculations();
  });
  
  // Actions
  $('#btnCsv').addEventListener('click', exportCSV);
  $('#btnPrint').addEventListener('click', printView);
  $('#btnShare').addEventListener('click', copyShareLink);
  
  // Chart buttons
  $('#btnPaymentChart').addEventListener('click', function() {
    const state = getCurrentState();
    const results = calculateResults(state);
    createPaymentChart(results.yearlyPayments, state.buydownType);
    showChart();
  });
  

  
  $('#btnRemainingChart').addEventListener('click', function() {
    const state = getCurrentState();
    const results = calculateResults(state);
    createRemainingChart(results.yearlyPayments, state.buydownType, results.totalCost);
    showChart();
  });
}

// ————— Debug —————
window.BuydownCalculator = {
  debug() {
    const state = getCurrentState();
    const results = calculateResults(state);
    return {
      state,
      results
    };
  }
};

// ————— Initialize —————
document.addEventListener('DOMContentLoaded', () => {
  wireEvents();
  loadFromURL();
  updateCalculations();
});
