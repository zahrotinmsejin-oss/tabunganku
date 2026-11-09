/**
 * Tabunganku - Aplikasi Catatan Keuangan, Pengeluaran & Tabungan
 * Logika Aplikasi Modern & Responsif untuk HP & Desktop
 */

// ========================================================
// 1. DATA MASTER & DEFAULT KATEGORI
// ========================================================

const CATEGORIES = {
  pengeluaran: [
    { id: 'arisan', name: 'Iuran / Setor Arisan', icon: '🤝', color: '#ec4899' },
    { id: 'makanan', name: 'Makanan & Minuman', icon: '🍲', color: '#f43f5e' },
    { id: 'transport', name: 'Transportasi & Bensin', icon: '🛵', color: '#fb923c' },
    { id: 'belanja', name: 'Belanja Kebutuhan Pokok', icon: '🛒', color: '#f59e0b' },
    { id: 'tagihan', name: 'Tagihan, Listrik & Air', icon: '💡', color: '#eab308' },
    { id: 'kost', name: 'Kost / Kontrakan / Cicilan', icon: '🏠', color: '#84cc16' },
    { id: 'hiburan', name: 'Hiburan & Liburan', icon: '🎮', color: '#06b6d4' },
    { id: 'kesehatan', name: 'Kesehatan & Obat', icon: '💊', color: '#ec4899' },
    { id: 'pulsa', name: 'Pulsa & Paket Internet', icon: '📶', color: '#3b82f6' },
    { id: 'keluarga', name: 'Keluarga & Donasi', icon: '🤲', color: '#a855f7' },
    { id: 'lainnya', name: 'Pengeluaran Lainnya', icon: '📝', color: '#64748b' }
  ],
  tabungan: [
    { id: 'tabungan_mandiri', name: 'Tabungan Bank Mandiri', icon: '💳', color: '#0284c7' },
    { id: 'tabungan_arisan', name: 'Iuran / Uang Arisan', icon: '🤝', color: '#ec4899' },
    { id: 'tabungan_umum', name: 'Tabungan Bebas', icon: '🏦', color: '#8b5cf6' },
    { id: 'dana_darurat', name: 'Dana Darurat', icon: '🛡️', color: '#a78bfa' },
    { id: 'impian', name: 'Target Pembelian Impian', icon: '⭐', color: '#c084fc' },
    { id: 'investasi_depan', name: 'Investasi Masa Depan', icon: '🚀', color: '#7c3aed' }
  ],
  pemasukan: [
    { id: 'gaji', name: 'Gaji Bulanan', icon: '💼', color: '#10b981' },
    { id: 'dapat_arisan', name: 'Dapat / Tarik Arisan', icon: '🎉', color: '#34d399' },
    { id: 'tarik_mandiri', name: 'Tarik / Transfer Bank Mandiri', icon: '💳', color: '#0284c7' },
    { id: 'usaha', name: 'Usaha & Jualan', icon: '🏪', color: '#059669' },
    { id: 'freelance', name: 'Freelance & Proyek', icon: '💻', color: '#14b8a6' },
    { id: 'bonus', name: 'Bonus, Hadiah & THR', icon: '🎁', color: '#34d399' },
    { id: 'investasi', name: 'Dividen & Bunga Investasi', icon: '📈', color: '#2dd4bf' },
    { id: 'lainnya_in', name: 'Pemasukan Lainnya', icon: '💵', color: '#6ee7b7' }
  ]
};

// Data Awal: Dimulai dari bersih (Rp 0) tanpa data contoh
const INITIAL_GOALS = [];
const INITIAL_TRANSACTIONS = [];

// ========================================================
// 2. STATE APLIKASI & LOCALSTORAGE PERMANEN
// ========================================================

// Kunci penyimpanan permanen untuk data Zahro (tidak akan berubah saat ada update fitur)
const STORAGE_KEY_TX = 'tabunganku_zahro_transactions';
const STORAGE_KEY_GOALS = 'tabunganku_zahro_goals';

// Daftar kunci versi sebelumnya untuk memulihkan otomatis data yang pernah diinput
const LEGACY_TX_KEYS = [
  'tabunganku_transactions_v3',
  'tabunganku_transactions_v2',
  'tabunganku_transactions'
];
const LEGACY_GOAL_KEYS = [
  'tabunganku_goals_v3',
  'tabunganku_goals_v2',
  'tabunganku_goals'
];

let transactions = [];
let goals = [];
let currentFilterType = 'all';
let currentCategoryFilter = 'all';
let currentPeriodFilter = 'this-month';
let searchQuery = '';

let expenseChartInstance = null;
let trendChartInstance = null;

function loadState() {
  let savedTx = localStorage.getItem(STORAGE_KEY_TX);
  let savedGoals = localStorage.getItem(STORAGE_KEY_GOALS);

  // Jika kunci permanen masih kosong, periksa dan pulihkan dari versi sebelumnya
  if (!savedTx) {
    for (const legacyKey of LEGACY_TX_KEYS) {
      const legacyData = localStorage.getItem(legacyKey);
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            savedTx = legacyData;
            localStorage.setItem(STORAGE_KEY_TX, savedTx);
            break;
          }
        } catch (e) {}
      }
    }
  }

  if (!savedGoals) {
    for (const legacyKey of LEGACY_GOAL_KEYS) {
      const legacyData = localStorage.getItem(legacyKey);
      if (legacyData) {
        try {
          const parsed = JSON.parse(legacyData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            savedGoals = legacyData;
            localStorage.setItem(STORAGE_KEY_GOALS, savedGoals);
            break;
          }
        } catch (e) {}
      }
    }
  }

  if (savedTx) {
    try {
      transactions = JSON.parse(savedTx);
    } catch (e) {
      transactions = [];
    }
  } else {
    transactions = [];
  }

  if (savedGoals) {
    try {
      goals = JSON.parse(savedGoals);
    } catch (e) {
      goals = [];
    }
  } else {
    goals = [];
  }
}

function saveTransactions() {
  localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
}

function saveGoals() {
  localStorage.setItem(STORAGE_KEY_GOALS, JSON.stringify(goals));
}

// ========================================================
// 3. UTILITY FORMATTER
// ========================================================

function formatRupiah(amount) {
  const num = Number(amount) || 0;
  return 'Rp ' + num.toLocaleString('id-ID');
}

function parseNumericInput(val) {
  if (typeof val === 'number') return val;
  const cleaned = (val || '').toString().replace(/[^0-9]/g, '');
  return parseInt(cleaned, 10) || 0;
}

