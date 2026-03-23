// ----- Хранение товаров в localStorage -----
let products = [];

// Загрузка товаров из localStorage
function loadProducts() {
    const saved = localStorage.getItem('shop_products');
    if (saved) {
        products = JSON.parse(saved);
    } else {
        // Товары по умолчанию
        products = [
            { id: 1, name: "Смартфон X200", price: 499.99 },
            { id: 2, name: "Беспроводные наушники", price: 89.99 },
            { id: 3, name: "Ноутбук UltraBook", price: 1199.00 },
            { id: 4, name: "Фитнес-браслет", price: 39.99 },
            { id: 5, name: "Портативная колонка", price: 59.99 }
        ];
        saveProducts();
    }
}

function saveProducts() {
    localStorage.setItem('shop_products', JSON.stringify(products));
}

let cart = [];

// ----- Админ-панель -----
function renderAdminProducts() {
    const container = document.getElementById('adminProductsList');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p>Нет товаров. Добавьте первый!</p>';
        return;
    }
    
    container.innerHTML = '';
    products.forEach(product => {
        const div = document.createElement('div');
        div.className = 'admin-product-item';
        div.innerHTML = `
            <span><strong>${product.name}</strong> - $${product.price.toFixed(2)}</span>
            <button onclick="deleteProduct(${product.id})">🗑️ Удалить</button>
        `;
        container.appendChild(div);
    });
}

function addProduct() {
    const nameInput = document.getElementById('productName');
    const priceInput = document.getElementById('productPrice');
    
    const name = nameInput.value.trim();
    const price = parseFloat(priceInput.value);
    
    if (!name || isNaN(price) || price <= 0) {
        alert('Введите корректное название и цену!');
        return;
    }
    
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 6;
    products.push({ id: newId, name: name, price: price });
    saveProducts();
    
    nameInput.value = '';
    priceInput.value = '';
    
    renderAdminProducts();
    renderProducts();
    showSimpleNotify(`✅ Товар "${name}" добавлен!`);
}

function deleteProduct(id) {
    if (confirm('Удалить этот товар?')) {
        products = products.filter(p => p.id !== id);
        saveProducts();
        
        // Удаляем товар из корзины, если он там был
        cart = cart.filter(item => item.id !== id);
        
        renderAdminProducts();
        renderProducts();
        updateCartUI();
        showSimpleNotify(`🗑️ Товар удален`);
    }
}

