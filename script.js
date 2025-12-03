let target = generateRandom8();
let mining = false;
let balance = 0;
let interval;
let timeout;

document.getElementById("target").innerText = target;

function generateRandom8() {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
}

document.getElementById("startBtn").onclick = start;

function start() {
    if (mining) return;
    mining = true;

    interval = setInterval(() => {
        let cur = Math.floor(Math.random() * 100000000).toString().padStart(8, "0");
        document.getElementById("try").innerText = cur;
    }, 25);

    let time = 300000 + Math.random() * 300000; // 5-10 мин

    timeout = setTimeout(() => {
        finish();
    }, time);
}

function finish() {
    mining = false;
    clearInterval(interval);

    balance += 10;
    document.getElementById("balance").innerText = balance;

    target = generateRandom8();
    document.getElementById("target").innerText = target;
}

document.getElementById("withdrawBtn").onclick = () => {
    const sh = balance * 240;
    document.getElementById("modalText").innerHTML =
        `Вы вывели <b>${balance} CHC</b><br>Это <b>${sh}</b> шиллингов`;

    balance = 0;
    document.getElementById("balance").innerText = balance;

    document.getElementById("modal").style.display = "block";
};

function closeModal() {
    document.getElementById("modal").style.display = "none";
}