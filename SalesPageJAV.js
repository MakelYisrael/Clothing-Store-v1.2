// --- Firebase Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAkONo3PzKXEyLOYhPmavD6A9bYkali9yw",
    authDomain: "authentication-23067.firebaseapp.com",
    projectId: "authentication-23067",
    storageBucket: "authentication-23067.firebasestorage.app",
    messagingSenderId: "298353931477",
    appId: "1:298353931477:web:d731711620dd53a7b65e5c",
    measurementId: "G-YDZ76L3CRL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

// script.js
let isLoggedIn = false;
let cart = [];
let editProductIndex = null;

const sampleProducts = [
    { name: 'Classic Shirt', category: 'shirts', image: 'https://steadyclothing.com/cdn/shop/products/ST35613_teal__08619.jpg?v=1715893831&width=1200', price: 19.99 },
    { name: 'Denim Pants', category: 'pants', image: 'https://civilianaire.com/cdn/shop/files/W10236004-INDA-A.jpg?v=1687232159', price: 29.99 },
    { name: 'Eagles Hat', category: 'hats', image: 'https://www.47brand.com/cdn/shop/files/FL-CLSSC24GWF-KYA87-HR-F_grande.jpg?v=1717534822', price: 14.99 },
    { name: 'Cargo Shorts', category: 'shorts', image: 'https://img4.dhresource.com/webp/m/0x0/f3/albu/km/y/01/bec263fc-5bbf-4ba0-ad61-e96b22fc3738.jpg', price: 24.99 },
    { name: 'Flannel Shirt', category: 'shirts', image: 'https://encrypted-tbn1.gstatic.com/shopping?q=tbn:ANd9GcSEpJhEN-Xqb7aCd9YOBdkoHZhuKqi1YESvUBZ8efsazhCG5Eutj2IDWcqr5dLeU1vNC_ijSCTnxr9AsDsmKnJWuakZEbUzQ9YodkkKpg59OUJbKzWMmPRe', price: 21.99 },
    { name: 'Jogger Pants', category: 'pants', image: 'https://ultraperformanceshop.com/cdn/shop/files/AE-20028-1.jpg?v=1743629634&width=1445', price: 32.99 },
    { name: 'Beanie Hat', category: 'hats', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTg4tHYE4vXyIzIswUrkKSr39XaTdNz-lQq4g&s', price: 12.99 },
    { name: 'Slim Shorts', category: 'shorts', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP_dwwulqd8jLkPBbqzaEAZnExpZAZFaMWew&s', price: 22.99 },
    { name: 'Graphic Tee', category: 'shirts', image: 'https://wearicy.com/cdn/shop/files/MARIAHTHESCIENTISTNEW.png?v=1710195346', price: 17.99 },
    { name: 'Chino Pants', category: 'pants', image: 'https://www.westportbigandtall.com/cdn/shop/files/37957_PG80_WP_F24_63aefa6d-fc2a-4f3b-b1f4-426346ef7cc5_2048x.jpg?v=1738271372', price: 27.99 },
    { name: 'Snapback Hat', category: 'hats', image: 'https://shop.bulls.com/cdn/shop/files/BULLMH004000C.jpg?v=1695826548', price: 16.99 },
    { name: 'Board Shorts', category: 'shorts', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSwjPgEuOjsTZt86eCgNNFfT5BDEta650Yd3w&s', price: 23.99 },
    { name: 'Polo Shirt', category: 'shirts', image: 'https://www.mrporter.com/variants/images/1647597313248156/in/w2000_q60.jpg', price: 20.99 },
    { name: 'Track Pants', category: 'pants', image: 'https://showerspass.com/cdn/shop/products/Untitled-1.jpg?v=1679330067', price: 34.99 },
    { name: 'Sun Hat', category: 'hats', image: 'https://m.media-amazon.com/images/I/61xI75U9XDL._AC_SX466_.jpg', price: 13.99 },
    { name: 'Swim Shorts', category: 'shorts', image: 'https://www.surfcuz.com/cdn/shop/products/567.jpg?v=1650524629', price: 25.99 },
    // New categories with filler items
    { name: 'Ankle Socks', category: 'socks', image: 'https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/e74435a1-6f46-45bb-9d00-d8ee674f43f4/U+NK+EVRY+PLS+CUSH+ANKL+6PR-BD.png', price: 5.99 },
    { name: 'Crew Socks', category: 'socks', image: 'https://static.nike.com/a/images/t_PDP_936_v1/f_auto,q_auto:eco/cb8d316e-795a-4a9b-99e6-e8e73a46c970/Y+NK+EVERYDY+CUSH+CREW+6PR+108.png', price: 6.99 },
    { name: 'Running Shoes', category: 'shoes', image: 'https://images.ctfassets.net/hnk2vsx53n6l/1b50G5ILoGZxs0c3juepvY/60fc94f66f8134e49dfa7babf9c92e8e/0025372c814136427ff489818a261f03f4882e1d.png?fm=webp', price: 49.99 },
    { name: 'Dress Shoes', category: 'shoes', image: 'https://www.miomarino.com/cdn/shop/products/LS065-4-BR_P2-1_500x@2x.progressive.jpg?v=1645722218', price: 59.99 },
    { name: 'Boxer Briefs', category: 'underwear', image: 'https://d4yxl4pe8dqlj.cloudfront.net/images/33539b10-6c81-47de-bd00-33148b93ef64/8407c460-0dbf-4cb3-863d-78120f81fc50_large.jpg', price: 9.99 },
    { name: 'Trunks', category: 'underwear', image: 'https://cdn.hanes.com/catalog/product/H/N/HNS_UFSTA4/HNS_UFSTA4_Assorted_Front.jpg', price: 8.99 }
];

/*function signIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        isLoggedIn = true;
        document.getElementById('loginPage').style.display = 'none';
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.filters').style.display = 'block';
        document.querySelector('.products').style.display = 'grid';
        document.querySelector('.checkout').style.display = 'block';
        document.getElementById('addProductNavBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
        renderProducts();
    } else {
        alert('Enter valid credentials.');
    }
}

function logout() {
    isLoggedIn = false;
    document.getElementById('loginPage').style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
    document.querySelector('.filters').style.display = 'none';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.getElementById('addProductNavBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}*/

function signIn() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    signInWithEmailAndPassword(auth, username, password)
        .then((userCredential) => {
            isLoggedIn = true;
            showAppUI();
            renderProducts();
        })
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
}

function logout() {
    signOut(auth).then(() => {
        isLoggedIn = false;
        showLoginUI();
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
}

onAuthStateChanged(auth, (user) => {
    if (user) {
        isLoggedIn = true;
        showAppUI();
        renderProducts();
    } else {
        isLoggedIn = false;
        showLoginUI();
    }
});

function showAppUI() {
    document.getElementById('loginPage').style.display = 'none';
    document.querySelector('header').style.display = 'block';
    document.querySelector('nav').style.display = 'flex';
    document.querySelector('.filters').style.display = 'block';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
    document.getElementById('addProductNavBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'inline-block';
}

function showLoginUI() {
    document.getElementById('loginPage').style.display = 'block';
    document.querySelector('header').style.display = 'none';
    document.querySelector('nav').style.display = 'none';
    document.querySelector('.filters').style.display = 'none';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.getElementById('addProductNavBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'none';
}

document.getElementById('signInBtn').addEventListener('click', signIn);
document.getElementById('logoutBtn').addEventListener('click', logout);

function filterCategory(category) {
    const products = document.querySelectorAll('.product');
    products.forEach(p => {
        if (category === 'all' || p.dataset.category === category) {
            p.style.display = 'block';
        } else {
            p.style.display = 'none';
        }
    });
}
document.getElementById('all').addEventListener('click', () => filterCategory('all'));
document.getElementById('shirts').addEventListener('click', () => filterCategory('shirts'));
document.getElementById('pants').addEventListener('click', () => filterCategory('pants'));
document.getElementById('hats').addEventListener('click', () => filterCategory('hats'));
document.getElementById('shorts').addEventListener('click', () => filterCategory('shorts'));
document.getElementById('socks').addEventListener('click', () => filterCategory('socks'));
document.getElementById('shoes').addEventListener('click', () => filterCategory('shoes'));
document.getElementById('underwear').addEventListener('click', () => filterCategory('underwear'));
// Add similar lines for other categories as necessary

function filterProducts() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    const products = document.querySelectorAll('.product');
    products.forEach(p => {
        const title = p.querySelector('h3').innerText.toLowerCase();
        p.style.display = title.includes(search) ? 'block' : 'none';
    });
}
document.getElementById('searchBar').addEventListener('input', filterProducts);

function addToCart(productName, button) {
    const product = button.closest('.product');
    const quantity = parseInt(product.querySelector('input[type="number"]').value);
    const color = product.querySelector('select').value;
    // Find the product in sampleProducts to get the price
    const prodObj = sampleProducts.find(p => p.name === productName);
    const price = prodObj ? prodObj.price : 19.99;

    const existingItem = cart.find(item => item.name === productName && item.color === color);
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({ name: productName, color, quantity, price });
    }

    alert(`${productName} (${color}) x${quantity} added to cart.`);
}

function goToCheckout() {
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.getElementById('cartPage').style.display = 'block';

    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.color}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);
}
document.getElementById('goToCheckoutBtn').addEventListener('input', goToCheckout);

function closeCart() {
    document.getElementById('cartPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
}

function completePurchase() {
    alert('Purchase completed successfully!');
    cart = [];
    goToCheckout();
}

function showAddProductPage() {
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.getElementById('addProductPage').style.display = 'block';
    document.querySelector('.filters').style.display = 'none';
}

document.getElementById('addProductNavBtn').addEventListener('click', showAddProductPage);

function backToShop() {
    document.getElementById('addProductPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
    document.querySelector('.filters').style.display = 'block';
}
document.getElementById('backToShopBtn').addEventListener('click', backToShop);

function addNewProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const category = document.getElementById('newProductCategory').value;
    const image = document.getElementById('newProductImage').value.trim() || 'https://via.placeholder.com/200x150?text=New+Product';
    const priceInput = document.getElementById('newProductPrice').value;
    const price = priceInput ? parseFloat(priceInput) : 19.99;

    if (!name) {
        alert('Please enter a product name.');
        return;
    }

    // Add to sampleProducts and re-render
    const newProduct = { name, category, image, price };
    sampleProducts.push(newProduct);

    // Clear form
    document.getElementById('newProductName').value = '';
    document.getElementById('newProductImage').value = '';
    document.getElementById('newProductCategory').selectedIndex = 0;
    document.getElementById('newProductPrice').value = '';

    alert('Product added!');
    backToShop();
    renderProducts();
}

function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
        sampleProducts.splice(index, 1);
        renderProducts();
    }
}

// --- Edit Product Functionality ---
function showEditProductPage(index) {
    editProductIndex = index;
    const product = sampleProducts[index];
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductPrice').value = product.price;
    const preview = document.getElementById('editProductPreview');
    preview.src = product.image;
    preview.style.display = 'block';
    document.getElementById('editProductPage').style.display = 'block';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.querySelector('.filters').style.display = 'none';
}

function saveEditProduct() {
    if (editProductIndex === null) return;
    const name = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editProductCategory').value;
    const image = document.getElementById('editProductImage').value.trim() || 'https://via.placeholder.com/200x150?text=No+Image';
    const priceInput = document.getElementById('editProductPrice').value;
    const price = priceInput ? parseFloat(priceInput) : 19.99;

    if (!name) {
        alert('Please enter a product name.');
        return;
    } 

    sampleProducts[editProductIndex] = { name, category, image, price };
    editProductIndex = null;
    document.getElementById('editProductPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
    document.querySelector('.filters').style.display = 'block';
    renderProducts();
}
/*document.getElementById('editProductName').addEventListener('click', saveEditProduct);
document.getElementById('editProductCategory').addEventListener('click', saveEditProduct);
document.getElementById('editProductImage').addEventListener('click', saveEditProduct);
document.getElementById('editProductPrice').addEventListener('click', saveEditProduct);
document.getElementById('editProductPreview').addEventListener('click', saveEditProduct);
//document.getElementById('saveEditProductBtn').addEventListener('click', saveEditProduct);*/

function cancelEditProduct() {
    editProductIndex = null;
    document.getElementById('editProductPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
    document.querySelector('.filters').style.display = 'block';
}
document.getElementById('cancelEditProductBtn').addEventListener('click', cancelEditProduct);

// Live preview for image URL in edit modal
document.addEventListener('DOMContentLoaded', function () {
    const imgInput = document.getElementById('editProductImage');
    if (imgInput) {
        imgInput.addEventListener('input', function () {
            const preview = document.getElementById('editProductPreview');
            preview.src = imgInput.value;
            preview.style.display = imgInput.value ? 'block' : 'none';
        });
    }
});

// Renders all products from sampleProducts
function renderProducts() {
    const container = document.getElementById('productList');
    container.innerHTML = '';
    sampleProducts.forEach((product, idx) => {
        const div = document.createElement('div');
        div.className = 'product';
        div.setAttribute('data-category', product.category);
        div.innerHTML = `
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
            <select>
                <option>Red</option>
                <option>Blue</option>
                <option>Black</option>
            </select>
            <input type="number" value="1" min="1" />
            <button class="add-to-cart-btn" data-name="${product.name}">Add to Cart</button>
            ${isLoggedIn ? `
                <button class="delete-btn" data-idx="${idx}" style="margin-top:0.5rem;background:#bf0a30;">Delete</button>
                <button class="edit-btn" data-idx="${idx}" style="margin-top:0.5rem;background:#007bff;">Edit</button>
            ` : ''}
        `;
        container.appendChild(div);
    });
    // Attach event listeners for delete/edit after rendering
   container.querySelectorAll('.delete-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const idx = Number(this.dataset.idx);
    deleteProduct(idx);
  });
});
   container.querySelectorAll('.edit-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    const idx = Number(this.dataset.idx);
    showEditProductPage(idx);
  });
});
    container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    addToCart(this.dataset.name, this);
  });
});
}
document.getElementById('goToCheckoutBtn').addEventListener('click', goToCheckout);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('completePurchaseBtn').addEventListener('click', completePurchase);

window.onload = () => {
    renderProducts();

    if (!isLoggedIn) {
        document.getElementById('loginPage').style.display = 'block';
        document.querySelector('header').style.display = 'none';
        document.querySelector('nav').style.display = 'none';
        document.querySelector('.filters').style.display = 'none';
        document.querySelector('.products').style.display = 'none';
        document.querySelector('.checkout').style.display = 'none';
        document.getElementById('addProductNavBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';
    } else {
        document.getElementById('loginPage').style.display = 'none';
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.filters').style.display = 'block';
        document.querySelector('.products').style.display = 'grid';
        document.querySelector('.checkout').style.display = 'block';
        document.getElementById('addProductNavBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
    }
};
