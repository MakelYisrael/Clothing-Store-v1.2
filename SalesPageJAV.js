// --- Firebase Setup ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-analytics.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, onSnapshot, doc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, arrayUnion, addDoc, collection } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAkONo3PzKXEyLOYhPmavD6A9bYkali9yw",
    authDomain: "authentication-23067.firebaseapp.com",
    projectId: "authentication-23067",
    storageBucket: "authentication-23067.appspot.com",
    messagingSenderId: "298353931477",
    appId: "1:298353931477:web:d731711620dd53a7b65e5c",
    measurementId: "G-YDZ76L3CRL"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

// script.js
let isLoggedIn = false;
let cart = [];
let editProductIndex = null;
let currentUser = null;
let currentUserRole = null;
let unsubscribeCartListener = null;
let stopListeningToCart = null;
let products = [];

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
// --- Listen for Real-Time Cart Updates ---
function listenToCartChanges() {
    if (!auth.currentUser) return;

    const userRef = doc(db, "users", auth.currentUser.uid);

    unsubscribeCartListener = onSnapshot(userRef, (docSnap) => {
        if (docSnap.exists()) {
            const data = docSnap.data();
            cart = Array.isArray(data.cart) ? data.cart : [];
            console.log("📦 Cart updated in real time:", cart);
            renderCartUI();
        }
    }, (error) => {
        console.error("❌ Real-time cart listener error:", error);
    });
}

function updateUIByRole(role) {
  // Hide all by default
  document.querySelectorAll('.edit-btn, .delete-btn, .add-to-cart-btn').forEach(btn => btn.style.display = 'none');
  document.getElementById("addProductNavBtn").style.display = "none";
  document.getElementById("goToCheckoutBtn").style.display = "none";

  if (role === "seller") {
    // Show seller buttons
     document.querySelectorAll('.edit-btn, .delete-btn').forEach(btn => btn.style.display = 'inline-block');
    document.getElementById("addProductNavBtn").style.display = "inline-block";
  } else if (role === "buyer") {
    // Show buyer buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => btn.style.display = 'inline-block');
    document.getElementById("goToCheckoutBtn").style.display = "inline-block";
  }
}

async function getUserRole(uid) {
  const userDocRef = doc(db, "users", uid);
  const userDoc = await getDoc(userDocRef);
  if (userDoc.exists()) {
    const userData = userDoc.data();
    console.log(`✅ Logged in as ${userData.role}`);
    return userData.role; // "buyer" or "seller"
  } else {
    // Handle user not found
    alert("User is not found");
    return null;
  }
}

// --- Auth State Change ---
onAuthStateChanged(auth, async (user) => {
    //stopListeningToCart(); // Stop old listener
    if (user) {
        console.log(`✅ Logged in as ${user.email}`);
        loadCartFromFirestore();
        listenToCartChanges(); // Start new real-time listener
        const uid = user.uid;
        const role = await getUserRole(user.uid); //enables role to show and hide features
        currentUserRole = role
        updateUIByRole(currentUserRole);
        renderProducts('all');
    } else {
        console.log("🚪 Logged out, clearing cart.");
        cart = [];
        renderCartUI();
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

async function loadProductsFromFirestore() {
    products = [];
    const querySnapshot = await getDocs(collection(db, "products"));
    querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
    });
    renderProducts();
}

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

function renderCategoryDropdown() {
    const uniqueCategories = [...new Set(sampleProducts.map(p => p.category))];
    const dropdown = document.getElementById('categoryDropdown');
    dropdown.innerHTML = '';

    // Add the default "All" option
    const allOption = document.createElement('option');
    allOption.value = 'all';
    allOption.textContent = 'All';
    dropdown.appendChild(allOption);

    // Add an option for each unique category
    uniqueCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        dropdown.appendChild(option);
    });

    // Handle filtering on change
    dropdown.addEventListener('change', () => {
        filterCategory(dropdown.value);
    });
}

function filterProducts() {
    const search = document.getElementById('searchBar').value.toLowerCase();
    const products = document.querySelectorAll('.product');
    products.forEach(p => {
        const title = p.querySelector('h3').innerText.toLowerCase();
        p.style.display = title.includes(search) ? 'block' : 'none';
    });
}
document.getElementById('searchBar').addEventListener('input', filterProducts);

