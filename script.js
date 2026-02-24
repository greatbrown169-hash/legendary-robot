const productcontainer = document.querySelector('.product-list');
const isproductdetailpage = document.querySelector('.product-detail');
const isCartpage = document.querySelector(".cart");

if (productcontainer) {
    displayproducts();
} else if (isproductdetailpage) {
    displayproductdetail();
} else if (isCartpage) {
    displaycart();
}

/* ================= PRODUCTS LIST ================= */

function displayproducts() {4
    products.forEach(product => {
        const productcard = document.createElement('div');
        productcard.classList.add('product-card');
        productcard.innerHTML = `
            <div class="img-box">
                <img src="${product.colors[0].mainImage}">
            </div>
            <h2 class="title">${product.title}</h2>
            <span class="price">${product.price}</span>
        `;

        productcontainer.appendChild(productcard);

        productcard.querySelector('.img-box').addEventListener("click", () => {
            sessionStorage.setItem("selectedproduct", JSON.stringify(product));
            window.location.href = "product-detail.html";
        });
    });
}

/* ================= PRODUCT DETAIL ================= */

function displayproductdetail() {
    const productdata = JSON.parse(sessionStorage.getItem("selectedproduct"));
    if (!productdata) return;

    const titleEL = document.querySelector('.title');
    const priceEL = document.querySelector('.price');
    const descriptionEL = document.querySelector('.description');
    const mainImageEL = document.querySelector('.main-img');
    const thumbnailListEL = document.querySelector('.thumbnail-list');
    const colorOptionsEL = document.querySelector('.color-options');
    const sizeOptionsEL = document.querySelector('.size-options');
    const addToCartBtn = document.querySelector('.btn');

    let selectedColor = productdata.colors[0];
    let selectedSize = selectedColor.sizes[0];

    function updateProductDisplay() {
        if (!selectedColor.sizes.includes(selectedSize)) {
            selectedSize = selectedColor.sizes[0];
        }

        mainImageEL.innerHTML = `<img src="${selectedColor.mainImage}">`;

        thumbnailListEL.innerHTML = "";
        const thumbs = [selectedColor.mainImage, ...selectedColor.thumbnails.slice(0, 3)];
        thumbs.forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            img.onclick = () => mainImageEL.innerHTML = `<img src="${src}">`;
            thumbnailListEL.appendChild(img);
        });

        colorOptionsEL.innerHTML = "";
        productdata.colors.forEach(color => {
            const img = document.createElement("img");
            img.src = color.mainImage;
            if (color.name === selectedColor.name) img.classList.add("selected");
            img.onclick = () => {
                selectedColor = color;
                updateProductDisplay();
            };
            colorOptionsEL.appendChild(img);
        });

        sizeOptionsEL.innerHTML = "";
        selectedColor.sizes.forEach(size => {
            const btn = document.createElement("button");
            btn.textContent = size;
            if (size === selectedSize) btn.classList.add("selected");
            btn.onclick = () => {
                selectedSize = size;
                updateProductDisplay();
            };
            sizeOptionsEL.appendChild(btn);
        });
    }

    titleEL.textContent = productdata.title;
    priceEL.textContent = productdata.price;
    descriptionEL.textContent = productdata.description;

    updateProductDisplay();

    addToCartBtn.onclick = () => {
        addToCart(productdata, selectedColor, selectedSize);
    };
}

/* ================= ADD TO CART ================= */

function addToCart(product, color, size) {
    let cart = JSON.parse(sessionStorage.getItem("cart")) || [];

    const existingItem = cart.find(
        item => item.id === product.id && item.color === color.name && item.size === size
    );

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: color.mainImage,
            color: color.name,
            size: size,
            quantity: 1
        });
    }

    sessionStorage.setItem("cart", JSON.stringify(cart));
    updateCartBadge();

     if (document.querySelector(".cart")) {
        displaycart();
    }
}


/* ================= CART PAGE ================= */

function displaycart() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartItemsContainer = document.querySelector(".cart-items");
    const subtotalEL = document.querySelector(".subtotal");
    const grandTotalEL = document.querySelector(".grand-total");

    cartItemsContainer.innerHTML = "";

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
        subtotalEL.textContent = "$0";
        grandTotalEL.textContent = "$0";
        return;
    }

    let subtotal = 0;

    cart.forEach((item, index) => {
        const priceNum = parseFloat(item.price.replace("$", "")) || 0;
        const itemTotal = priceNum * item.quantity;
        subtotal += itemTotal;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");
        cartItem.innerHTML = `
            <div class="product">
                <img src="${item.image}">
                <div class="item-details">
                    <p>${item.title}</p>
                    <div class="size-color-box">
                        <span>${item.size}</span>
                        <span>${item.color}</span>
                    </div>
                </div>
            </div>
            <span class="price">${item.price}</span>
            <div class="quantity">
                <input type="number" value="${item.quantity}" min="1" data-index="${index}">
            </div>
            <span class="total-price">$${itemTotal.toFixed(2)}</span>
            <button class="remove" data-index="${index}">✕</button>
        `;
        cartItemsContainer.appendChild(cartItem);
    });

    subtotalEL.textContent = `$${subtotal.toFixed(2)}`;
    grandTotalEL.textContent = `$${subtotal.toFixed(2)}`;

    removeCartItem();
    updateCartQuantity();
}

/* ================= CART ACTIONS ================= */

function removeCartItem() {
    document.querySelectorAll(".remove").forEach(btn => {
        btn.onclick = function () {
            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const index = this.getAttribute("data-index");
            cart.splice(index, 1);
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displaycart();
            updateCartBadge();
        };
    });
}

function updateCartQuantity() {
    document.querySelectorAll(".quantity input").forEach(input => {
        input.onchange = function () {
            let cart = JSON.parse(sessionStorage.getItem("cart")) || [];
            const index = this.getAttribute("data-index");
            cart[index].quantity = parseInt(this.value);
            sessionStorage.setItem("cart", JSON.stringify(cart));
            displaycart();
            updateCartBadge();
        };
    });
}

/* ================= CART BADGE ================= */

function updateCartBadge() {
    const cart = JSON.parse(sessionStorage.getItem("cart")) || [];
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
   const badge = document.querySelector(".cart-icon-count");


    if (!badge) return; // <-- prevents silent failure

    if (cartCount > 0) {
        badge.textContent = cartCount;
        badge.style.display = "flex"; // better for centering
    } else {
        badge.style.display = "none";
    }
}