function formatInputAsRupiah(inputElement, previewElement = null) {
  inputElement.addEventListener('input', (e) => {
    const rawVal = parseNumericInput(e.target.value);
    e.target.value = rawVal ? rawVal.toLocaleString('id-ID') : '';
    if (previewElement) {
      previewElement.textContent = rawVal ? formatTerbilangRingkas(rawVal) : 'Nol rupiah';
    }
  });
}

function formatTerbilangRingkas(num) {
  if (!num) return 'Nol rupiah';
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2).replace('.00', '') + ' Miliar Rupiah';
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(2).replace('.00', '') + ' Juta Rupiah';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + ' Ribu Rupiah';
  }
  return num.toLocaleString('id-ID') + ' Rupiah';
}

function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateIndo(dateStr) {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
  
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = dateObj.toDateString() === today.toDateString();
  const isYesterday = dateObj.toDateString() === yesterday.toDateString();

  const dayName = dateObj.toLocaleDateString('id-ID', { weekday: 'short' });
  const dateFormatted = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  if (isToday) return `Hari Ini, ${dayName} (${dateFormatted})`;
  if (isYesterday) return `Kemarin, ${dayName} (${dateFormatted})`;

  return dateObj.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = `fixed top-5 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold text-white transition-all duration-300 pointer-events-none transform ${
    type === 'success' ? 'bg-pink-600 border border-pink-400' : 'bg-rose-600 border border-rose-400'
  }`;

  toast.classList.remove('opacity-0', '-translate-y-2');
  toast.classList.add('opacity-100', 'translate-y-0');

  setTimeout(() => {
    toast.classList.remove('opacity-100', 'translate-y-0');
    toast.classList.add('opacity-0', '-translate-y-2');
  }, 2500);
}

// ========================================================
// 4. RENDER UI & PERHITUNGAN
// ========================================================

function renderAll() {
  updateSummaryMetrics();
  renderDashboardGoals();
  renderDashboardRecentTransactions();
  renderFullTransactionsList();
  renderGoalsTab();
  renderCategoryFilterOptions();
  renderCharts();
  updateAnalytics();
}

function updateSummaryMetrics() {
  const todayStr = getLocalDateString();
  const currentMonthPrefix = todayStr.slice(0, 7); // 'YYYY-MM'

  let totalIncomeThisMonth = 0;
  let totalExpenseThisMonth = 0;
  let todayIncome = 0;
  let todayExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  let allTimeIncome = 0;
  let allTimeExpense = 0;
  let allTimeSavings = 0;

  transactions.forEach((tx) => {
    const isThisMonth = tx.date && tx.date.startsWith(currentMonthPrefix);
    const isToday = tx.date === todayStr;
    const amount = Number(tx.amount) || 0;

    if (tx.type === 'pemasukan') {
      allTimeIncome += amount;
      if (isThisMonth) {
        totalIncomeThisMonth += amount;
        incomeCount++;
      }
      if (isToday) {
        todayIncome += amount;
      }
    } else if (tx.type === 'pengeluaran') {
      allTimeExpense += amount;
      if (isThisMonth) {
        totalExpenseThisMonth += amount;
        expenseCount++;
      }
      if (isToday) {
        todayExpense += amount;
      }
    } else if (tx.type === 'tabungan') {
      allTimeSavings += amount;
    }
  });

  // Total uang tabungan dihitung dari seluruh goals terkumpul + transaksi tabungan
  let totalSavedInGoals = goals.reduce((acc, g) => acc + (Number(g.currentAmount) || 0), 0);
  const totalSavingsCombined = Math.max(allTimeSavings, totalSavedInGoals);

  // Sisa kas yang siap dipakai (Cash Balance)
  let availableCash = 0;
  if (allTimeIncome > 0) {
    availableCash = Math.max(0, allTimeIncome - allTimeExpense - allTimeSavings);
  }

  // Total kekayaan bersih (Total Saldo Bersih = Kas Siap Pakai + Seluruh Tabungan Tersimpan)
  const netBalance = availableCash + totalSavingsCombined;

  // Render ke DOM
  const elNet = document.getElementById('total-net-balance');
  const elCash = document.getElementById('total-cash-balance');
  const elIncome = document.getElementById('stat-total-income');
  const elExpense = document.getElementById('stat-total-expense');
  const elSavings = document.getElementById('stat-total-savings');
  const elSavingsHero = document.getElementById('savings-hero-total');
  const elTodayIncome = document.getElementById('stat-today-income');
  const elTodayExpense = document.getElementById('stat-today-expense');

  if (elNet) elNet.textContent = formatRupiah(netBalance);
  if (elCash) elCash.textContent = formatRupiah(availableCash);
  if (elIncome) elIncome.textContent = formatRupiah(totalIncomeThisMonth);
  if (elExpense) elExpense.textContent = formatRupiah(totalExpenseThisMonth);
  if (elSavings) elSavings.textContent = formatRupiah(totalSavingsCombined);
  if (elSavingsHero) elSavingsHero.textContent = formatRupiah(totalSavingsCombined);
  if (elTodayIncome) elTodayIncome.textContent = `Hari ini: +${formatRupiah(todayIncome)}`;
  if (elTodayExpense) elTodayExpense.textContent = `Hari ini: -${formatRupiah(todayExpense)}`;

  const elIncCount = document.getElementById('stat-income-count');
  const elExpCount = document.getElementById('stat-expense-count');
  const elSavCount = document.getElementById('stat-savings-count');
  if (elIncCount) elIncCount.textContent = `${incomeCount} transaksi`;
  if (elExpCount) elExpCount.textContent = `${expenseCount} transaksi`;
  if (elSavCount) elSavCount.textContent = `${goals.length} target aktif`;

  const elBadgeGoals = document.getElementById('badge-total-goals');
  if (elBadgeGoals) elBadgeGoals.textContent = `${goals.length} Target`;

  // Label bulan
  const now = new Date();
  const monthName = now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const elLabelBulan = document.getElementById('label-periode-bulan');
  if (elLabelBulan) elLabelBulan.textContent = monthName;

  // Perhitungan khusus Catatan & Total Arisan Zahro
  let totalArisanPaid = 0;
  let arisanCount = 0;
  let totalArisanReceived = 0;
  let lastArisanDate = null;

  transactions.forEach((tx) => {
    const cat = (tx.category || '').toLowerCase();
    const note = (tx.note || '').toLowerCase();
    const isArisanRelated = cat.includes('arisan') || note.includes('arisan');

    if (isArisanRelated) {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'pengeluaran' || tx.type === 'tabungan') {
        totalArisanPaid += amt;
        arisanCount++;
        if (!lastArisanDate || new Date(tx.date) > new Date(lastArisanDate)) {
          lastArisanDate = tx.date;
        }
      } else if (tx.type === 'pemasukan') {
        totalArisanReceived += amt;
      }
    }
  });

  const elTotalArisan = document.getElementById('stat-total-arisan');
  const elArisanCount = document.getElementById('badge-arisan-count');
  const elArisanLastDate = document.getElementById('stat-arisan-last-date');
  const elArisanReceived = document.getElementById('stat-arisan-received');

  if (elTotalArisan) elTotalArisan.textContent = formatRupiah(totalArisanPaid);
  if (elArisanCount) elArisanCount.textContent = `${arisanCount}x Setoran`;
  if (elArisanLastDate) {
    elArisanLastDate.textContent = lastArisanDate ? `Terakhir: ${formatDateIndo(lastArisanDate)}` : 'Belum ada setoran';
  }
  if (elArisanReceived) elArisanReceived.textContent = formatRupiah(totalArisanReceived);

  const elModalArisan = document.getElementById('modal-arisan-current-total');
  if (elModalArisan) {
    elModalArisan.textContent = `${formatRupiah(totalArisanPaid)} (${arisanCount}x setoran)`;
  }
}