// ----- Отображение каталога -----
function renderProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (products.length === 0) {
        container.innerHTML = '<p style="text-align:center; grid-column:1/-1;">Товаров пока нет. Добавьте их в админ-панели!</p>';
        return;
    }
    
    container.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <div class="product-title">${escapeHtml(product.name)}</div>
            <div class="product-price">$${product.price.toFixed(2)}</div>
            <button data-id="${product.id}">Добавить в корзину</button>
        `;
        container.appendChild(card);
    });
    
    document.querySelectorAll('.product-card button').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            const product = products.find(p => p.id === id);
            if (product) addToCart(product);
        });
    });
}

function escapeHtml(str) {
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function addToCart(product) {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    updateCartUI();
    showSimpleNotify(`✅ ${product.name} добавлен в корзину`);
}

function updateCartUI() {
    const cartItemsContainer = document.getElementById('cartItemsList');
    const cartCountSpan = document.getElementById('cartCount');
    const cartTotalSpan = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p class="empty-cart">Корзина пуста</p>';
        if (cartCountSpan) cartCountSpan.innerText = '0';
        if (cartTotalSpan) cartTotalSpan.innerText = 'Итого: $0.00';
        return;
    }
    
    let total = 0;
    let itemsHtml = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        itemsHtml += `
            <div class="cart-item">
                <span>${escapeHtml(item.name)} x${item.quantity}</span>
                <span>$${itemTotal.toFixed(2)} 
                    <button class="remove-item" data-id="${item.id}">🗑️</button>
                </span>
            </div>
        `;
    });
    cartItemsContainer.innerHTML = itemsHtml;
    if (cartCountSpan) cartCountSpan.innerText = cart.reduce((sum, i) => sum + i.quantity, 0);
    if (cartTotalSpan) cartTotalSpan.innerText = `Итого: $${total.toFixed(2)}`;
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            cart = cart.filter(item => item.id !== id);
            updateCartUI();
        });
    });
}

function getCartTotalPrice() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

function calculateInsuranceCost(insuranceValue, orderTotal) {
    if (insuranceValue.includes('Без страхования')) return 0;
    if (insuranceValue.includes('Начальное страхование')) {
        return Math.ceil(orderTotal / 5) * 1;
    }
    if (insuranceValue.includes('Базовое страхование')) {
        return Math.ceil(orderTotal / 10) * 3;
    }
    if (insuranceValue.includes('Полное страхование')) {
        const totalWeightGrams = cart.reduce((w, item) => w + (item.quantity * 150), 0);
        return Math.ceil(totalWeightGrams / 10) * 5;
    }
    if (insuranceValue.includes('Страхование доставки')) {
        const totalWeightGrams = cart.reduce((w, item) => w + (item.quantity * 150), 0);
        return Math.ceil(totalWeightGrams / 15) * 2;
    }
    return 0;
}

function getExtraServicesCost() {
    let total = 0;
    const checkboxes = document.querySelectorAll('#extraServices input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        const val = cb.value;
        if (val.includes(':')) {
            const parts = val.split(':');
            const costPart = parts[1];
            if (costPart.includes('_black_white')) {
                total += 5;
            } else if (costPart.includes('_color_digital')) {
                total += 8;
            } else {
                const cost = parseFloat(costPart);
                if (!isNaN(cost)) total += cost;
            }
        }
    });
    return total;
}

function getExtraServicesNames() {
    let names = [];
    const checkboxes = document.querySelectorAll('#extraServices input[type="checkbox"]:checked');
    checkboxes.forEach(cb => {
        let raw = cb.value;
        let namePart = raw.split(':')[0];
        if (raw.includes('_black_white')) namePart = '3 Фотографии (ч/б физический)';
        if (raw.includes('_color_digital')) namePart = '3 Фотографии (цветной цифровой)';
        names.push(namePart);
    });
    return names;
}

// Формирование текста заказа
function buildOrderMessage() {
    const deliverySelect = document.getElementById('deliveryTariff');
    const selectedDelivery = deliverySelect.options[deliverySelect.selectedIndex].text;
    const deliveryPrice = parseFloat(deliverySelect.value.split(':')[1]);
    
    const insuranceSelect = document.getElementById('insurance');
    const insuranceText = insuranceSelect.options[insuranceSelect.selectedIndex].text;
    const insuranceRaw = insuranceSelect.value;
    
    const methodSelect = document.getElementById('deliveryMethod');
    const methodText = methodSelect.options[methodSelect.selectedIndex].text;
    const methodPrice = parseFloat(methodSelect.value.split(':')[1]);
    
    const docSelect = document.getElementById('documentType');
    const docText = docSelect.options[docSelect.selectedIndex].text;
    const docRaw = docSelect.value;
    
    const cartTotal = getCartTotalPrice();
    let insuranceCost = calculateInsuranceCost(insuranceRaw, cartTotal);
    const extraCost = getExtraServicesCost();
    let docCost = 0;
    let taxInfo = '';
    
    if (docRaw.includes('with_tax')) {
        docCost = 1;
        const subtotal = cartTotal + deliveryPrice + insuranceCost + extraCost + methodPrice;
        const tax15 = subtotal * 0.15;
        const tax3 = subtotal * 0.03;
        taxInfo = ` (налоги: 15% = $${tax15.toFixed(2)}, 3% = $${tax3.toFixed(2)})`;
        docCost = 1 + tax15 + tax3;
    } else if (docRaw.includes(':')) {
        let val = docRaw.split(':')[1];
        if (val === '1-5') docCost = 3;
        else docCost = parseFloat(val);
        if (isNaN(docCost)) docCost = 0;
    }
    
    const totalOrder = cartTotal + deliveryPrice + insuranceCost + extraCost + methodPrice + docCost;
    
    let message = `🛎️ НОВЫЙ ЗАКАЗ!\n\n`;
    message += `📦 ТОВАРЫ:\n`;
    cart.forEach(item => {
        message += `   • ${item.name} x${item.quantity} — $${(item.price * item.quantity).toFixed(2)}\n`;
    });
    message += `\n💰 Сумма товаров: $${cartTotal.toFixed(2)}`;
    
    message += `\n\n🚚 ТАРИФ ДОСТАВКИ: ${selectedDelivery} — $${deliveryPrice.toFixed(2)}`;
    message += `\n🛡️ СТРАХОВАНИЕ: ${insuranceText} — $${insuranceCost.toFixed(2)}`;
    
    const extraNames = getExtraServicesNames();
    if (extraNames.length) {
        message += `\n✨ ДОП. УСЛУГИ: ${extraNames.join(', ')} — +$${extraCost.toFixed(2)}`;
    } else {
        message += `\n✨ ДОП. УСЛУГИ: не выбраны`;
    }
    
    message += `\n📦 СПОСОБ ПОЛУЧЕНИЯ: ${methodText} — $${methodPrice.toFixed(2)}`;
    message += `\n📄 ОФОРМЛЕНИЕ: ${docText} — $${docCost.toFixed(2)}${taxInfo}`;
    
    message += `\n\n💵 ИТОГО К ОПЛАТЕ: $${totalOrder.toFixed(2)}`;
    message += `\n\n📧 Уведомление отправлено на: zeleninsasha2012@icloud.com`;
    
    return message;
}

// Отправка на email (через FormSubmit.co - бесплатный сервис)
function sendEmailNotification(message) {
    return new Promise((resolve, reject) => {
        // Используем FormSubmit.co бесплатно
        const formData = new FormData();
        formData.append('email', 'zeleninsasha2012@icloud.com');
        formData.append('subject', '🛍️ НОВЫЙ ЗАКАЗ В МАГАЗИНЕ');
        formData.append('message', message);
        
        fetch('https://formsubmit.co/ajax/zeleninsasha2012@icloud.com', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (response.ok) {
                resolve(true);
            } else {
                reject(false);
            }
        })
        .catch(error => {
            console.error('Email error:', error);
            reject(false);
        });
    });
}

// Тестовое письмо
function sendTestEmail() {
    const testMessage = `🧪 ТЕСТОВОЕ УВЕДОМЛЕНИЕ\n\nЭто тестовое письмо для проверки работы уведомлений.\n\nВремя: ${new Date().toLocaleString()}\n\nЕсли вы получили это письмо, значит уведомления работают правильно!`;
    
    sendEmailNotification(testMessage)
        .then(() => {
            showSimpleNotify('✅ Тестовое письмо отправлено! Проверьте почту');
        })
        .catch(() => {
            showSimpleNotify('⚠️ Не удалось отправить тестовое письмо. Скопируйте уведомление вручную.');
        });
}

// Показать модальное окно
function showModal(message) {
    const modal = document.getElementById('notificationModal');
    const modalMessage = document.getElementById('modalMessage');
    
    modalMessage.innerText = message;
    modal.style.display = 'block';
    
    // Копирование в буфер
    document.getElementById('copyToClipboardBtn').onclick = () => {
        navigator.clipboard.writeText(message).then(() => {
            showSimpleNotify('📋 Уведомление скопировано в буфер!');
        });
    };
    
    document.getElementById('closeModalBtn').onclick = () => {
        modal.style.display = 'none';
    };
    
    document.querySelector('.close').onclick = () => {
        modal.style.display = 'none';
    };
    
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

// Оформление заказа
async function checkout() {
    if (cart.length === 0) {
        alert('Корзина пуста! Добавьте товары.');
        return;
    }
    
    const message = buildOrderMessage();
    
    // Показываем модальное окно
    showModal(message);
    
    // Отправляем на email
    showSimpleNotify('📧 Отправка уведомления на почту...');
    
    try {
        await sendEmailNotification(message);
        showSimpleNotify('✅ Уведомление отправлено на zeleninsasha2012@icloud.com');
    } catch (error) {
        showSimpleNotify('⚠️ Не удалось отправить email. Но уведомление скопировано в буфер!');
        navigator.clipboard.writeText(message);
    }
    
    // Очищаем корзину после заказа
    cart = [];
    updateCartUI();
}

function showSimpleNotify(msg) {
    const notif = document.createElement('div');
    notif.innerText = msg;
    notif.style.position = 'fixed';
    notif.style.bottom = '20px';
    notif.style.right = '20px';
    notif.style.backgroundColor = '#2c7a4d';
    notif.style.color = 'white';
    notif.style.padding = '12px 24px';
    notif.style.borderRadius = '40px';
    notif.style.zIndex = '1001';
    notif.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 3000);
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    renderProducts();
    renderAdminProducts();
    updateCartUI();
    
    // Админ-панель
    const adminToggle = document.getElementById('adminToggleBtn');
    const adminPanel = document.getElementById('adminPanel');
    let adminVisible = false;
    
    adminToggle.onclick = () => {
        adminVisible = !adminVisible;
        adminPanel.style.display = adminVisible ? 'block' : 'none';
        adminToggle.textContent = adminVisible ? '🔒 Закрыть админ-панель' : '🔧 Админ-панель';
        if (adminVisible) renderAdminProducts();
    };
    
    document.getElementById('addProductBtn').onclick = addProduct;
    document.getElementById('checkoutBtn').onclick = checkout;
    document.getElementById('testEmailBtn').onclick = sendTestEmail;
    
    window.deleteProduct = deleteProduct;
});
