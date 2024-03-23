const months = 'Январь Февраль Март Апрель Май Июнь Июль Август Сентябрь Октябрь Ноябрь Декабрь'.split(' ');
const days = 'Пн Вт Ср Чт Пт Сб Вс'.split(' ');

function init() {
  const { year, month } = document.forms[0];

  const y0 = new Date().getFullYear();
  for (let y = -5; y < 6; y++) {
    const opt = document.createElement('option');
    opt.value = y0 + y; opt.text = y0 + y;
    year.appendChild(opt);
  }
  year.value = y0;

  months.forEach((m, i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.text = m + ' - ' + (months[i + 3] || months[i - 9] + ' след. года');
    month.appendChild(opt);
  });
  month.value = new Date().getMonth();
}

function calendar() {
  const year = parseInt(document.forms[0].year.value);
  const month = parseInt(document.forms[0].month.value);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  draw(svg, year, month);
  const body = document.getElementsByTagName('body')[0];
  body.innerHTML = '';
  body.appendChild(svg);
}

/**
 * Календарь на 4 месяца
 * @param {SVGElement} svg
 * @param {number} year
 * @param {number} month
 */
function draw(svg, year, month) {
  const [ width, height ] = [210, 297];
  const padding = {left: 15, top: 10, right: 10, bottom: 10};

  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;

  const box1 = {x: 0, y: 0, width: h / 2, height: w / 2};
  const box2 = {x: h / 2, y: 0, width: h / 2, height: w / 2};
  const box3 = {x: 0, y: w / 2, width: h / 2, height: w / 2};
  const box4 = {x: h / 2, y: w / 2, width: h / 2, height: w / 2};

  const s = svg.style;
  s.position = 'fixed'; s.left = padding.left + 'mm'; s.top = padding.top + 'mm';
  s.width = w + 'mm'; s.height = h + 'mm';

  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.innerHTML = `<g transform="translate(${w}, 0) rotate(90)">`
    + `<rect x="0" y="0" width="${h}" height="${w}" stroke="lightgray" stroke-width=".2" stroke-dasharray="3" fill="none" />`
    + `<line x1="${h / 2}" y1="0" x2="${h / 2}" y2="${w}" stroke="lightgray" stroke-width=".2" stroke-dasharray="3" />`
    + `<line x1="0" y1="${w / 2}" x2="${h}" y2="${w / 2}" stroke="lightgray" stroke-width=".2" stroke-dasharray="3" />`
    + drawMonth(year, month, box1) + drawMonth(year, ++month, box2)
    + drawMonth(year, ++month, box3) + drawMonth(year, ++month, box4)
    + '</g>';
}

function drawMonth(year, month, box) {
  const delta = 3;
  if (month > 11) { year++; month -= 12; }
  
  box.x += delta; box.width -= 2 * delta;
  box.y += delta; box.height -= 2 * delta;
  const d = box.height / 8;
  box.y += d; box.height -= d;
  
  const firstDate = new Date(year, month, 1);
  const lastDate = new Date(year, month + 1, 0);
  const daysInMonth = lastDate.getDate();
  let weeks = Math.ceil(daysInMonth / 7);

  let firstDay = firstDate.getDay() || 7;
  let lastDay = lastDate.getDay() || 7;
  if (daysInMonth === 28 && firstDay > 1) weeks++;

  let squeezeFirst = firstDay === 7;
  let squeezeLast = lastDay === 1;

  if (squeezeFirst && squeezeLast) weeks--;

  let fontSize = d * 0.5;

  let l = [];

  l.push(`\n<g fill="none" stroke="black" stroke-width=".1">`);
  l.push(`<rect x="${box.x}" y="${box.y}" width="${box.width}" height="${box.height}" />`);

  l.push(`<rect x="${box.x}" y="${box.y}" width="${d}" height="${box.height}" fill="lightgray" />`);

  for (let i = 1; i <= weeks + 1; i++) {
    let x = box.x + i * d;
    l.push(`<line x1="${x}" y1="${box.y}" x2="${x}" y2="${box.y + box.height}" />`);
  }

  for (let i = 1; i < 8; i++) {
    let y = box.y + i * d;
    l.push(`<line x1="${box.x}" y1="${y}" x2="${box.x + box.width}" y2="${y}" />`);
  }

  l.push('</g>\n')

  l.push(`<g fill="black" stroke="none" font-size="${fontSize}">`);

  l.push(`<text x="${box.x + box.width / 2}" y="${box.y - d / 2}">${months[month]}</text>`);
  for (let i = 1; i < 8; i++) {
    l.push(`<text x="${box.x + d / 2}" y="${box.y + i * d - d/2}">${days[i - 1]}</text>`);
  }
  
  let week = 1, day = firstDay, date = 1;
  const drawDay = () => {
    let squeeze = false, skip = false, date1, date2;
    if (squeezeFirst && (date === 1 || date === 8)) {
      squeeze = true; date1 = 1; date2 = 8; skip = date === 1;
    } else if (squeezeLast && (date === daysInMonth || date === daysInMonth - 7)) {
      squeeze = true; date1 = daysInMonth - 7; date2 = daysInMonth; skip = date === daysInMonth;
    }
    if (skip) {
      /* do nothing */
    } else if (squeeze) {
      let x = box.x + week * d, y = box.y + (day - 1) * d;
      l.push(`<line x1="${x}" y1="${y + d}" x2="${x + d}" y2="${y}" stroke="black" stroke-width=".1" />`);
      x += d / 2; y += d / 2;
      l.push(`<text x="${x - d / 5}" y="${y - d / 5}" font-size="${fontSize * .8}">${date1}</text>`);
      l.push(`<text x="${x + d / 5}" y="${y + d / 5}" font-size="${fontSize * .8}">${date2}</text>`);
    } else {
      l.push(`<text x="${box.x + d / 2 + week * d}" y="${box.y + d / 2 + (day - 1) * d}">${date}</text>`);
    }
    date++;
    if (++day === 8) {
      day = 1;
      if (!skip) week++;
    }
  };

  for (let i = 1; i <= daysInMonth; i++) drawDay();

  l.push('</g>\n')

  return l.join('');
}