// Render mini savings goals on Dashboard
function renderDashboardGoals() {
  const container = document.getElementById('dashboard-goals-list');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full p-4 rounded-xl bg-slate-900/60 border border-dashed border-slate-700 text-center">
        <p class="text-xs text-slate-400">Belum ada target tabungan yang dibuat.</p>
        <button onclick="openAddGoalModal()" class="mt-2 text-xs font-semibold text-emerald-400 hover:underline">+ Buat Target Tabungan Pertama</button>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.slice(0, 2).map((goal) => {
    const target = Number(goal.targetAmount) || 1;
    const current = Number(goal.currentAmount) || 0;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const isCompleted = percent >= 100;

    return `
      <div class="p-3.5 rounded-xl bg-slate-900/80 border border-slate-700/80 hover:border-slate-600 transition">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-xl">${goal.icon || '🎯'}</span>
            <div>
              <h4 class="text-xs font-bold text-white">${escapeHtml(goal.name)}</h4>
              <p class="text-[10px] text-slate-400">Target: ${formatRupiah(target)}</p>
            </div>
          </div>
          <span class="text-xs font-bold font-numeric ${isCompleted ? 'text-emerald-400' : 'text-violet-400'}">${percent}%</span>
        </div>

        <div class="w-full bg-slate-800 rounded-full h-2 mt-2.5 overflow-hidden">
          <div class="h-full rounded-full transition-all duration-500 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-500 to-indigo-500'}" style="width: ${percent}%"></div>
        </div>

        <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2">
          <span>Terkumpul: <strong class="text-white font-numeric">${formatRupiah(current)}</strong></span>
          <button onclick="openDepositForGoal('${goal.id}')" class="text-[10px] font-semibold text-violet-300 hover:text-white px-2 py-0.5 rounded bg-violet-500/20 hover:bg-violet-500/30 transition">
            + Setor
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Render recent 5 transactions on Dashboard
function renderDashboardRecentTransactions() {
  const container = document.getElementById('dashboard-recent-transactions');
  if (!container) return;

  const sorted = [...transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  if (sorted.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-xs text-slate-500">
        Belum ada transaksi. Klik tombol <strong>+ Tambah Transaksi</strong> untuk mulai mencatat.
      </div>
    `;
    return;
  }

  container.innerHTML = sorted.map((tx) => renderTransactionItemHTML(tx)).join('');
}

// Render full transactions list in Tab 2 with active filters
function renderFullTransactionsList() {
  const container = document.getElementById('full-transactions-list');
  if (!container) return;

  let filtered = [...transactions];

  // 1. Filter Type
  if (currentFilterType !== 'all') {
    filtered = filtered.filter((t) => t.type === currentFilterType);
  }

  // 2. Filter Category
  if (currentCategoryFilter !== 'all') {
    filtered = filtered.filter((t) => t.category === currentCategoryFilter);
  }

  // 3. Filter Period
  const now = new Date();
  const currentMonth = now.toISOString().slice(0, 7);
  const todayStr = now.toISOString().slice(0, 10);

  if (currentPeriodFilter === 'this-month') {
    filtered = filtered.filter((t) => t.date && t.date.startsWith(currentMonth));
  } else if (currentPeriodFilter === 'last-month') {
    const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = lastMonthDate.toISOString().slice(0, 7);
    filtered = filtered.filter((t) => t.date && t.date.startsWith(lastMonthStr));
  } else if (currentPeriodFilter === 'today') {
    filtered = filtered.filter((t) => t.date === todayStr);
  }

  // 4. Search Filter
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((t) => {
      const matchCat = (t.category || '').toLowerCase().includes(q);
      const matchNote = (t.note || '').toLowerCase().includes(q);
      const matchAmount = (t.amount || '').toString().includes(q);
      return matchCat || matchNote || matchAmount;
    });
  }

  // Urutkan tanggal terbaru paling atas
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Update summary header filter
  let sumIncome = 0;
  let sumExpense = 0;
  filtered.forEach((t) => {
    if (t.type === 'pemasukan') sumIncome += Number(t.amount) || 0;
    if (t.type === 'pengeluaran') sumExpense += Number(t.amount) || 0;
  });

  const elResultCount = document.getElementById('filter-result-count');
  const elSumIncome = document.getElementById('filter-sum-income');
  const elSumExpense = document.getElementById('filter-sum-expense');
  if (elResultCount) elResultCount.textContent = `Menampilkan ${filtered.length} transaksi`;
  if (elSumIncome) elSumIncome.textContent = `+${formatRupiah(sumIncome)}`;
  if (elSumExpense) elSumExpense.textContent = `-${formatRupiah(sumExpense)}`;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glass-panel rounded-2xl p-8 text-center border border-slate-800">
        <div class="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        </div>
        <p class="text-sm font-semibold text-slate-300">Tidak ada transaksi yang cocok</p>
        <p class="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter Anda.</p>
      </div>
    `;
    return;
  }

  // Kelompokkan per tanggal
  const groupedByDate = {};
  filtered.forEach((tx) => {
    const d = tx.date || 'Tanpa Tanggal';
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(tx);
  });

  const html = Object.keys(groupedByDate).map((dateKey) => {
    let dayIncome = 0;
    let dayExpense = 0;
    let daySavings = 0;

    groupedByDate[dateKey].forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'pemasukan') dayIncome += amt;
      else if (t.type === 'pengeluaran') dayExpense += amt;
      else if (t.type === 'tabungan') daySavings += amt;
    });

    const subtotalBadges = [];
    if (dayIncome > 0) {
      subtotalBadges.push(`<span class="text-emerald-400 font-numeric font-bold bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-lg text-[11px]">+${formatRupiah(dayIncome)}</span>`);
    }
    if (dayExpense > 0) {
      subtotalBadges.push(`<span class="text-rose-400 font-numeric font-bold bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 rounded-lg text-[11px]">-${formatRupiah(dayExpense)}</span>`);
    }
    if (daySavings > 0) {
      subtotalBadges.push(`<span class="text-violet-400 font-numeric font-bold bg-violet-500/15 border border-violet-500/30 px-2 py-0.5 rounded-lg text-[11px]">📥 ${formatRupiah(daySavings)}</span>`);
    }

    const listItems = groupedByDate[dateKey].map((tx) => renderTransactionItemHTML(tx, true)).join('');
    return `
      <div class="glass-panel rounded-2xl p-3.5 sm:p-4 border border-slate-800">
        <div class="flex flex-col xs:flex-row xs:items-center justify-between gap-1.5 pb-2.5 mb-2.5 border-b border-slate-800/80 text-xs">
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-200 text-xs sm:text-sm">${formatDateIndo(dateKey)}</span>
            <span class="text-[11px] text-slate-500 font-mono">(${dateKey})</span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Total Hari Ini:</span>
            ${subtotalBadges.length > 0 ? subtotalBadges.join(' ') : '<span class="text-slate-500 text-[11px]">Rp 0</span>'}
          </div>
        </div>
        <div class="divide-y divide-slate-800/60">
          ${listItems}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = html;
}

