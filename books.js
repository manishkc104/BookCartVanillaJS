const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartDom = document.querySelector(".cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cartItemsCount = document.querySelector(".cart-items");
const cartTotal = document.querySelector(".cart-total");
const cartContent = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");

let cart = [];

let buttonsDom = [];

class Products {
  async getProducts() {
    try {
      const response = await fetch("books.json");
      const data = await response.json();
      let products = data.bookItems;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item;
        const image = item.fields.image.url;
        return {
          title,
          price,
          id,
          image,
        };
      });
      return products;
    } catch (e) {
      console.log(e);
    }
  }
}

class Storage {
  static saveProducts(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    let products = JSON.parse(localStorage.getItem("products"));
    return products.find((product) => product.id === Number(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}

class DisplayProducts {
  displayProducts(response) {
    let display = "";
    response.forEach((item) => {
      display =
        display +
        ` <article class="product">
          <div class="img-container">
            <img
              src=${item.image}
              alt="product"
              class="product-img"
            />
            <button class="bag-btn" data-id=${item.id}>
              <i class="fas fa-shopping-cart"></i>
              add to cart
            </button>
          </div>
          <h3>${item.title}</h3>
          <h4>$${item.price}</h4>
        </article>`;
    });
    productsDom.innerHTML = display;
  }

  getButton() {
    const buttons = [...document.querySelectorAll(".bag-btn")];
    buttonsDom = buttons;
    buttons.forEach((button) => {
      const id = button.dataset.id;
      const inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = "In Cart";
        button.disabled = true;
      }
      button.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        let cartItem = { ...Storage.getProduct(id), amount: 1 };
        cart = [...cart, cartItem];
        Storage.saveCart(cart);
        this.setCartValue(cart);
        this.addCartItem(cartItem);
        this.showCart();
      });
    });
  }
  setCartValue(cart) {
    let tempTotal = 0;
    let itemTotal = 0;
    cart.map((item) => {
      console.log({ item });
      tempTotal = tempTotal + item.price * item.amount;
      itemTotal = itemTotal + item.amount;
    });
    cartTotal.innerText = Number(tempTotal.toFixed(2));
    console.log({ itemTotal });
    cartItemsCount.innerHTML = itemTotal;
  }
  addCartItem(item) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title} </h4>
              <h5>$${item.price} </h5>
              <span class="remove-item" data-id = ${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id = ${item.id}></i>
              <p class="item-amount">
               ${item.amount}
              </p>
              <i class="fas fa-chevron-down" data-id = ${item.id}></i>
            </div>`;
    cartContent.appendChild(div);
  }

  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cartDom.classList.add("showCart");
  }

  hideCart() {
    cartOverlay.classList.remove("transparentBcg");
    cartDom.classList.remove("showCart");
  }

  populate(cart) {
    cart.forEach((item) => this.addCartItem(item));
  }

  setupApp() {
    cart = Storage.getCart();
    this.setCartValue(cart);
    this.populate(cart);
    cartBtn.addEventListener("click", this.showCart);
    closeCartBtn.addEventListener("click", this.hideCart);
  }
  clearCart() {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  }

  removeItem(id) {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    console.log({ button });
    button.disabled = false;
    button.innerHTML = `<i class = "fas fa-shopping-cart"></i>add to cart`;
  }

  getSingleButton(id) {
    console.log({ id });
    return buttonsDom.find((button) => Number(button.dataset.id) === id);
  }

  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCart();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new Products();
  const ui = new DisplayProducts();
  products
    .getProducts()
    .then((response) => {
      ui.displayProducts(response);
      Storage.saveProducts(response);
    })
    .then(() => {
      ui.getButton();
      ui.cartLogic();
    });
  ui.setupApp();
});