// Add item to cart
function addToCart(item) {
  // If the same product+color exists, increase quantity instead of duplicating
  const existing = cart.find(p => p.name === item.name && p.color === item.color);
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.push(item);
  }
  renderCartUI();
  saveCartToFirestore();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    renderCartUI();
    saveCartToFirestore();
}

// Render cart to page
function renderCartUI() {
  const cartContainer = document.getElementById("cartItems");
  cartContainer.innerHTML = ""; // Clear old items

  if (cart.length === 0) {
    cartContainer.innerHTML = "<p>🛒 Your cart is empty.</p>";
    return;
  }

  cart.forEach((item, index) => {
    const itemDiv = document.createElement("div");
    itemDiv.classList.add("cartItems");

    itemDiv.innerHTML = `
      <img src="${item.image}" alt="${item.name}" class="cart-item-image" />
      <span>${item.name} (${item.color}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}</span>
      <button class="remove-btn" data-index="${index}">Remove</button>
    `;

    cartContainer.appendChild(itemDiv);
  });
    
 document.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.dataset.index, 10);
      cart.splice(idx, 1);  // remove from cart array
      renderCartUI();       // re-render
      saveCartToFirestore();
    });
  });
}

// --- Function to save cart to Firestore ---
async function saveCartToFirestore() {
    if (!auth.currentUser) return; // Skip if not logged in
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await setDoc(userRef, { cart }, { merge: true });
        console.log("🛒 Cart saved successfully to Firestore!");
    } catch (error) {
        console.error("❌ Error saving cart:", error);
    }
}

// --- Function to update the cart ---
function updateCart(newCart) {
    cart = newCart;
    renderCartUI();
    saveCartToFirestore(); // Auto-save whenever cart changes
}
    
// Load cart from Firestore
async function loadCartFromFirestore() {
    if (!auth.currentUser) return;
    try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const docSnap = await getDoc(userRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            cart = Array.isArray(data.cart) ? data.cart : [];
            console.log("📦 Cart loaded from Firestore:", cart);
        } else {
            cart = [];
            console.log("ℹ️ No saved cart found, starting empty.");
        }
        renderCartUI();
    } catch (error) {
        console.error("❌ Error loading cart:", error);
    }
}

// Add order to payment history
async function addOrderToHistory(order) {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, {
            history: arrayUnion(order)
        });
    }
}

// Load payment history
async function loadHistoryFromFirestore() {
    const user = auth.currentUser;
    if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
            return userSnap.data().history || [];
        }
    }
    return [];
}

function goToCheckout() {
    if(!auth.currentUser){
        alert("⚠️ Please sign in to checkout.");
        showLoginUI();
        return;
    }
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.getElementById('cartPage').style.display = 'block';
    renderCartUI();
    let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    document.getElementById('cartTotal').textContent = total.toFixed(2);
    /*const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.textContent = `${item.name} (${item.color}) x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
    });

    document.getElementById('cartTotal').textContent = total.toFixed(2);*/
}
document.getElementById('goToCheckoutBtn').addEventListener('click', goToCheckout);