// Generate HTML item transaksi
function renderTransactionItemHTML(tx, withActions = false) {
  const isIncome = tx.type === 'pemasukan';
  const isSavings = tx.type === 'tabungan';
  const amountPrefix = isIncome ? '+' : (isSavings ? '📥 ' : '-');
  const amountColor = isIncome ? 'text-emerald-400' : (isSavings ? 'text-violet-400' : 'text-rose-400');
  const badgeClass = isIncome ? 'badge-income' : (isSavings ? 'badge-savings' : 'badge-expense');

  // Cari icon kategori
  let categoryIcon = '📝';
  const allCats = [...CATEGORIES.pengeluaran, ...CATEGORIES.pemasukan, ...CATEGORIES.tabungan];
  const matched = allCats.find((c) => c.name === tx.category);
  if (matched) categoryIcon = matched.icon;

  return `
    <div class="py-2.5 flex items-center justify-between gap-3 group">
      <div class="flex items-center gap-3 min-w-0">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-slate-800/90 border border-slate-700/60 shrink-0">
          ${categoryIcon}
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span class="text-xs sm:text-sm font-semibold text-slate-200 truncate">${escapeHtml(tx.category || 'Transaksi')}</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded font-medium ${badgeClass}">
              ${tx.type}
            </span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-slate-400 truncate mt-0.5">
            <span>${formatDateIndo(tx.date)}</span>
            ${tx.note ? `<span class="truncate text-slate-500">• ${escapeHtml(tx.note)}</span>` : ''}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 shrink-0">
        <span class="text-xs sm:text-sm font-bold font-numeric ${amountColor}">
          ${amountPrefix}${formatRupiah(tx.amount)}
        </span>

        ${withActions ? `
          <div class="flex items-center gap-1">
            <button onclick="editTransaction('${tx.id}')" class="p-1 rounded text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition" title="Edit">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
            </button>
            <button onclick="deleteTransaction('${tx.id}')" class="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition" title="Hapus">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Render Goals di Tab 3
function renderGoalsTab() {
  const container = document.getElementById('goals-full-grid');
  if (!container) return;

  if (goals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full glass-panel rounded-2xl p-10 text-center border border-slate-800">
        <div class="w-14 h-14 mx-auto rounded-full bg-violet-500/10 text-violet-400 flex items-center justify-center text-2xl mb-3">
          🎯
        </div>
        <h3 class="text-sm font-bold text-white">Mulai Target Tabungan Impian Anda</h3>
        <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
          Catat tujuan finansial Anda seperti dana darurat, cicilan lunas, liburan, atau gadget baru.
        </p>
        <button onclick="openAddGoalModal()" class="mt-4 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-lg shadow-violet-600/30 transition active-press">
          + Buat Target Pertama Sekarang
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = goals.map((goal) => {
    const target = Number(goal.targetAmount) || 1;
    const current = Number(goal.currentAmount) || 0;
    const percent = Math.min(100, Math.round((current / target) * 100));
    const isCompleted = percent >= 100;
    const remaining = Math.max(0, target - current);

    return `
      <div class="glass-panel rounded-2xl p-5 border ${isCompleted ? 'border-emerald-500/40 bg-emerald-950/20' : 'border-slate-800'} space-y-4 relative overflow-hidden">
        ${isCompleted ? `
          <div class="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
            ✓ Tercapai 100%!
          </div>
        ` : ''}

        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl bg-slate-800 border border-slate-700">
              ${goal.icon || '🎯'}
            </div>
            <div>
              <h4 class="text-sm font-bold text-white">${escapeHtml(goal.name)}</h4>
              <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                <span>Target: <strong class="text-slate-200 font-numeric">${formatRupiah(target)}</strong></span>
                ${goal.deadline ? `<span>• Tenggat: ${formatDateIndo(goal.deadline)}</span>` : ''}
              </div>
            </div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div>
          <div class="flex items-center justify-between text-xs mb-1.5">
            <span class="text-slate-400">Progres Pengumpulan:</span>
            <span class="font-bold font-numeric ${isCompleted ? 'text-emerald-400' : 'text-violet-400'}">${percent}%</span>
          </div>
          <div class="w-full bg-slate-950 rounded-full h-3 p-0.5 border border-slate-800">
            <div class="h-full rounded-full transition-all duration-700 ${isCompleted ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-violet-600 to-indigo-500'}" style="width: ${percent}%"></div>
          </div>
          <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2 font-numeric">
            <span>Terkumpul: <strong class="text-emerald-400">${formatRupiah(current)}</strong></span>
            <span>Sisa: <strong class="text-rose-400">${formatRupiah(remaining)}</strong></span>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <button onclick="editGoal('${goal.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition" title="Edit Target">
              Edit
            </button>
            <button onclick="deleteGoal('${goal.id}')" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 text-xs font-medium transition" title="Hapus">
              Hapus
            </button>
          </div>

          <button onclick="openDepositForGoal('${goal.id}')" class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-violet-600/30 transition active-press">
            <span>📥</span> Setor Tabungan
          </button>
        </div>
      </div>
    `;
  }).join('');
}

// Update opsi kategori di filter tab transaksi
function renderCategoryFilterOptions() {
  const select = document.getElementById('filter-category');
  if (!select) return;

  const currentVal = select.value;
  const allCats = [...CATEGORIES.pengeluaran, ...CATEGORIES.pemasukan, ...CATEGORIES.tabungan];

  select.innerHTML = '<option value="all">Semua Kategori</option>' +
    allCats.map((c) => `<option value="${c.name}">${c.icon} ${c.name}</option>`).join('');

  select.value = currentVal;
}

// ========================================================
// 5. GRAFIK & ANALITIK (CHART.JS)
// ========================================================

function renderCharts() {
  renderExpenseDonutChart();
  renderTrendBarChart();
}

function renderExpenseDonutChart() {
  const canvas = document.getElementById('chart-expense-donut');
  const emptyState = document.getElementById('chart-donut-empty');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Kumpulkan pengeluaran per kategori bulan ini
  const catSums = {};
  transactions
    .filter((t) => t.type === 'pengeluaran' && t.date && t.date.startsWith(currentMonth))
    .forEach((t) => {
      const cat = t.category || 'Lainnya';
      catSums[cat] = (catSums[cat] || 0) + (Number(t.amount) || 0);
    });

  const labels = Object.keys(catSums);
  const data = Object.values(catSums);

  if (labels.length === 0) {
    if (expenseChartInstance) {
      expenseChartInstance.destroy();
      expenseChartInstance = null;
    }
    canvas.classList.add('hidden');
    if (emptyState) emptyState.classList.remove('hidden');
    return;
  }

  canvas.classList.remove('hidden');
  if (emptyState) emptyState.classList.add('hidden');

  const palette = ['#f43f5e', '#fb923c', '#f59e0b', '#10b981', '#06b6d4', '#8b5cf6', '#ec4899', '#3b82f6'];

  if (expenseChartInstance) {
    expenseChartInstance.destroy();
  }

  expenseChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: palette.slice(0, labels.length),
        borderWidth: 2,
        borderColor: '#0f172a',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            font: { size: 10 },
            color: '#94a3b8'
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ` ${ctx.label}: ${formatRupiah(ctx.raw)}`;
            }
          }
        }
      },
      cutout: '65%'
    }
  });
}

