import './style.css';
import { fetchProducts, createProductCard, formatPrice } from './products.js';
import { Cart } from './cart.js';
import { createOrder } from './checkout.js';

const cart = new Cart();

function updateCartUI() {
  const cartCount = document.getElementById('cartCount');
  const cartItems = document.getElementById('cartItems');
  const cartTotal = document.getElementById('cartTotal');

  cartCount.textContent = cart.getItemCount();

  if (cart.items.length === 0) {
    cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
  } else {
    cartItems.innerHTML = cart.items.map(item => `
      <div class="cart-item">
        <img src="${item.image_url}" alt="${item.name}">
        <div class="cart-item-info">
          <h4>${item.name}</h4>
          <p class="cart-item-price">${formatPrice(item.price)}</p>
          <div class="quantity-controls">
            <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
          </div>
        </div>
        <button class="remove-item" data-id="${item.id}">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `).join('');

    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.id;
        const action = e.target.dataset.action;
        const item = cart.items.find(item => item.id === id);

        if (action === 'increase') {
          cart.updateQuantity(id, item.quantity + 1);
        } else if (action === 'decrease' && item.quantity > 1) {
          cart.updateQuantity(id, item.quantity - 1);
        }

        updateCartUI();
      });
    });

    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.closest('.remove-item').dataset.id;
        cart.removeItem(id);
        updateCartUI();
      });
    });
  }

  cartTotal.textContent = formatPrice(cart.getTotal());
}

function openCart() {
  document.getElementById('cartSidebar').classList.add('active');
  document.getElementById('overlay').classList.add('active');
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
}

function openCheckoutModal() {
  if (cart.items.length === 0) {
    alert('Seu carrinho está vazio');
    return;
  }

  const orderItems = document.getElementById('orderItems');
  const orderTotal = document.getElementById('orderTotal');

  orderItems.innerHTML = cart.items.map(item => `
    <div class="order-item">
      <span>${item.name} x${item.quantity}</span>
      <span>${formatPrice(item.price * item.quantity)}</span>
    </div>
  `).join('');

  orderTotal.textContent = formatPrice(cart.getTotal());

  closeCart();
  document.getElementById('checkoutModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
}

function closeModal() {
  document.getElementById('checkoutModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
}

function showSuccessModal() {
  document.getElementById('successModal').classList.add('active');
  document.getElementById('overlay').classList.add('active');
}

function closeSuccessModal() {
  document.getElementById('successModal').classList.remove('active');
  document.getElementById('overlay').classList.remove('active');
}

async function loadProducts() {
  const productsGrid = document.getElementById('productsGrid');

  try {
    const products = await fetchProducts();
    productsGrid.innerHTML = '';

    products.forEach(product => {
      const card = createProductCard(product, (product) => {
        cart.addItem(product);
        updateCartUI();
      });
      productsGrid.appendChild(card);
    });

  } catch (error) {
    productsGrid.innerHTML = '<p class="error">Erro ao carregar produtos. Tente novamente mais tarde.</p>';
  }
}

function setupFilters() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.product-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.dataset.category;

      setTimeout(() => {
        const cards = document.querySelectorAll('.product-card');
        cards.forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
            setTimeout(() => card.classList.add('visible'), 10);
          } else {
            card.classList.remove('visible');
            setTimeout(() => card.style.display = 'none', 300);
          }
        });
      }, 50);
    });
  });
}

document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('checkoutBtn').addEventListener('click', openCheckoutModal);
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('overlay').addEventListener('click', () => {
  closeCart();
  closeModal();
  closeSuccessModal();
});
document.getElementById('closeSuccess').addEventListener('click', closeSuccessModal);

document.getElementById('checkoutForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submitOrder');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processando...';

  try {
    const orderData = {
      customerName: document.getElementById('customerName').value,
      customerEmail: document.getElementById('customerEmail').value,
      customerPhone: document.getElementById('customerPhone').value,
      totalAmount: cart.getTotal(),
      items: cart.getItems()
    };

    await createOrder(orderData);

    cart.clear();
    updateCartUI();
    closeModal();
    showSuccessModal();

    document.getElementById('checkoutForm').reset();
  } catch (error) {
    alert('Erro ao processar pedido. Tente novamente.');
    console.error(error);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Confirmar Pedido';
  }
});

loadProducts().then(() => {
  setupFilters();
  setTimeout(() => {
    document.querySelectorAll('.product-card').forEach((card, index) => {
      setTimeout(() => card.classList.add('visible'), index * 50);
    });
  }, 100);
});

updateCartUI();
