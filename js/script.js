// 1. СПІЛЬНА ФУНКЦІЯ: СПОВІЩЕННЯ (TOAST)
function showToast(productName) {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">✓</div>
        <div class="toast-content">
            <h4>Товар додано в кошик!</h4>
            <p>${productName}</p>
        </div>
        <div class="toast-progress"></div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hiding');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// 2. ЛОГІКА КАТАЛОГУ (index.html, catalog.html)
const buyButtons = document.querySelectorAll('.btn-small');
buyButtons.forEach(button => {
    if (button.textContent.includes("В кошик")) {
        button.addEventListener('click', function (event) {
            event.preventDefault();
            const itemCard = button.closest('.catalog-item') || button.parentElement.parentElement;

            const imgSrc = itemCard.querySelector('img').getAttribute('src');
            const title = itemCard.querySelector('h3').textContent;
            const priceText = itemCard.querySelector('.price').textContent;
            const qtyInput = itemCard.querySelector('.product-qty');
            const quantity = qtyInput ? parseInt(qtyInput.value) : 1;

            const product = { name: title, price: priceText, img: imgSrc, qty: quantity };
            let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];

            const existingProductIndex = cart.findIndex(item => item.name === title);
            if (existingProductIndex > -1) {
                cart[existingProductIndex].qty += quantity;
            } else {
                cart.push(product);
            }

            localStorage.setItem('coffeeCart', JSON.stringify(cart));
            showToast(`${title} (${quantity} шт.)`);
        });
    }
});

// 3.ПОВНА ЛОГІКА КОШИКА (Виправлено кнопку очищення)
const cartContainer = document.getElementById('cart-items-container');
const clearBtn = document.getElementById('clear-cart-btn');

if (cartContainer) {
    function renderCart() {
        let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
        cartContainer.innerHTML = "";
        let totalPrice = 0;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="cart-empty-link">
                    <p style="text-align: center; padding: 30px;">Кошик порожній. Час купити кави! ☕</p>
                </div>`;
            if (clearBtn) clearBtn.style.display = "none";
            if (document.getElementById('cart-total')) document.getElementById('cart-total').textContent = "0 ₴";
            if (document.getElementById('items-cost')) document.getElementById('items-cost').textContent = "0 ₴";
        } else {
            if (clearBtn) clearBtn.style.display = "block";

            cart.forEach((item, index) => {
                let priceNumber = parseInt(item.price.replace(/\D/g, ''));
                let subtotal = priceNumber * item.qty;
                totalPrice += subtotal;

                cartContainer.innerHTML += `
                    <div class="cart-item" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #eee; padding: 15px 0;">
                        <img src="${item.img}" alt="Кава" style="width: 70px; border-radius: 8px;">
                        <div style="flex: 1; margin-left: 20px;">
                            <h3 style="margin: 0; font-size: 16px;">${item.name}</h3>
                        </div>
                        <div class="cart-item-qty" style="display: flex; align-items: center; gap: 10px; background: #f5f5f5; border-radius: 20px; padding: 5px 15px;">
                            <button onclick="changeQty(${index}, -1)" style="border: none; background: none; cursor: pointer; font-size: 18px; font-weight: bold;">-</button>
                            <span class="qty-num" style="font-weight: bold; min-width: 20px; text-align: center;">${item.qty}</span>
                            <button onclick="changeQty(${index}, 1)" style="border: none; background: none; cursor: pointer; font-size: 18px; font-weight: bold;">+</button>
                        </div>
                        <div style="font-weight: bold; margin-left: 30px; min-width: 80px; text-align: right;">${subtotal} ₴</div>
                        <div onclick="removeItem(${index})" style="cursor: pointer; color: #ccc; font-size: 20px; margin-left: 25px;">✕</div>
                    </div>
                `;
            });

            if (document.getElementById('cart-total')) document.getElementById('cart-total').textContent = totalPrice + " ₴";
            if (document.getElementById('items-cost')) document.getElementById('items-cost').textContent = totalPrice + " ₴";
        }
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (confirm("Ви дійсно хочете видалити ВСІ товари з кошика?")) {
                localStorage.removeItem('coffeeCart');
                renderCart(); 
            }
        });
    }

    window.changeQty = function (index, delta) {
        let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
        if (cart[index]) {
            cart[index].qty += delta;
            if (cart[index].qty < 1) cart[index].qty = 1;
            localStorage.setItem('coffeeCart', JSON.stringify(cart));
            renderCart();
        }
    };

    window.removeItem = function (index) {
        let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
        cart.splice(index, 1);
        localStorage.setItem('coffeeCart', JSON.stringify(cart));
        renderCart();
    };

    renderCart(); 
}

// 4. ЛОГІКА ОФОРМЛЕННЯ ЗАМОВЛЕННЯ (checkout.html)
const checkoutForm = document.getElementById('checkout-form');
const checkoutItemsList = document.getElementById('checkout-items-list');

if (checkoutForm && checkoutItemsList) {
    let cart = JSON.parse(localStorage.getItem('coffeeCart')) || [];
    let itemsSum = 0;

    checkoutItemsList.innerHTML = ''; 

    cart.forEach(item => {
        let priceNum = parseInt(item.price.replace(/\D/g, ''));
        if (!isNaN(priceNum)) {
            let subtotal = priceNum * item.qty;
            itemsSum += subtotal;

            checkoutItemsList.innerHTML += `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed #eee;">
                    <div style="flex: 1; padding-right: 15px;">
                        <p style="margin: 0; font-weight: 500; color: #333; font-size: 14px;">${item.name}</p>
                        <p style="margin: 4px 0 0 0; color: #888; font-size: 13px;">Кількість: ${item.qty} шт.</p>
                    </div>
                    <strong style="white-space: nowrap; font-size: 15px;">${subtotal} ₴</strong>
                </div>
            `;
        }
    });

    const deliveryCostEl = document.getElementById('checkout-delivery-cost');
    const finalTotalEl = document.getElementById('checkout-final-total');
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

    function calculateFinalTotal() {
        const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
        let deliveryPrice = selectedDelivery ? parseInt(selectedDelivery.value) : 0;

        if (deliveryCostEl) deliveryCostEl.textContent = deliveryPrice + " ₴";
        if (finalTotalEl) finalTotalEl.textContent = (itemsSum + deliveryPrice) + " ₴";
    }

    deliveryRadios.forEach(radio => radio.addEventListener('change', calculateFinalTotal));
    calculateFinalTotal();

    checkoutForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const phoneInput = document.getElementById('user-phone');
        const phoneError = document.getElementById('phone-error');
        const phoneValue = phoneInput.value.trim();
        const phoneRegex = /^\d{9}$/;

        if (!phoneRegex.test(phoneValue)) {
            phoneError.style.display = 'block';
            phoneInput.parentElement.style.borderColor = 'red';
            return;
        } else {
            phoneError.style.display = 'none';
            phoneInput.parentElement.style.borderColor = '#4CAF50';
        }

        if (itemsSum === 0) {
            alert("Ваш кошик порожній! Додайте товари перед оформленням.");
            window.location.href = 'catalog.html';
            return;
        }

        const userName = document.getElementById('user-name').value;

        const modal = document.getElementById('success-modal');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close-btn');

        modalMessage.innerHTML = `Дякуємо, <strong>${userName}</strong>!<br>Ми зателефонуємо вам на номер <strong>+380${phoneValue}</strong> для підтвердження.`;

        modal.classList.add('active');

        localStorage.removeItem('coffeeCart');

        modalCloseBtn.addEventListener('click', function () {
            window.location.href = 'index.html';
        });
    });
}