function renderTrendBarChart() {
  const canvas = document.getElementById('chart-trend-bar');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Ambil 6 bulan terakhir
  const months = [];
  const incomeData = [];
  const expenseData = [];

  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = d.toISOString().slice(0, 7);
    const label = d.toLocaleDateString('id-ID', { month: 'short' });
    months.push(label);

    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      if (tx.date && tx.date.startsWith(key)) {
        if (tx.type === 'pemasukan') inc += Number(tx.amount) || 0;
        if (tx.type === 'pengeluaran') exp += Number(tx.amount) || 0;
      }
    });

    incomeData.push(inc);
    expenseData.push(exp);
  }

  if (trendChartInstance) {
    trendChartInstance.destroy();
  }

  trendChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Pemasukan',
          data: incomeData,
          backgroundColor: '#10b981',
          borderRadius: 6
        },
        {
          label: 'Pengeluaran',
          data: expenseData,
          backgroundColor: '#f43f5e',
          borderRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 12,
            font: { size: 10 },
            color: '#94a3b8'
          }
        },
        tooltip: {
          callbacks: {
            label: function (ctx) {
              return ` ${ctx.dataset.label}: ${formatRupiah(ctx.raw)}`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 10 } }
        },
        y: {
          grid: { color: 'rgba(51, 65, 85, 0.4)' },
          ticks: {
            color: '#94a3b8',
            font: { size: 9 },
            callback: (v) => (v >= 1000000 ? (v / 1000000).toFixed(0) + 'jt' : v)
          }
        }
      }
    }
  });
}

function updateAnalytics() {
  const currentMonth = new Date().toISOString().slice(0, 7);
  let totalIncome = 0;
  let totalExpense = 0;
  const expenseCatSums = {};

  transactions
    .filter((t) => t.date && t.date.startsWith(currentMonth))
    .forEach((t) => {
      const amt = Number(t.amount) || 0;
      if (t.type === 'pemasukan') totalIncome += amt;
      if (t.type === 'pengeluaran') {
        totalExpense += amt;
        expenseCatSums[t.category] = (expenseCatSums[t.category] || 0) + amt;
      }
    });

  // Savings rate = ((pemasukan - pengeluaran) / pemasukan) * 100
  const rate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;
  const elSavingsRate = document.getElementById('stat-savings-rate');
  if (elSavingsRate) elSavingsRate.textContent = `${rate}%`;

  // Daily average expense
  const now = new Date();
  const daysPassed = Math.max(1, now.getDate());
  const dailyAvg = Math.round(totalExpense / daysPassed);
  const elDailyAvg = document.getElementById('stat-daily-avg-expense');
  if (elDailyAvg) elDailyAvg.textContent = formatRupiah(dailyAvg);

  // Top expense category
  let topCat = '-';
  let topCatAmount = 0;
  Object.keys(expenseCatSums).forEach((k) => {
    if (expenseCatSums[k] > topCatAmount) {
      topCatAmount = expenseCatSums[k];
      topCat = k;
    }
  });
  const elTopCat = document.getElementById('stat-top-expense-category');
  const elTopCatAmt = document.getElementById('stat-top-expense-amount');
  if (elTopCat) elTopCat.textContent = topCat;
  if (elTopCatAmt) elTopCatAmt.textContent = topCatAmount > 0 ? formatRupiah(topCatAmount) : 'Rp 0';
}

// ========================================================
// 6. MODAL HANDLERS & FORM LOGIC
// ========================================================

let activeTransType = 'pengeluaran';

function openAddTransactionModal(defaultType = 'pengeluaran', defaultCategory = '') {
  activeTransType = defaultType;
  document.getElementById('modal-transaction-title').textContent = 'Catat Transaksi Baru';
  document.getElementById('trans-edit-id').value = '';
  document.getElementById('trans-amount').value = '';
  document.getElementById('trans-amount-preview').textContent = 'Nol rupiah';
  document.getElementById('trans-note').value = '';
  document.getElementById('trans-date').value = getLocalDateString();

  updateTransactionTypeButtons();
  updateCategoryDropdown(defaultCategory);
  updateGoalsDropdown();
  checkCategoryArisanInfo();
  openModal('modal-transaction');
}

