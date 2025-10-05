
/* ---------- Elements ---------- */
const display = document.getElementById('display');
const startBtn = document.getElementById('startBtn');
const stopBtn  = document.getElementById('stopBtn');
const resetBtn = document.getElementById('resetBtn');
const lapBtn   = document.getElementById('lapBtn');
const lapsList = document.getElementById('lapsList');
const themeToggle = document.getElementById('themeToggle');

/* ---------- State Variables ---------- */
let timerInterval = null;      
let startTime = 0;             
let elapsedBefore = 0;         
let isRunning = false;         
let lapCount = 0;

/* ---------- Helpers ---------- */

/**
 * formatTime
 * @param {number} ms - elapsed milliseconds
 * returns string HH:MM:SS.CS  (centiseconds)
 */
function formatTime(ms) {
  const totalCentis = Math.floor(ms / 10); 
  const centis = String(totalCentis % 100).padStart(2, '0'); 
  const totalSeconds = Math.floor(totalCentis / 100);
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');

  return `${hours}:${minutes}:${seconds}.${centis}`;
}

/**
 * updateDisplayFromElapsed
 * Use elapsedBefore + (now - startTime) if running
 */
function updateDisplay() {
  const now = Date.now();
  const elapsed = (isRunning) ? (elapsedBefore + (now - startTime)) : elapsedBefore;
  display.textContent = formatTime(elapsed);
}

/* ----------  Controls ---------- */

/* Start */
startBtn.addEventListener('click', () => {
  if (isRunning) return; // prevent multiple timers

  // mark start time and start interval
  startTime = Date.now();
  isRunning = true;
  timerInterval = setInterval(updateDisplay, 30); // 30ms for smooth centiseconds

  // UI state
  startBtn.disabled = true;
  stopBtn.disabled = false;
  resetBtn.disabled = false;
  lapBtn.disabled = false;
});

/* Stop (pause) */
stopBtn.addEventListener('click', () => {
  if (!isRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  // accumulate elapsed
  elapsedBefore = elapsedBefore + (Date.now() - startTime);
  isRunning = false;

  // UI state
  startBtn.disabled = false;
  stopBtn.disabled = true;
  lapBtn.disabled = true;
});

/* Reset */
resetBtn.addEventListener('click', () => {
  // stop timer if running
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
  isRunning = false;
  startTime = 0;
  elapsedBefore = 0;
  lapCount = 0;

  // clear display & laps
  display.textContent = '00:00:00.00';
  lapsList.innerHTML = '';

  // UI state
  startBtn.disabled = false;
  stopBtn.disabled = true;
  resetBtn.disabled = true;
  lapBtn.disabled = true;
});

/* Lap */
lapBtn.addEventListener('click', () => {
  // only record lap while running
  const nowElapsed = elapsedBefore + (isRunning ? (Date.now() - startTime) : 0);
  const formatted = formatTime(nowElapsed);
  lapCount += 1;
  const li = document.createElement('li');
  li.innerHTML = `<span>Lap ${lapCount}</span><span>${formatted}</span>`;
  // prepend newest lap to top
  lapsList.prepend(li);
});

/* ---------- Theme Toggle ---------- */

/**
 * applyTheme(theme)
 * theme: 'light' or 'dark'
 */
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeToggle.textContent = '🌙';
  } else {
    document.documentElement.removeAttribute('data-theme');
    themeToggle.textContent = '☀️';
  }
  // persist choice
  localStorage.setItem('stopwatch-theme', theme);
}

// Init theme from localStorage (or system preference)
(function initTheme() {
  const saved = localStorage.getItem('stopwatch-theme');
  if (saved) {
    applyTheme(saved);
  } else {
    // fallback: prefer dark if OS prefers dark
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    applyTheme(prefersDark ? 'dark' : 'light');
  }
})();

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

/* ---------- Utility: keep display updated when not running ----------
   This ensures display stays showing correct elapsed time if user navigates away
   but we still keep a recent shown value. 
---------------------------------------------------------------------*/
setInterval(() => {
  if (isRunning) updateDisplay();
}, 200);
