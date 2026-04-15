const MY_EMAIL = "slimes.upon-7k@icloud.com";
const CSV_URL = "ТВОЯ_ССЫЛКА_CSV"; 

function toggleTheme() {
    const b = document.body;
    b.setAttribute('data-theme', b.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

function openTab(name) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('section-' + name).classList.add('active');
    document.getElementById('btn-' + name).classList.add('active');
    document.getElementById('copy-box').style.display = 'none';
}

function toggleAddr() {
    const val = document.getElementById('method').value;
    document.getElementById('addr-fields').classList.toggle('hidden', val === "0");
    calculate();
}

function calculate() {
    let total = parseFloat(document.getElementById('tariff').value);
    const weight = parseFloat(document.getElementById('weight').value) || 0;
    const orderSum = parseFloat(document.getElementById('orderSum').value) || 0;
    const isUni = document.getElementById('tariff').options[document.getElementById('tariff').selectedIndex].id === 'universal-opt';
    
    // Лимит веса
    const limit = isUni ? 10000 : 3000;
    document.getElementById('w-label').innerText = `Вес (г): [Макс ${limit/1000}кг]`;
    document.getElementById('btn-del-main').disabled = weight > limit;

    // Страхование
    const ins = document.getElementById('insurance').value;
    if (ins === 'initial') total += Math.floor(orderSum / 5) * 1;
    if (ins === 'basic') total += Math.floor(orderSum / 10) * 3;
    if (ins === 'full') total += (weight / 10) * 5;
    if (ins === 'delivery') total += (weight / 15) * 2;

    // Документы
    const doc = document.getElementById('docs').value;
    if (doc === 'schengen') total += 1;
    if (doc === 'west') total += 1.5;
    if (doc === 'other') { total += 1; total += (orderSum * 0.18); }
    if (doc === 'none') total += 2.5;

    // Доп услуги и способ получения
    document.querySelectorAll('.extra:checked').forEach(e => total += parseFloat(e.value));
    total += parseFloat(document.getElementById('method').value);

    document.getElementById('total-del').innerText = total.toFixed(2);
}

function calcTrans() {
    const amt = parseFloat(document.getElementById('trans-amount').value) || 0;
    const fee = Math.max(5, amt * 0.05);
    document.getElementById('total-trans').innerText = (amt - fee).toFixed(2);
}

async function checkTrackFromSheet() {
    const track = document.getElementById('track-input').value.trim();
    const res = document.getElementById('track-status-res');
    if(!track) return;
    res.innerText = "🔍 Проверка...";
    try {
        const r = await fetch(CSV_URL);
        const data = await r.text();
        const rows = data.split('\n').map(row => row.split(','));
        const found = rows.find(row => row[0].trim() === track);
        if(found) {
            res.style.color = "var(--success)";
            res.innerText = "СТАТУС: " + found[1];
        } else {
            res.style.color = "var(--danger)";
            res.innerText = "ТРЕК НЕ НАЙДЕН";
        }
    } catch(e) { res.innerText = "Ошибка базы."; }
}

function processOrder(type) {
    const user = prompt("Ваш Email:");
    if(!user) return;
    let msg = "";
    if(type === 'delivery') {
        const t = document.getElementById('tariff').options[document.getElementById('tariff').selectedIndex].text;
        msg = `Добрый день!\nМне необходимо отправить посылку через тариф ${t}.\n\nС уважением, ${user}`;
    } else {
        msg = `Заявка на перевод\nСумма: $${document.getElementById('trans-amount').value}\nКуда: ${document.getElementById('trans-country').value}\nКонтакт: ${user}`;
    }
    document.getElementById('email-text').innerText = msg;
    document.getElementById('copy-box').style.display = 'block';
    window.location.href = `mailto:${MY_EMAIL}?subject=Order&body=${encodeURIComponent(msg)}`;
}

function copyResult() {
    navigator.clipboard.writeText(document.getElementById('email-text').innerText);
    alert("Скопировано!");
}

calculate(); calcTrans();