function updateTransactionTypeButtons() {
  document.querySelectorAll('.trans-type-btn').forEach((btn) => {
    const type = btn.getAttribute('data-trans-type');
    if (type === activeTransType) {
      if (type === 'pengeluaran') btn.className = 'trans-type-btn py-2 text-xs font-semibold rounded-lg bg-rose-500 text-white transition';
      if (type === 'pemasukan') btn.className = 'trans-type-btn py-2 text-xs font-semibold rounded-lg bg-emerald-500 text-white transition';
      if (type === 'tabungan') btn.className = 'trans-type-btn py-2 text-xs font-semibold rounded-lg bg-violet-600 text-white transition';
    } else {
      btn.className = 'trans-type-btn py-2 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition';
    }
  });

  const wrapperGoal = document.getElementById('wrapper-trans-goal');
  if (wrapperGoal) {
    if (activeTransType === 'tabungan') {
      wrapperGoal.classList.remove('hidden');
    } else {
      wrapperGoal.classList.add('hidden');
    }
  }
}

function updateCategoryDropdown(selectedCategory = '') {
  const select = document.getElementById('trans-category');
  if (!select) return;

  const cats = CATEGORIES[activeTransType] || [];
  select.innerHTML = cats.map((c) => `
    <option value="${c.name}" ${c.name === selectedCategory ? 'selected' : ''}>
      ${c.icon} ${c.name}
    </option>
  `).join('');

  checkCategoryArisanInfo();
}

function checkCategoryArisanInfo() {
  const select = document.getElementById('trans-category');
  const pill = document.getElementById('info-arisan-pill');
  if (!select || !pill) return;

  const val = (select.value || '').toLowerCase();
  if (val.includes('arisan')) {
    pill.classList.remove('hidden');
  } else {
    pill.classList.add('hidden');
  }
}

function updateGoalsDropdown(selectedGoalId = '') {
  const select = document.getElementById('trans-goal-id');
  if (!select) return;

  let optionsHtml = '<option value="">Tabungan Umum (Tanpa Target Tertentu)</option>';
  goals.forEach((g) => {
    optionsHtml += `<option value="${g.id}" ${g.id === selectedGoalId ? 'selected' : ''}>${g.icon || '🎯'} ${g.name} (${formatRupiah(g.currentAmount)} / ${formatRupiah(g.targetAmount)})</option>`;
  });
  select.innerHTML = optionsHtml;
}

function editTransaction(id) {
  const tx = transactions.find((t) => t.id === id);
  if (!tx) return;

  activeTransType = tx.type;
  document.getElementById('modal-transaction-title').textContent = 'Edit Transaksi';
  document.getElementById('trans-edit-id').value = tx.id;
  document.getElementById('trans-amount').value = Number(tx.amount).toLocaleString('id-ID');
  document.getElementById('trans-amount-preview').textContent = formatTerbilangRingkas(tx.amount);
  document.getElementById('trans-note').value = tx.note || '';
  document.getElementById('trans-date').value = tx.date;

  updateTransactionTypeButtons();
  updateCategoryDropdown(tx.category);
  updateGoalsDropdown(tx.goalId || '');
  openModal('modal-transaction');
}

function deleteTransaction(id) {
  if (!confirm('Yakin ingin menghapus transaksi ini?')) return;

  const tx = transactions.find((t) => t.id === id);
  if (tx && tx.type === 'tabungan' && tx.goalId) {
    // Kurangi saldo dari target jika transaksi tabungan dihapus
    const g = goals.find((item) => item.id === tx.goalId);
    if (g) {
      g.currentAmount = Math.max(0, (Number(g.currentAmount) || 0) - (Number(tx.amount) || 0));
      saveGoals();
    }
  }

  transactions = transactions.filter((t) => t.id !== id);
  saveTransactions();
  renderAll();
  showToast('Transaksi berhasil dihapus');
}

// Modal Goals Handlers
function openAddGoalModal() {
  document.getElementById('modal-goal-title').textContent = 'Buat Target Tabungan Baru';
  document.getElementById('goal-edit-id').value = '';
  document.getElementById('goal-name').value = '';
  document.getElementById('goal-target-amount').value = '';
  document.getElementById('goal-initial-amount').value = '';
  document.getElementById('goal-deadline').value = '';
  openModal('modal-goal');
}

function editGoal(id) {
  const goal = goals.find((g) => g.id === id);
  if (!goal) return;

  document.getElementById('modal-goal-title').textContent = 'Edit Target Tabungan';
  document.getElementById('goal-edit-id').value = goal.id;
  document.getElementById('goal-name').value = goal.name;
  document.getElementById('goal-target-amount').value = Number(goal.targetAmount).toLocaleString('id-ID');
  document.getElementById('goal-initial-amount').value = Number(goal.currentAmount).toLocaleString('id-ID');
  document.getElementById('goal-deadline').value = goal.deadline || '';
  openModal('modal-goal');
}

function deleteGoal(id) {
  if (!confirm('Yakin ingin menghapus target tabungan ini?')) return;
  goals = goals.filter((g) => g.id !== id);
  saveGoals();
  renderAll();
  showToast('Target tabungan berhasil dihapus');
}

// Modal Setor Tabungan Cepat
function openDepositModal() {
  if (goals.length === 0) {
    alert('Buat target tabungan terlebih dahulu sebelum melakukan setoran!');
    openAddGoalModal();
    return;
  }
  const select = document.getElementById('deposit-goal-select');
  select.innerHTML = goals.map((g) => `
    <option value="${g.id}">${g.icon || '🎯'} ${g.name} (Terkumpul: ${formatRupiah(g.currentAmount)})</option>
  `).join('');
  document.getElementById('deposit-amount').value = '';
  document.getElementById('deposit-note').value = '';
  openModal('modal-deposit');
}

function openDepositForGoal(goalId) {
  openDepositModal();
  const select = document.getElementById('deposit-goal-select');
  if (select) select.value = goalId;
}

