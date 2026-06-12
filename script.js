(() => {
  const state = {
    current: '0',
    previous: null,
    operator: null,
    justEquals: false,
    justOp: false,
  };

  const display = document.getElementById('display');
  const expression = document.getElementById('expression');
  const history = document.getElementById('history');
  const buttons = document.querySelectorAll('button');

  function formatNumber(str) {
    if (str === 'Error' || str === 'Infinity' || str === '-Infinity') return str;
    const num = Number(str);
    if (isNaN(num)) return str;
    if (Math.abs(num) > 1e12 || (Math.abs(num) < 1e-7 && num !== 0)) {
      return num.toExponential(6);
    }
    const [intPart, decPart] = str.split('.');
    const formattedInt = Number(intPart).toLocaleString('en-US');
    return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
  }

  function updateDisplay() {
    const val = state.current;
    display.textContent = formatNumber(val);
    const length = display.textContent.length;
    if (length > 14) {
      display.style.fontSize = '24px';
    } else if (length > 10) {
      display.style.fontSize = '32px';
    } else {
      display.style.fontSize = '48px';
    }
    if (state.operator && state.previous !== null) {
      expression.textContent = `${formatNumber(state.previous)} ${state.operator}`;
    } else {
      expression.textContent = '';
    }
  }

  function highlightOperator(op) {
    buttons.forEach(b => {
      if (b.dataset.action === 'operator') {
        b.classList.toggle('active', b.dataset.value === op && state.justOp);
      }
    });
  }

  function inputDigit(digit) {
    if (state.justEquals) {
      state.current = digit;
      state.previous = null;
      state.operator = null;
      state.justEquals = false;
    } else if (state.justOp) {
      state.current = digit;
      state.justOp = false;
    } else {
      state.current = (state.current === '0' && digit !== '.') ? digit : state.current + digit;
    }
  }

  function inputDecimal() {
    if (state.justEquals || state.justOp) {
      state.current = '0.';
      state.justEquals = false;
      state.justOp = false;
      return;
    }
    if (!state.current.includes('.')) state.current += '.';
  }

  function setOperator(op) {
    if (state.operator && !state.justOp) calculate(false);
    state.previous = state.current;
    state.operator = op;
    state.justOp = true;
    state.justEquals = false;
  }

  function calculate(final = true) {
    if (!state.operator || state.previous === null) return;
    const a = parseFloat(state.previous);
    const b = parseFloat(state.current);
    let result;
    switch (state.operator) {
      case '+': result = a + b; break;
      case '−': result = a - b; break;
      case '×': result = a * b; break;
      case '÷': result = b === 0 ? 'Error' : a / b; break;
      default: return;
    }
    if (result !== 'Error') {
      result = parseFloat(result.toPrecision(12));
    }
    if (final) {
      history.textContent = `${formatNumber(state.previous)} ${state.operator} ${formatNumber(state.current)} =`;
      state.operator = null;
      state.previous = null;
      state.justEquals = true;
      state.justOp = false;
    }
    state.current = String(result);
  }

  function toggleSign() {
    if (state.current === '0' || state.current === 'Error') return;
    state.current = state.current.startsWith('-') ? state.current.slice(1) : '-' + state.current;
  }

  function applyPercent() {
    if (state.current === 'Error') return;
    state.current = String(parseFloat(state.current) / 100);
  }

  function clear() {
    state.current = '0';
    state.previous = null;
    state.operator = null;
    state.justEquals = false;
    state.justOp = false;
    history.textContent = '';
    expression.textContent = '';
  }

  function createRipple(e, btn) {
    const r = btn.getBoundingClientRect();
    const size = Math.max(r.width, r.height);
    const x = e.clientX - r.left - size / 2;
    const y = e.clientY - r.top - size / 2;
    const span = document.createElement('span');
    span.className = 'ripple';
    span.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
    btn.appendChild(span);
    span.addEventListener('animationend', () => span.remove());
  }

  function handleBackspace() {
    if (state.justEquals || state.justOp) return;
    if (state.current.length > 1) {
      state.current = state.current.slice(0, -1);
      if (state.current === '-') state.current = '0';
    } else {
      state.current = '0';
    }
  }

  document.querySelector('.buttons').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    createRipple(e, btn);
    const { action, value } = btn.dataset;
    switch (action) {
      case 'digit': inputDigit(value); break;
      case 'decimal': inputDecimal(); break;
      case 'operator': setOperator(value); break;
      case 'equals': calculate(true); break;
      case 'clear': clear(); break;
      case 'sign': toggleSign(); break;
      case 'percent': applyPercent(); break;
      case 'backspace': handleBackspace(); break;
    }
    updateDisplay();
    highlightOperator(state.operator);
  });

  const keyMap = {
    '0':'0','1':'1','2':'2','3':'3','4':'4','5':'5','6':'6','7':'7','8':'8','9':'9',
    '.':'.',',':'.','+':'+','-':'−','*':'×','/':'÷','x':'×','Enter':'=','=':'=',
    'Backspace':'backspace','Escape':'clear','Delete':'clear','c':'clear','C':'clear','%':'%',
  };

  document.addEventListener('keydown', e => {
    const mapped = keyMap[e.key];
    if (!mapped) return;
    e.preventDefault();
    if ('0123456789'.includes(mapped)) inputDigit(mapped);
    else if (mapped === '.') inputDecimal();
    else if ('+-−×÷'.includes(mapped)) setOperator(mapped);
    else if (mapped === '=') calculate(true);
    else if (mapped === 'clear') clear();
    else if (mapped === 'backspace') handleBackspace();
    else if (mapped === '%') applyPercent();
    updateDisplay();
    highlightOperator(state.operator);
  });

  updateDisplay();
})();