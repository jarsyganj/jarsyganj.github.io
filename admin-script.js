// admin/admin-script.js (For Admin Dashboard logic: orders, feedback management)

document.addEventListener('DOMContentLoaded', function() {
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const dashboardSections = document.querySelectorAll('.dashboard-section');
    
    // Using optional chaining to safely get elements and their children
    const ordersTable = document.getElementById('ordersTable');
    const ordersTableBody = ordersTable ? ordersTable.querySelector('tbody') : null;

    const completedOrdersTable = document.getElementById('completedOrdersTable');
    const completedOrdersTableBody = completedOrdersTable ? completedOrdersTable.querySelector('tbody') : null;

    const feedbackTable = document.getElementById('feedbackTable');
    const feedbackTableBody = feedbackTable ? feedbackTable.querySelector('tbody') : null;

    const feedbackTabButtons = document.querySelectorAll('.feedback-tab-btn');

    // --- Admin Authentication (Client-side Demo with LocalStorage) ---
    const adminLoginForm = document.getElementById('adminLoginForm');
    const loginMessageDiv = document.getElementById('loginMessage');
    const adminLogoutBtn = document.getElementById('admin-logout-btn');

    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'admin123'; // !!! IMPORTANT: CHANGE THIS FOR PRODUCTION !!!

    // Handle Admin Login Form Submission
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Prevent default form submission

            const username = adminLoginForm.elements['username'].value;
            const password = adminLoginForm.elements['password'].value;

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                localStorage.setItem('adminLoggedIn', 'true'); // Set login status in localStorage
                localStorage.setItem('adminUsername', username); // Save username for display
                window.location.href = 'admin-dashboard.html'; // Redirect to dashboard
            } else {
                if (loginMessageDiv) {
                    loginMessageDiv.textContent = 'Invalid username or password. Please try again.';
                    loginMessageDiv.style.display = 'block';
                }
            }
        });
    }

    // Handle Admin Logout Button Click
    if (adminLogoutBtn) {
        adminLogoutBtn.addEventListener('click', function(event) {
            event.preventDefault();
            localStorage.removeItem('adminLoggedIn'); // Clear login status
            localStorage.removeItem('adminUsername'); // Clear username
            window.location.href = 'admin-login.html'; // Redirect to login page
        });
    }

    // Check login status for all admin pages except admin-login.html
    const currentPath = window.location.pathname;
    if (currentPath.includes('/admin-') && !currentPath.includes('/admin-login.html')) {
        if (localStorage.getItem('adminLoggedIn') !== 'true') {
            window.location.href = 'admin-login.html'; // If not logged in, redirect to login
        }
    }

    // --- Data Loading and Display Functions ---

    // Function to get orders from localStorage
    function getOrders() {
        return JSON.parse(localStorage.getItem('orders')) || [];
    }

    // Function to save orders to localStorage
    function saveOrders(ordersData) {
        localStorage.setItem('orders', JSON.stringify(ordersData));
    }

    // Function to get feedback from localStorage
    function getFeedbacks() {
        return JSON.parse(localStorage.getItem('feedbacks')) || [];
    }

    // Function to save feedback to localStorage
    function saveFeedbacks(feedbacksData) {
        localStorage.setItem('feedbacks', JSON.stringify(feedbacksData));
    }

    // Function to show the correct section and manage active sidebar link
    function showSection(sectionId) {
        dashboardSections.forEach(section => {
            section.style.display = 'none';
            section.classList.remove('active-section');
        });
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.style.display = 'block';
            targetSection.classList.add('active-section');
        }

        // Update active sidebar link
        sidebarLinks.forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
            if (link.getAttribute('data-section') + '-section' === sectionId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    // --- Render Orders ---
    function renderOrders() {
        if (!ordersTableBody || !completedOrdersTableBody) return;

        ordersTableBody.innerHTML = ''; // Clear active orders table
        completedOrdersTableBody.innerHTML = ''; // Clear completed orders table

        const orders = getOrders();
        // Sort orders by orderDate (most recent first)
        const sortedOrders = [...orders].sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

        let hasActiveOrders = false;
        let hasCompletedOrders = false;

        sortedOrders.forEach(order => {
            const row = document.createElement('tr');
            row.setAttribute('data-order-id', order.id); // Use order.id

            const displayDate = new Date(order.orderDate).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            // Format items list for display
            const itemsHtml = Array.isArray(order.items) ? order.items.map(item => `${item.name} (x${item.quantity})`).join('<br>') : 'N/A';

            // Determine if it's an active order or completed
            if (order.status === 'new' || order.status === 'pending' || order.status === 'shipped') {
                hasActiveOrders = true;
                row.innerHTML = `
                    <td data-label="Order ID">${order.id}</td>
                    <td data-label="Customer Name">${order.customerName}</td>
                    <td data-label="Mobile">${order.phoneNumber}</td>
                    <td data-label="Address">${order.address}</td>
                    <td data-label="Total">৳ ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td data-label="Status"><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td data-label="Date">${displayDate}</td>
                    <td class="actions-cell" data-label="Actions">
                        <select class="status-dropdown" data-order-id="${order.id}" aria-label="Change status for Order ${order.id}">
                            <option value="new" ${order.status === 'new' ? 'selected' : ''}>New</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Completed</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                        <button class="change-status-btn" data-order-id="${order.id}" aria-label="Update status for Order ${order.id}"><i class="fas fa-edit"></i> Update</button>
                        <button class="delete-btn" data-order-id="${order.id}" aria-label="Delete Order ${order.id}"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                ordersTableBody.appendChild(row);
            } else if (order.status === 'completed' || order.status === 'cancelled') {
                hasCompletedOrders = true;
                row.innerHTML = `
                    <td data-label="Order ID">${order.id}</td>
                    <td data-label="Customer Name">${order.customerName}</td>
                    <td data-label="Mobile">${order.phoneNumber}</td>
                    <td data-label="Address">${order.address}</td>
                    <td data-label="Total">৳ ${order.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td data-label="Status"><span class="status-badge status-${order.status}">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span></td>
                    <td data-label="Date">${displayDate}</td>
                    <td class="actions-cell" data-label="Actions"> <button class="delete-btn" data-order-id="${order.id}" aria-label="Delete Order ${order.id}"><i class="fas fa-trash"></i> Delete</button>
                    </td>
                `;
                completedOrdersTableBody.appendChild(row);
            }
        });

        // Display "No orders" message if no orders of a specific type are found
        if (!hasActiveOrders) {
            ordersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No active/pending orders.</td></tr>';
        }
        if (!hasCompletedOrders) {
            completedOrdersTableBody.innerHTML = '<tr><td colspan="8" style="text-align: center;">No completed orders found.</td></tr>'; // Changed colspan
        }

        attachOrderEventListeners(); // Attach event listeners after rendering
    }

    // --- Order Actions (Update Status, Delete) ---
    function updateOrderStatus(orderId, newStatus) {
        let orders = getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);

        if (orderIndex > -1) {
            orders[orderIndex].status = newStatus;
            saveOrders(orders);
            alert(`Order ${orderId} status updated to ${newStatus}.`);
            renderOrders(); // Re-render tables to reflect changes
        } else {
            alert('Order not found.');
        }
    }

    function deleteOrder(orderId) {
        if (!confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
            return;
        }
        let orders = getOrders();
        orders = orders.filter(order => order.id !== orderId); // Filter by order.id
        saveOrders(orders);
        alert(`Order ${orderId} has been deleted.`);
        renderOrders(); // Re-render tables
    }

    // --- Attach Order Event Listeners ---
    function attachOrderEventListeners() {
        if (ordersTableBody) {
            ordersTableBody.querySelectorAll('.change-status-btn').forEach(button => {
                button.onclick = (e) => {
                    const orderId = parseInt(e.target.dataset.orderId);
                    const dropdown = e.target.previousElementSibling; // The select dropdown
                    const newStatus = dropdown.value;
                    updateOrderStatus(orderId, newStatus);
                };
            });
            ordersTableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.onclick = (e) => {
                    const orderId = parseInt(e.target.dataset.orderId);
                    deleteOrder(orderId);
                };
            });
        }
        // Attach delete listeners for completed orders table as well
        if (completedOrdersTableBody) {
            completedOrdersTableBody.querySelectorAll('.delete-btn').forEach(button => {
                button.onclick = (e) => {
                    const orderId = parseInt(e.target.dataset.orderId);
                    deleteOrder(orderId);
                };
            });
        }
    }

    // --- Render Feedback ---
    function renderFeedback(statusFilter) {
        if (!feedbackTableBody) return;

        feedbackTableBody.innerHTML = ''; // Clear feedback table
        const feedbacks = getFeedbacks();

        // Filter based on status, ensuring case-insensitivity for 'unread'/'read'
        const filteredFeedback = feedbacks.filter(f => statusFilter.toLowerCase() === 'all' || f.status.toLowerCase() === statusFilter.toLowerCase());
        
        // Sort by most recent date
        filteredFeedback.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        if (filteredFeedback.length === 0) {
            feedbackTableBody.innerHTML = `<tr><td colspan="7" style="text-align: center;">No ${statusFilter.toLowerCase()} feedback found.</td></tr>`;
            return;
        }

        filteredFeedback.forEach(item => {
            const row = document.createElement('tr');
            row.setAttribute('data-feedback-id', item.id);

            const displayDate = new Date(item.timestamp).toLocaleString('en-GB', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            row.innerHTML = `
                <td data-label="Name">${item.name}</td>
                <td data-label="Email">${item.email}</td>
                <td data-label="Subject">${item.subject || 'N/A'}</td>
                <td data-label="Message">${item.message.substring(0, 100)}${item.message.length > 100 ? '...' : ''}</td>
                <td data-label="Status"><span class="status-badge status-${item.status.toLowerCase()}">${item.status}</span></td>
                <td data-label="Date">${displayDate}</td>
                <td class="actions-cell" data-label="Actions">
                    ${item.status.toLowerCase() === 'unread' ? `<button class="mark-read-btn" data-feedback-id="${item.id}" aria-label="Mark feedback ${item.id} as Read"><i class="fas fa-check-circle"></i> Mark as Read</button>` : ''}
                    <button class="delete-feedback-btn" data-feedback-id="${item.id}" aria-label="Delete feedback ${item.id}"><i class="fas fa-trash"></i> Delete</button>
                </td>
            `;
            feedbackTableBody.appendChild(row);
        });
        attachFeedbackEventListeners(); // Attach event listeners after rendering
    }

    // --- Feedback Actions (Mark as Read, Delete) ---
    function markFeedbackAsRead(feedbackId) {
        let feedbacks = getFeedbacks();
        const feedbackIndex = feedbacks.findIndex(f => f.id === feedbackId);

        if (feedbackIndex > -1) {
            feedbacks[feedbackIndex].status = 'Read'; // Update status to 'Read'
            saveFeedbacks(feedbacks);
            alert(`Feedback ${feedbackId} marked as Read.`);
            // Re-render the feedback table based on the currently active tab
            const activeTab = document.querySelector('.feedback-tab-btn.active-tab');
            renderFeedback(activeTab ? activeTab.dataset.tab : 'Unread');
        } else {
            alert('Feedback not found.');
        }
    }

    function deleteFeedback(feedbackId) {
        if (!confirm(`Are you sure you want to delete feedback ${feedbackId}? This action cannot be undone.`)) {
            return;
        }
        let feedbacks = getFeedbacks();
        feedbacks = feedbacks.filter(f => f.id !== feedbackId);
        saveFeedbacks(feedbacks);
        alert(`Feedback ${feedbackId} has been deleted.`);
        // Re-render the feedback table based on the currently active tab
        const activeTab = document.querySelector('.feedback-tab-btn.active-tab');
        renderFeedback(activeTab ? activeTab.dataset.tab : 'Unread');
    }

    // --- Attach Feedback Event Listeners ---
    function attachFeedbackEventListeners() {
        if (feedbackTableBody) {
            feedbackTableBody.querySelectorAll('.mark-read-btn').forEach(button => {
                button.onclick = (e) => {
                    const feedbackId = parseInt(e.target.dataset.feedbackId);
                    markFeedbackAsRead(feedbackId);
                };
            });
            feedbackTableBody.querySelectorAll('.delete-feedback-btn').forEach(button => {
                button.onclick = (e) => {
                    const feedbackId = parseInt(e.target.dataset.feedbackId);
                    deleteFeedback(feedbackId);
                };
            });
        }
    }

    // --- Event Listeners for Sidebar Navigation ---
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault();
            
            // Remove active from all links and add to clicked one
            sidebarLinks.forEach(l => {
                l.classList.remove('active');
                l.removeAttribute('aria-current');
            });
            this.classList.add('active');
            this.setAttribute('aria-current', 'page');

            const sectionToShow = this.getAttribute('data-section');
            if (sectionToShow) {
                showSection(sectionToShow + '-section');
                if (sectionToShow === 'orders' || sectionToShow === 'completed-orders') {
                    renderOrders(); // Load and render all orders
                } else if (sectionToShow === 'feedback') {
                    // Reset feedback tabs to 'Unread' when Feedback section is opened
                    feedbackTabButtons.forEach(btn => {
                        btn.classList.remove('active-tab');
                        btn.setAttribute('aria-selected', 'false');
                    });
                    const unreadTabBtn = document.querySelector('.feedback-tab-btn[data-tab="Unread"]');
                    if (unreadTabBtn) {
                        unreadTabBtn.classList.add('active-tab');
                        unreadTabBtn.setAttribute('aria-selected', 'true');
                    }
                    renderFeedback('Unread'); // Load and render unread feedback by default
                }
            } else if (this.id === 'admin-logout-btn') { // Check by ID for logout
                localStorage.removeItem('adminLoggedIn');
                localStorage.removeItem('adminUsername');
                alert('Logging out...');
                window.location.href = 'admin-login.html';
            }
        });
    });

    // --- Event Listeners for Feedback Tabs ---
    feedbackTabButtons.forEach(button => {
        button.addEventListener('click', function() {
            feedbackTabButtons.forEach(btn => {
                btn.classList.remove('active-tab');
                btn.setAttribute('aria-selected', 'false');
            });
            this.classList.add('active-tab');
            this.setAttribute('aria-current', 'page'); // Set aria-current for active tab
            renderFeedback(this.dataset.tab);
        });
    });

    // --- Initial Load on Dashboard ---
    if (currentPath.includes('/admin-dashboard.html')) {
        // Update dashboard title with username
        const adminWelcomeH1 = document.querySelector('.admin-main-content h1');
        if (adminWelcomeH1) {
            const username = localStorage.getItem('adminUsername') || 'Admin';
            adminWelcomeH1.textContent = `Welcome, ${username}!`;
        }
        
        // Simulate clicking the "Orders" sidebar link to load default content.
        const initialOrderLink = document.querySelector('.sidebar-link[data-section="orders"]');
        if (initialOrderLink) {
            initialOrderLink.click();
        }
    }
});