// Modal Open & Close Utility
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-content').forEach((el) => el.classList.add('hidden'));
  const activeContent = document.getElementById(tabId);
  if (activeContent) activeContent.classList.remove('hidden');

  // Update desktop tabs
  document.querySelectorAll('.nav-tab').forEach((tab) => {
    if (tab.getAttribute('data-tab') === tabId) {
      tab.className = 'nav-tab active flex items-center gap-2 py-2.5 px-4 text-sm font-medium border-b-2 border-pink-500 text-pink-400 transition';
    } else {
      tab.className = 'nav-tab flex items-center gap-2 py-2.5 px-4 text-sm font-medium border-b-2 border-transparent text-slate-400 hover:text-slate-200 transition';
    }
  });

  // Update mobile tabs
  document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'mobile-nav-btn active flex flex-col items-center justify-center py-1 text-pink-400 transition';
    } else {
      btn.className = 'mobile-nav-btn flex flex-col items-center justify-center py-1 text-slate-400 hover:text-slate-200 transition';
    }
  });

  // Resize charts if tab laporan opened
  if (tabId === 'tab-reports') {
    setTimeout(renderCharts, 100);
  }
}

// ========================================================
// 7. EVENT LISTENERS & FORM SUBMISSIONS
// ========================================================

function setupEventListeners() {
  // Navigation clicks (Desktop)
  document.querySelectorAll('.nav-tab').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // Navigation clicks (Mobile)
  document.querySelectorAll('.mobile-nav-btn').forEach((btn) => {
    btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab')));
  });

  // FAB button in mobile
  const fab = document.getElementById('btn-fab-add');
  if (fab) fab.addEventListener('click', () => openAddTransactionModal('pengeluaran'));

  // Header quick add button
  const btnHeaderAdd = document.getElementById('btn-open-add');
  if (btnHeaderAdd) btnHeaderAdd.addEventListener('click', () => openAddTransactionModal('pengeluaran'));

  // Type buttons inside Transaction Modal
  document.querySelectorAll('.trans-type-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      activeTransType = btn.getAttribute('data-trans-type');
      updateTransactionTypeButtons();
      updateCategoryDropdown();
    });
  });

  // Category change listener to toggle Arisan info pill
  const selectCat = document.getElementById('trans-category');
  if (selectCat) {
    selectCat.addEventListener('change', checkCategoryArisanInfo);
  }

  // Format rupiah inputs
  formatInputAsRupiah(document.getElementById('trans-amount'), document.getElementById('trans-amount-preview'));
  formatInputAsRupiah(document.getElementById('goal-target-amount'));
  formatInputAsRupiah(document.getElementById('goal-initial-amount'));
  formatInputAsRupiah(document.getElementById('deposit-amount'));

  // Submit Transaction Form
  const formTrans = document.getElementById('form-transaction');
  if (formTrans) {
    formTrans.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('trans-edit-id').value;
      const amount = parseNumericInput(document.getElementById('trans-amount').value);
      const category = document.getElementById('trans-category').value;
      const date = document.getElementById('trans-date').value;
      const note = document.getElementById('trans-note').value.trim();
      const goalId = activeTransType === 'tabungan' ? document.getElementById('trans-goal-id').value : null;

      if (!amount || amount <= 0) {
        alert('Mohon masukkan nominal uang yang valid!');
        return;
      }

      if (editId) {
        // Mode Edit
        const txIndex = transactions.findIndex((t) => t.id === editId);
        if (txIndex !== -1) {
          transactions[txIndex] = {
            id: editId,
            type: activeTransType,
            amount: amount,
            category: category,
            date: date,
            note: note,
            goalId: goalId
          };
        }
        showToast('Transaksi berhasil diperbarui!');
      } else {
        // Mode Tambah Baru
        const newTx = {
          id: 'tx-' + Date.now(),
          type: activeTransType,
          amount: amount,
          category: category,
          date: date,
          note: note,
          goalId: goalId
        };
        transactions.unshift(newTx);

        // Jika transaksi ini disetor ke target tabungan, tambahkan ke saldo target
        if (activeTransType === 'tabungan' && goalId) {
          const targetGoal = goals.find((g) => g.id === goalId);
          if (targetGoal) {
            targetGoal.currentAmount = (Number(targetGoal.currentAmount) || 0) + amount;
            saveGoals();
            checkGoalCompletion(targetGoal);
          }
        }
        showToast('Transaksi berhasil dicatat!');
      }

      saveTransactions();
      closeModal('modal-transaction');
      renderAll();
    });
  }

  // Submit Goal Form
  const formGoal = document.getElementById('form-goal');
  if (formGoal) {
    formGoal.addEventListener('submit', (e) => {
      e.preventDefault();
      const editId = document.getElementById('goal-edit-id').value;
      const name = document.getElementById('goal-name').value.trim();
      const targetAmount = parseNumericInput(document.getElementById('goal-target-amount').value);
      const initialAmount = parseNumericInput(document.getElementById('goal-initial-amount').value);
      const deadline = document.getElementById('goal-deadline').value;

      if (!name) {
        alert('Nama impian/target tabungan wajib diisi!');
        return;
      }
      if (!targetAmount || targetAmount <= 0) {
        alert('Target nominal wajib diisi!');
        return;
      }

      if (editId) {
        const g = goals.find((item) => item.id === editId);
        if (g) {
          g.name = name;
          g.targetAmount = targetAmount;
          g.currentAmount = initialAmount;
          g.deadline = deadline;
        }
        showToast('Target tabungan berhasil diupdate!');
      } else {
        const newGoal = {
          id: 'goal-' + Date.now(),
          name: name,
          targetAmount: targetAmount,
          currentAmount: initialAmount,
          deadline: deadline,
          color: '#8b5cf6',
          icon: pickRandomGoalIcon()
        };
        goals.push(newGoal);
        showToast('Target tabungan baru berhasil dibuat!');
      }

      saveGoals();
      closeModal('modal-goal');
      renderAll();
    });
  }

  // Submit Deposit Form
  const formDeposit = document.getElementById('form-deposit');
  if (formDeposit) {
    formDeposit.addEventListener('submit', (e) => {
      e.preventDefault();
      const goalId = document.getElementById('deposit-goal-select').value;
      const amount = parseNumericInput(document.getElementById('deposit-amount').value);
      const note = document.getElementById('deposit-note').value.trim();

      if (!amount || amount <= 0) {
        alert('Mohon masukkan nominal setoran yang valid!');
        return;
      }

      const targetGoal = goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      targetGoal.currentAmount = (Number(targetGoal.currentAmount) || 0) + amount;
      saveGoals();

      // Buat pencatatan transaksi jenis 'tabungan'
      const newTx = {
        id: 'tx-' + Date.now(),
        type: 'tabungan',
        amount: amount,
        category: 'Target Pembelian Impian',
        goalId: goalId,
        date: getLocalDateString(),
        note: note ? `Setor [${targetGoal.name}]: ${note}` : `Setoran tabungan [${targetGoal.name}]`
      };
      transactions.unshift(newTx);
      saveTransactions();

      closeModal('modal-deposit');
      renderAll();
      showToast(`Berhasil setor ${formatRupiah(amount)} ke [${targetGoal.name}]!`);
      checkGoalCompletion(targetGoal);
    });
  }

  // Filter Transactions Listeners
  const filterSearch = document.getElementById('filter-search');
  if (filterSearch) {
    filterSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderFullTransactionsList();
    });
  }

  const filterPeriod = document.getElementById('filter-period');
  if (filterPeriod) {
    filterPeriod.addEventListener('change', (e) => {
      currentPeriodFilter = e.target.value;
      renderFullTransactionsList();
    });
  }

  const filterCat = document.getElementById('filter-category');
  if (filterCat) {
    filterCat.addEventListener('change', (e) => {
      currentCategoryFilter = e.target.value;
      renderFullTransactionsList();
    });
  }

  document.querySelectorAll('.type-filter-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.type-filter-chip').forEach((c) => {
        c.className = 'type-filter-chip px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 transition';
      });
      chip.className = 'type-filter-chip px-3 py-1 rounded-full text-xs font-medium bg-emerald-500 text-white transition';
      currentFilterType = chip.getAttribute('data-type-filter');
      renderFullTransactionsList();
    });
  });

  // Modal Buka di HP (QR Code)
  const btnOpenHp = document.getElementById('btn-open-hp');
  if (btnOpenHp) {
    btnOpenHp.addEventListener('click', () => {
      setupQrCodeModal();
      openModal('modal-hp-connect');
    });
  }

  // Copy URL button
  const btnCopyUrl = document.getElementById('btn-copy-url');
  if (btnCopyUrl) {
    btnCopyUrl.addEventListener('click', () => {
      const urlInput = document.getElementById('phone-url-input');
      if (urlInput) {
        navigator.clipboard.writeText(urlInput.value).then(() => {
          showToast('Link berhasil disalin ke clipboard!');
        });
      }
    });
  }

  // Modal Backup & Restore
  const btnBackupModal = document.getElementById('btn-backup-modal');
  if (btnBackupModal) {
    btnBackupModal.addEventListener('click', () => openModal('modal-backup'));
  }

  // Export CSV
  const btnExportCsv = document.getElementById('btn-export-csv');
  if (btnExportCsv) {
    btnExportCsv.addEventListener('click', exportToCSV);
  }

  // Export JSON
  const btnExportJson = document.getElementById('btn-export-json');
  if (btnExportJson) {
    btnExportJson.addEventListener('click', exportToJSON);
  }

  // Import JSON
  const inputImportJson = document.getElementById('input-import-json');
  if (inputImportJson) {
    inputImportJson.addEventListener('change', importFromJSON);
  }

  // Force update / refresh cache
  const btnForceRefresh = document.getElementById('btn-force-refresh');
  if (btnForceRefresh) {
    btnForceRefresh.addEventListener('click', () => {
      showToast('Memperbarui aplikasi ke versi terbaru...');
      if ('caches' in window) {
        caches.keys().then((names) => {
          return Promise.all(names.map((name) => caches.delete(name)));
        }).then(() => {
          setTimeout(() => window.location.reload(true), 500);
        });
      } else {
        setTimeout(() => window.location.reload(true), 500);
      }
    });
  }

  // Reset Data
  const btnReset = document.getElementById('btn-reset-data');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('PERINGATAN: Apakah Anda yakin ingin mereset seluruh data catatan keuangan ke Rp 0?')) {
        transactions = [];
        goals = [];
        saveTransactions();
        saveGoals();
        closeModal('modal-backup');
        renderAll();
        showToast('Semua data berhasil dibersihkan menjadi Rp 0!');
      }
    });
  }

  // Close modals when clicking overlay background
  document.querySelectorAll('.modal-overlay').forEach((overlay) => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });
}

