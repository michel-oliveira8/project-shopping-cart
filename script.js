const ol = document.querySelector('.cart__items');
const carregando = document.createElement('h1');
const prices = document.querySelector('.total-price');
let totalPrices = 0;
prices.innerText = totalPrices;

function createProductImageElement(imageSource) {
  const img = document.createElement('img');
  img.className = 'item__image';
  img.src = imageSource;
  return img;
}

function createCustomElement(element, className, innerText) {
  const e = document.createElement(element);
  e.className = className;
  e.innerText = innerText;
  return e;
}
// Requisito 4, parte 1, Carrega o carrinho de compras através do LocalStorage ao iniciar a página//
const saveStorage = () => {
  localStorage.setItem('item_cart', ol.innerHTML);
};

const savePriceStorage = () => {
  localStorage.setItem('price', prices.innerHTML);
};

function createProductItemElement({
  sku,
  name,
  image,
}) {
  const section = document.createElement('section');
  section.className = 'item';

  section.appendChild(createCustomElement('span', 'item__sku', sku));
  section.appendChild(createCustomElement('span', 'item__title', name));
  section.appendChild(createProductImageElement(image));
  section.appendChild(createCustomElement('button', 'item__add', 'Adicionar ao carrinho!'));

  return section;
}

function getSkuFromProductItem(item) {
  return item.querySelector('span.item__sku').innerText;
}
// Requisito 5 Função subtrai os preços dos itens do carrinho //
const sub = (item) => {
  const subtrair = item.target.innerText;
  const indexValue = subtrair.indexOf('$'); // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf //
  const getString = subtrair.slice(indexValue + 1, subtrair.length); // https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Array/slice //
  totalPrices -= getString;
  prices.innerText = totalPrices;
};

// Requisito 3 Remove o item do carrinho de compras ao clicar nele //
function cartItemClickListener(event) {
  ol.removeChild(event.target);
  saveStorage();
  sub(event);
}
// Requisito 5 Soma os valores dos items do carrinho //
const soma = (itemPrice) => {
  totalPrices += itemPrice;
  prices.innerText = totalPrices;
};

function createCartItemElement({
  sku,
  name,
  salePrice,
}) {
  const li = document.createElement('li');
  li.className = 'cart__item';
  li.innerText = `SKU: ${sku} | NAME: ${name} | PRICE: $${salePrice}`;
  li.addEventListener('click', cartItemClickListener);
  return li;
}
// Requisito 6  Cria um botão para limpar carrinho de compras //
const emptyCart = () => {
  const buttonEmpty = document.querySelector('.empty-cart');
  buttonEmpty.addEventListener('click', () => {
    ol.innerHTML = '';
    localStorage.removeItem('item_cart');
    prices.innerText = 0;
  });
};

// Requisito 2 Adiciona o produto ao carrinho de compras. Ao clicar nesse botão você deve realizar uma requisição para o endpoint//
const fetchProductsItens = () => {
  const items = document.querySelectorAll('.item__add');
  items.forEach((item) => {
    item.addEventListener('click', (event) => {
      const getSku = getSkuFromProductItem(event.target.parentElement);
      fetch(`https://api.mercadolibre.com/items/${getSku}`)
        .then((response) => response.json())
        .then((element) => {
          ol.appendChild(createCartItemElement({
            sku: element.id,
            name: element.title,
            salePrice: element.price,
          }));
          soma(element.price);
          saveStorage();
        });
    });
  });
};
// Requisito 7 Criado a classe e texto "loading" durante uma requisição à API//
const loading = () => {
  const pai = document.querySelector('.container');
  pai.appendChild(carregando);
  carregando.className = 'loading';
  carregando.innerText = 'loading...';
};
// Requisito 4, parte 2 Função para pegar cada li na ol e depois excluir cada item salvo no LocalStorage, após clique.//
const loadingLocalStorage = () => {
  ol.innerHTML = localStorage.getItem('item_cart');
  ol.childNodes.forEach((li) => { // https://developer.mozilla.org/pt-BR/docs/Web/API/Node/childNodes //
    li.addEventListener('click', cartItemClickListener);
  });
};
// Requisito 1 criar uma listagem de produtos que devem ser consultados através da API do Mercado Livre.//
const fetchMercadoLivre = () => {
  loading(); // chama a função durante a requisição à API //
  fetch('https://api.mercadolibre.com/sites/MLB/search?q=computador').then((response) => {
    response.json().then((dados) => {
      carregando.remove();
      dados.results.forEach((elemento) => {
        const items = document.querySelector('.items');
        items.appendChild(createProductItemElement({
          sku: elemento.id,
          name: elemento.title,
          image: elemento.thumbnail,
        }));
      });
      fetchProductsItens();
    });
  });
};

window.onload = () => {
  fetchMercadoLivre();
  emptyCart();
  loadingLocalStorage();
  savePriceStorage();
};