function closeCart() {
    document.getElementById('cartPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
}

async function completePurchase() {
    if(!auth.currentUser){
        alert("⚠️ You must be signed in to complete a purchase.");
        showLoginUI();
        return;
    }
   alert('Purchase completed successfully!');
   const order = {
       items: [...cart],
       date: new Date().toISOString(),
       paymentStatus: 'paid'
   };
   await addOrderToHistory(order);
   cart = [];
   //renderCartUI();
   await saveCartToFirestore(cart);
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

async function addNewProduct() {
    const name = document.getElementById('newProductName').value.trim();
    const category = document.getElementById('newProductCategory').value;
    const image = document.getElementById('newProductImage').value.trim() || 'https://via.placeholder.com/200x150?text=New+Product';
    const priceInput = document.getElementById('newProductPrice').value;
    const price = priceInput ? parseFloat(priceInput) : 19.99;
    const stock = {
        "Red": parseInt(document.getElementById('stockRed').value, 10) || 0,
        "Blue": parseInt(document.getElementById('stockBlue').value, 10) || 0,
        "Black": parseInt(document.getElementById('stockBlack').value, 10) || 0
    };
    //const imageFileInput = document.getElementById('newProductImageFile');
    //const imageFile = imageFileInput.files[0];
    if (!name) {
        alert('Please enter a product name.');
        return;
    }
    /*let imageUrl = 'https://via.placeholder.com/200x150?text=New+Product';
    if (imageFile) {
        // Upload image to Firebase Storage
        const storageRef = ref(storage, `productImages/${Date.now()}_${imageFile.name}`);
        await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(storageRef);
    }*/
    // Add to sampleProducts and re-render
    const newProduct = { name, category, image, price, stock };
     try {
        await addDoc(collection(db, "products"), newProduct); // FIRESTORE SAVE!
        alert('Product added!');
        //backToShop();
        //await loadProductsFromFirestore();
        document.getElementById('newProductName').value = '';
        document.getElementById('newProductImage').value = '';
        document.getElementById('newProductCategory').selectedIndex = 0;
        document.getElementById('newProductPrice').value = '';
        await loadProductsFromFirestore();
    } catch (e) {
        alert("Error adding product: " + e.message);
    }
    // Clear form
    alert('Product added!');
    backToShop();
    renderProducts();
}
document.getElementById('addNewProductBtn').addEventListener('click', addNewProduct);

async function deleteProduct(index) {
    if (confirm('Are you sure you want to delete this product?')) {
         const productId = products[index].id;
        try {
            await deleteDoc(doc(db, "products", productId));
            alert('Product deleted!');
            await loadProductsFromFirestore();
        } catch (e) {
            alert("Error deleting product: " + e.message);
        }
    }
        renderProducts();
    }

// --- Edit Product Functionality ---
function showEditProductPage(index) {
    editProductIndex = index;
    const product = products[editProductIndex];
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editstockRed').value = product.stock?.Red ?? 0;
    document.getElementById('editstockBlue').value = product.stock?.Blue ?? 0;
    document.getElementById('editstockBlack').value = product.stock?.Black ?? 0;    
    const preview = document.getElementById('editProductPreview');
    preview.src = product.image;
    preview.style.display = 'block';
    document.getElementById('editProductPage').style.display = 'block';
    document.querySelector('.products').style.display = 'none';
    document.querySelector('.checkout').style.display = 'none';
    document.querySelector('.filters').style.display = 'none';
}

async function saveEditProduct() {
    if (editProductIndex === null) return;
    const product = products[editProductIndex];
    const name = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editProductCategory').value;
    const image = document.getElementById('editProductImage').value.trim() || 'https://via.placeholder.com/200x150?text=No+Image';
    const priceInput = document.getElementById('editProductPrice').value;
    const price = priceInput ? parseFloat(priceInput) : 19.99;
    const stock = {
        Red: parseInt(document.getElementById('editstockRed').value, 10) || 0,
        Blue: parseInt(document.getElementById('editstockBlue').value, 10) || 0,
        Black: parseInt(document.getElementById('editstockBlack').value, 10) || 0
    }
    if (!name) {
        alert('Please enter a product name.');
        return;
    } 

    try {
        await setDoc(doc(db, "products", product.id), { name, category, image, price, stock }, { merge: true });
        alert('Product updated!');
        editProductIndex = null;
        document.getElementById('editProductPage').style.display = 'none';
        await loadProductsFromFirestore();
    } catch (e) {
        alert("Error updating product: " + e.message);
    }
    document.getElementById('editProductPage').style.display = 'none';
    document.querySelector('.products').style.display = 'grid';
    document.querySelector('.checkout').style.display = 'block';
    document.querySelector('.filters').style.display = 'block';
    renderProducts();
}
document.getElementById('saveEditProductBtn').addEventListener('click', saveEditProduct);

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
function renderProducts(selectedColor = 'all') {
    const container = document.getElementById('productList');
    container.innerHTML = '';
    products.forEach((product, idx) => {
        const div = document.createElement('div');
        div.className = 'product';
        div.setAttribute('data-category', product.category);
        let productHtml = `
            <img src="${product.image}" alt="${product.name}" />
            <h3>${product.name}</h3>
            <p class="product-price">$${product.price.toFixed(2)}</p>
        `;
        if (currentUserRole === "seller") {
            let colorOptions = `<option value="all">All</option>`; // 👈 add All first;
            for(const color in product.stock){
                colorOptions += `<option value="${color}">${color}</option>`;
            }
            //const firstColor = Object.keys(product.stock)[0] || 'all';
            const totalStock = Object.values(product.stock).reduce((sum, val) => sum + (val || 0), 0);
            //product.stock[firstColor] === 'all' ? totalStock : product.stock[firstColor];
            productHtml += `
            <label for="sellerColorSelect${idx}">Color:</label>
            <select class="seller-color-select" data-idx="${idx}" id="sellerColorSelect${idx}">
            ${colorOptions}
            </select>
            <span id="stockDisplay${idx}" class="stock-display">
            ${totalStock} in stock
            </span>
            `;
            //${product.stock && product.stock[firstColor] !== undefined ? product.stock[firstColor] : 0} in stock
        }else {
            productHtml += `
            <select>
                <option>Red</option>
                <option>Blue</option>
                <option>Black</option>
            </select>
            <input type="number" value="1" min="1" />
            <button class="add-to-cart-btn" data-name="${product.name}">Add to Cart</button>
            `;
        }
            if(isLoggedIn) { 
                productHtml += `
                <button class="delete-btn" data-idx="${idx}" style="margin-top:0.5rem;background:#bf0a30;">Delete</button>
                <button class="edit-btn" data-idx="${idx}" style="margin-top:0.5rem;background:#007bff;">Edit</button>
                `;
            }
        div.innerHTML = productHtml;
        container.appendChild(div);
    });
    container.querySelectorAll('.seller-color-select').forEach(select => {
        select.addEventListener('change', function() {
            const idx = this.getAttribute('data-idx');
            const selectedColor = this.value;
            let stock;
            if (selectedColor === "all"){
                stock =  Object.values(products[idx].stock)
                 .reduce((sum, val) => sum + (val || 0), 0);
            } else {
                stock = products[idx].stock && products[idx].stock[selectedColor] !== undefined
                ? products[idx].stock[selectedColor]
                : 0;
            }
            //const selectedColor = this.value;
            //const stock = products[idx].stock && products[idx].stock[selectedColor] !== undefined ? products[idx].stock[selectedColor] : 0;
            document.getElementById('stockDisplay' + idx).textContent = `${stock} in stock`;
        });
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
  container.querySelectorAll('.add-to-cart-btn').forEach((btn, idx) => {
      btn.addEventListener('click', function() {
      //const idx = Number(this.dataset.idx);
      const product = { ...products[idx] }; // copy base product
      const parent = this.closest('.product');
      product.color = parent.querySelector('select').value;
      product.quantity = parseInt(parent.querySelector('input').value, 10) || 1;
      addToCart(product);
      });
  });
    updateUIByRole(currentUserRole);
}
document.getElementById('goToCheckoutBtn').addEventListener('click', goToCheckout);
document.getElementById('closeCartBtn').addEventListener('click', closeCart);
document.getElementById('completePurchaseBtn').addEventListener('click', completePurchase);

function logout() {
    signOut(auth).then(() => {
        isLoggedIn = false;
        showLoginUI();
    }).catch((error) => {
        alert("Logout failed: " + error.message);
    });
}

window.onload = async () => {
    await loadProductsFromFirestore();
    renderProducts('all');
    renderCategoryDropdown()

    if (!isLoggedIn) {
        /*document.getElementById('loginPage').style.display = 'block';
        document.querySelector('header').style.display = 'none';
        document.querySelector('nav').style.display = 'none';
        document.querySelector('.filters').style.display = 'none';
        document.querySelector('.products').style.display = 'none';
        document.querySelector('.checkout').style.display = 'none';
        document.getElementById('addProductNavBtn').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'none';*/
        document.getElementById('loginPage').style.display = 'none';
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.filters').style.display = 'block';
        document.querySelector('.products').style.display = 'grid';
        document.querySelector('.checkout').style.display = 'block';
        document.getElementById('addProductNavBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
    } /*else {
        document.getElementById('loginPage').style.display = 'none';
        document.querySelector('header').style.display = 'block';
        document.querySelector('nav').style.display = 'flex';
        document.querySelector('.filters').style.display = 'block';
        document.querySelector('.products').style.display = 'grid';
        document.querySelector('.checkout').style.display = 'block';
        document.getElementById('addProductNavBtn').style.display = 'inline-block';
        document.getElementById('logoutBtn').style.display = 'inline-block';
    }*/
};





































































































