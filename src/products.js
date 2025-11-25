import { supabase } from './supabase.js';

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    throw error;
  }

  return data || [];
}

export function formatPrice(price) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price);
}

export function createProductCard(product, onAddToCart) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-category', product.category);

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image_url}" alt="${product.name}" loading="lazy">
      ${product.stock < 10 && product.stock > 0 ? '<span class="stock-badge">Últimas unidades</span>' : ''}
      ${product.stock === 0 ? '<span class="stock-badge out-of-stock">Esgotado</span>' : ''}
    </div>
    <div class="product-info">
      <h3 class="product-name">${product.name}</h3>
      <p class="product-description">${product.description}</p>
      <div class="product-footer">
        <span class="product-price">${formatPrice(product.price)}</span>
        <button class="add-to-cart-btn" ${product.stock === 0 ? 'disabled' : ''}>
          ${product.stock === 0 ? 'Esgotado' : 'Adicionar'}
        </button>
      </div>
    </div>
  `;

  const addButton = card.querySelector('.add-to-cart-btn');
  if (product.stock > 0) {
    addButton.addEventListener('click', (e) => {
      e.preventDefault();
      onAddToCart(product);
      addButton.classList.add('added');
      addButton.textContent = 'Adicionado!';
      setTimeout(() => {
        addButton.classList.remove('added');
        addButton.textContent = 'Adicionar';
      }, 1000);
    });
  }

  return card;
}