function pickRandomGoalIcon() {
  const icons = ['⭐', '📱', '🛵', '🚗', '🏠', '💻', '✈️', '💍', '🛡️', '🎓'];
  return icons[Math.floor(Math.random() * icons.length)];
}

function checkGoalCompletion(goal) {
  if (Number(goal.currentAmount) >= Number(goal.targetAmount)) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
    showToast(`🎉 SELAMAT! Target [${goal.name}] sudah 100% tercapai!`);
  }
}

// ========================================================
// 8. BUKA DI HP (QR CODE DENGAN IP LOKAL)
// ========================================================

function setupQrCodeModal() {
  // Gunakan IP lokal yang terdeteksi
  const detectedHost = window.location.hostname && window.location.hostname !== '' ? window.location.hostname : '10.20.32.179';
  const detectedPort = window.location.port || '8888';
  const targetUrl = `http://${detectedHost}:${detectedPort}`;

  const urlInput = document.getElementById('phone-url-input');
  if (urlInput) urlInput.value = targetUrl;

  // Render QR Code via SVG/Canvas atau API terpercaya
  const qrImg = document.getElementById('qr-code-img');
  if (qrImg) {
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(targetUrl)}&margin=8`;
  }
}

// ========================================================
// 9. EKSPOR & IMPOR DATA
// ========================================================

function exportToCSV() {
  if (transactions.length === 0) {
    alert('Belum ada data transaksi untuk diekspor!');
    return;
  }

  let csvContent = '\uFEFF'; // BOM untuk Excel
  csvContent += 'ID;Tanggal;Jenis;Kategori;Nominal;Keterangan\n';

  transactions.forEach((t) => {
    const row = [
      t.id,
      t.date,
      t.type,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.note || '').replace(/"/g, '""')}"`
    ];
    csvContent += row.join(';') + '\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Tabunganku_Laporan_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('File CSV berhasil diunduh!');
}

function exportToJSON() {
  const backupData = {
    appName: 'Tabunganku',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    transactions: transactions,
    goals: goals
  };

  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `Backup_Tabunganku_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Cadangan data JSON berhasil diunduh!');
}

function importFromJSON(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (Array.isArray(parsed.transactions) && Array.isArray(parsed.goals)) {
        transactions = parsed.transactions;
        goals = parsed.goals;
        saveTransactions();
        saveGoals();
        renderAll();
        closeModal('modal-backup');
        showToast('Data berhasil dipulihkan dari cadangan!');
      } else {
        alert('Format file JSON cadangan tidak sesuai!');
      }
    } catch (err) {
      alert('Gagal membaca file JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// ========================================================
// 10. INISIALISASI & SERVICE WORKER
// ========================================================

document.addEventListener('DOMContentLoaded', () => {
  loadState();
  setupEventListeners();
  renderAll();

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.log('SW registration note:', err);
    });
  }
});
