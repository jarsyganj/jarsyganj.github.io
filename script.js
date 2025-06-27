document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const navLinks = document.querySelector('.nav-links');

    // Hamburger Menu Toggle
    if (hamburgerMenu && navLinks) {
        hamburgerMenu.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });
    }

    // --- Product Data (Client-side simulation) ---
    const allProducts = [
        { id: 'prod001', name: 'Football Team Jersey', price: 39.99, imageUrl: 'https://via.placeholder.com/300x300?text=Football+Jersey' },
        { id: 'prod002', name: 'Cricket Team Jersey', price: 35.99, imageUrl: 'https://via.placeholder.com/300x300?text=Cricket+Jersey' },
        { id: 'prod003', name: 'Basketball Team Jersey', price: 42.99, imageUrl: 'https://via.placeholder.com/300x300?text=Basketball+Jersey' },
        { id: 'prod004', name: 'Team A Home Jersey', price: 45.00, imageUrl: 'https://via.placeholder.com/300x300?text=Team+A+Jersey' },
        { id: 'prod005', name: 'Team B Away Jersey', price: 42.50, imageUrl: 'https://via.placeholder.com/300x300?text=Team+B+Jersey' },
        { id: 'prod006', name: 'Team C Special Edition', price: 49.99, imageUrl: 'https://via.placeholder.com/300x300?text=Team+C+Jersey' },
        { id: 'prod007', name: 'Team D Training Kit', price: 38.00, imageUrl: 'https://via.placeholder.com/300x300?text=Team+D+Jersey' }
    ];

    // --- Product Rendering (for index.html and products.html) ---
    const productsContainer = document.querySelector('.product-grid');
    if (productsContainer) {
        productsContainer.innerHTML = ''; 

        let productsToDisplay = [];
        if (document.body.classList.contains('home-page')) {
            productsToDisplay = allProducts.slice(0, 3);
        } else if (document.body.classList.contains('products-page')) {
            productsToDisplay = allProducts;
        }

        productsToDisplay.forEach(product => {
            const productCard = document.createElement('div');
            productCard.classList.add('product-card');
            productCard.innerHTML = `
                <img src="${product.imageUrl}" alt="${product.name}">
                <h3>${product.name}</h3>
                <p class="price">৳${product.price.toFixed(2)}</p>
                <div class="product-actions">
                    <button class="btn btn-secondary add-to-cart-btn"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.imageUrl}">Add to Cart</button>
                    <a href="#" class="btn btn-primary buy-now-btn"
                        data-id="${product.id}"
                        data-name="${product.name}"
                        data-price="${product.price}"
                        data-image="${product.imageUrl}">Buy Now</a>
                </div>
            `;
            productsContainer.appendChild(productCard);
        });
    }

    // --- Cart Management Logic ---
    const cartItemsContainer = document.querySelector('.cart-items');
    const emptyCartMessage = document.querySelector('.empty-cart-message');
    const subtotalDisplay = document.querySelector('.cart-summary .summary-row .summary-value');
    const totalAmountDisplay = document.querySelector('.cart-summary .total-row .total-amount');
    const deliveryChargePerSingleItem = 120.00; // Delivery charge per single item/quantity

    function getCart() {
        return JSON.parse(localStorage.getItem('cart')) || [];
    }

    function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
    }

    function addToCart(productId, name, price, imageUrl, quantity = 1) {
        let cart = getCart();
        let itemExists = false;

        cart.forEach(item => {
            if (item.id === productId) {
                item.quantity += quantity;
                itemExists = true;
            }
        });

        if (!itemExists) {
            cart.push({ id: productId, name: name, price: price, imageUrl: imageUrl, quantity: quantity });
        }

        saveCart(cart);
        alert(`${name} added to cart!`);
        renderCart();
    }

    function updateCartQuantity(productId, action) {
        let cart = getCart();
        cart.forEach(item => {
            if (item.id === productId) {
                if (action === 'increase') {
                    item.quantity++;
                } else if (action === 'decrease' && item.quantity > 1) {
                    item.quantity--;
                }
            }
        });
        saveCart(cart);
        renderCart();
    }

    function removeFromCart(productId) {
        let cart = getCart();
        cart = cart.filter(item => item.id !== productId);
        localStorage.setItem('cart', JSON.stringify(cart));
        renderCart();
    }

    function updateCartSummary() {
        const cart = getCart();
        let subtotal = 0;
        let totalQuantities = 0; // To count total number of all items (quantities combined)

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
            totalQuantities += item.quantity; // Summing up all quantities
        });

        const totalDeliveryCharge = totalQuantities * deliveryChargePerSingleItem; 

        const total = subtotal + totalDeliveryCharge;

        if (subtotalDisplay) { // For cart.html
            subtotalDisplay.textContent = `৳${subtotal.toFixed(2)}`;
        }
        // Update the delivery charge display on cart.html explicitly
        const cartDeliveryChargeDisplay = document.querySelector('.cart-summary .summary-row.delivery-row .summary-value');
        if (cartDeliveryChargeDisplay) {
            cartDeliveryChargeDisplay.textContent = `৳${totalDeliveryCharge.toFixed(2)}`;
        }
        if (totalAmountDisplay) { // For cart.html total
            totalAmountDisplay.textContent = `৳${total.toFixed(2)}`;
        }

        const checkoutSubtotalDisplay = document.querySelector('.checkout-section .subtotal-row .summary-value');
        const checkoutDeliveryChargeDisplay = document.querySelector('.checkout-section .delivery-row .summary-value');
        const checkoutTotalAmountDisplay = document.querySelector('.checkout-section .total-row .total-amount-checkout');

        if (checkoutSubtotalDisplay) { // For checkout.html subtotal
            checkoutSubtotalDisplay.textContent = `৳${subtotal.toFixed(2)}`;
        }
        if (checkoutDeliveryChargeDisplay) { // For checkout.html delivery charge
            checkoutDeliveryChargeDisplay.textContent = `৳${totalDeliveryCharge.toFixed(2)}`;
        }
        if (checkoutTotalAmountDisplay) { // For checkout.html total
            checkoutTotalAmountDisplay.textContent = `৳${total.toFixed(2)}`;
            const orderForm = document.querySelector('.checkout-form');
            if (orderForm) {
                let hiddenTotalInput = orderForm.querySelector('input[name="totalAmount"]');
                if (!hiddenTotalInput) {
                    hiddenTotalInput = document.createElement('input');
                    hiddenTotalInput.type = 'hidden';
                    hiddenTotalInput.name = 'totalAmount';
                    orderForm.appendChild(hiddenTotalInput);
                }
                hiddenTotalInput.value = total.toFixed(2);
            }
        }
    }

    function renderCart() {
        const cart = getCart();

        // For cart.html
        if (cartItemsContainer) {
            cartItemsContainer.innerHTML = '';

            if (cart.length === 0) {
                emptyCartMessage.style.display = 'flex';
                document.querySelector('.cart-summary').style.display = 'none';
            } else {
                emptyCartMessage.style.display = 'none';
                document.querySelector('.cart-summary').style.display = 'block';
                cart.forEach(item => {
                    const cartItemDiv = document.createElement('div');
                    cartItemDiv.classList.add('cart-item');
                    cartItemDiv.innerHTML = `
                        <img src="${item.imageUrl}" alt="${item.name}">
                        <div class="item-details">
                            <h3>${item.name}</h3>
                            <p class="item-price">৳${item.price.toFixed(2)}</p>
                            <div class="quantity-control">
                                <button class="qty-btn" data-id="${item.id}" data-action="decrease">-</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn" data-id="${item.id}" data-action="increase">+</button>
                            </div>
                            <button class="btn btn-danger btn-small remove-from-cart-btn" data-id="${item.id}">Remove</button>
                        </div>
                    `;
                    cartItemsContainer.appendChild(cartItemDiv);
                });
            }
            updateCartSummary();
        }

        // For checkout.html order summary
        const checkoutSummaryList = document.querySelector('.order-summary-checkout .summary-items-list');
        if (checkoutSummaryList) {
            checkoutSummaryList.innerHTML = ''; // Clear existing items

            if (cart.length === 0) {
                checkoutSummaryList.innerHTML = `
                    <div class="summary-item-placeholder">
                        <p>No items in cart. Please add products from the shop page.</p>
                    </div>`;
            } else {
                // Display individual items with their quantities and prices
                cart.forEach(item => {
                    const summaryItemDiv = document.createElement('div');
                    summaryItemDiv.classList.add('summary-item');
                    summaryItemDiv.innerHTML = `
                        <span>${item.name} (x${item.quantity})</span>
                        <span>৳${(item.price * item.quantity).toFixed(2)}</span>
                    `;
                    checkoutSummaryList.appendChild(summaryItemDiv);
                });
            }
            updateCartSummary(); // Ensure summary is updated for checkout page as well
        }
    }

    // Event listeners for "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', function() {
            const productId = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const imageUrl = this.dataset.image;
            addToCart(productId, name, price, imageUrl);
        });
    });

    // Event listeners for "Buy Now" buttons
    document.querySelectorAll('.buy-now-btn').forEach(button => {
        button.addEventListener('click', function(event) {
            event.preventDefault();
            const productId = this.dataset.id;
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const imageUrl = this.dataset.image;

            // Clear current cart and add only this item
            localStorage.removeItem('cart');
            addToCart(productId, name, price, imageUrl, 1);

            window.location.href = 'checkout.html';
        });
    });


    // Event Delegation for quantity and remove buttons in cart (on cart.html)
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('qty-btn')) {
                const productId = target.dataset.id;
                const action = target.dataset.action;
                updateCartQuantity(productId, action);
            } else if (target.classList.contains('remove-from-cart-btn')) {
                const productId = target.dataset.id;
                if (confirm('Are you sure you want to remove this item from your cart?')) {
                    removeFromCart(productId);
                }
            }
        });
    }

    // --- Form Submission Logic ---

    // Contact Us Form Submission (using localStorage for demo)
    const contactForm = document.getElementById('feedback-form');
    const feedbackMessageDiv = document.getElementById('feedback-message');
    if (contactForm && feedbackMessageDiv) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const name = contactForm.elements['name'].value;
            const email = contactForm.elements['email'].value;
            const subject = contactForm.elements['subject'].value;
            const message = contactForm.elements['message'].value;

            let feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];

            const newFeedback = {
                id: Date.now(),
                name: name,
                email: email,
                subject: subject,
                message: message,
                status: 'Unread',
                timestamp: new Date().toISOString()
            };

            feedbacks.push(newFeedback);
            localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

            feedbackMessageDiv.textContent = 'Thank you for your feedback! We will get back to you soon.';
            feedbackMessageDiv.style.color = 'green';
            contactForm.reset();
            setTimeout(() => { feedbackMessageDiv.textContent = ''; }, 5000);
        });
    }

    // Checkout Form Submission (using localStorage for demo)
    const checkoutForm = document.querySelector('.checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const cart = getCart();
            if (cart.length === 0) {
                alert('Your cart is empty. Please add items before placing an order.');
                return;
            }

            const fullName = checkoutForm.elements['fullName'].value;
            const phoneNumber = checkoutForm.elements['phoneNumber'].value;
            const address = checkoutForm.elements['address'].value;
            const paymentMethod = checkoutForm.elements['paymentMethod'].value;
            const totalAmount = parseFloat(checkoutForm.elements['totalAmount'].value);

            let orders = JSON.parse(localStorage.getItem('orders')) || [];

            const newOrder = {
                id: Date.now(),
                customerName: fullName,
                phoneNumber: phoneNumber,
                address: address,
                paymentMethod: paymentMethod,
                totalAmount: totalAmount,
                items: cart,
                status: 'new',
                orderDate: new Date().toISOString()
            };

            orders.push(newOrder);
            localStorage.setItem('orders', JSON.stringify(orders));
            localStorage.removeItem('cart');

            alert('Your order has been placed successfully! Order ID: ' + newOrder.id + '\nTotal: ৳ ' + totalAmount.toFixed(2));
            window.location.href = 'index.html';
        });
    }

    // Initial rendering calls
    renderCart();
});