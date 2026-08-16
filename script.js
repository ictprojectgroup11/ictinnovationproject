// Shopping List Application Script

// Core Data Model
let shoppingList = JSON.parse(localStorage.getItem('shoppingRecords')) || [];

// DOM Elements
const form = document.getElementById('shopping-form');
const nameInput = document.getElementById('item-name');
const qtyInput = document.getElementById('item-qty');
const tableBody = document.getElementById('records-body');
const totalCountEl = document.getElementById('total-count');
const purchasedCountEl = document.getElementById('purchased-count');
const emptyState = document.getElementById('empty-state');
const clearAllBtn = document.getElementById('clear-all-btn');
const searchInput = document.getElementById('search-input');

// Modal Elements
const editModal = document.getElementById('editModal');
const editForm = document.getElementById('editForm');
const editItemId = document.getElementById('editItemId');
const editItemName = document.getElementById('editItemName');
const editItemQty = document.getElementById('editItemQty');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelEditBtn = document.getElementById('cancelEdit');

// Utility: Generate Unique ID
function generateId() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

// Core Functionality: Render List & Update Stats
function renderUI(filterText = "") {
    tableBody.innerHTML = '';
    
    // Search Filtering
    let displayList = shoppingList;
    if (filterText) {
        const lowerCaseFilter = filterText.toLowerCase();
        displayList = shoppingList.filter(item => item.name.toLowerCase().includes(lowerCaseFilter));
    }
    
    if (displayList.length === 0) {
        emptyState.style.display = 'block';
        tableBody.parentElement.style.display = 'none';
    } else {
        emptyState.style.display = 'none';
        tableBody.parentElement.style.display = 'table';
        
        displayList.forEach(item => {
            const tr = document.createElement('tr');
            
            // Name cell
            const nameCell = document.createElement('td');
            nameCell.className = `item-name-cell ${item.purchased ? 'purchased-text' : ''}`;
            nameCell.innerText = item.name;
            
            // Qty cell
            const qtyCell = document.createElement('td');
            qtyCell.innerText = item.quantity;
            
            // Status cell
            const statusCell = document.createElement('td');
            const statusBadge = document.createElement('span');
            statusBadge.className = `status-badge ${item.purchased ? 'purchased' : 'pending'}`;
            statusBadge.innerText = item.purchased ? 'Purchased' : 'Pending';
            statusBadge.title = 'Click to toggle status';
            statusBadge.onclick = () => toggleStatus(item.id);
            statusCell.appendChild(statusBadge);
            
            // Actions cell
            const actionCell = document.createElement('td');
            const actionDiv = document.createElement('div');
            actionDiv.className = 'actions-container';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'btn-icon edit';
            editBtn.innerHTML = 'EDIT';
            editBtn.style.fontSize = '0.7rem';
            editBtn.onclick = () => openEditModal(item.id);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn-icon delete';
            deleteBtn.innerHTML = 'DEL';
            deleteBtn.style.fontSize = '0.7rem';
            deleteBtn.onclick = () => deleteItem(item.id);
            
            actionDiv.appendChild(editBtn);
            actionDiv.appendChild(deleteBtn);
            actionCell.appendChild(actionDiv);
            
            tr.appendChild(nameCell);
            tr.appendChild(qtyCell);
            tr.appendChild(statusCell);
            tr.appendChild(actionCell);
            
            tableBody.appendChild(tr);
        });
    }
    updateStats();
}

// Logic: Compute Stats and Persist to Local Storage
function updateStats() {
    totalCountEl.innerText = shoppingList.length;
    const purchased = shoppingList.filter(i => i.purchased).length;
    purchasedCountEl.innerText = purchased;
    
    // Save to Local Storage
    localStorage.setItem('shoppingRecords', JSON.stringify(shoppingList));
}

// Event Listeners: Add Item
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const qty = parseInt(qtyInput.value) || 1;
    
    if (name) {
        shoppingList.push({
            id: generateId(),
            name,
            quantity: qty,
            purchased: false
        });
        
        nameInput.value = '';
        qtyInput.value = '1';
        renderUI(searchInput.value);
    }
});

// Event Listeners: Clear All
clearAllBtn.addEventListener('click', () => {
    if(shoppingList.length > 0 && confirm('Are you sure you want to clear all your groceries? This cannot be undone.')) {
        shoppingList = [];
        renderUI(searchInput.value);
    }
});

// Event Listeners: Search Items
searchInput.addEventListener('input', (e) => {
    renderUI(e.target.value);
});

// Logic: Delete Item
function deleteItem(id) {
    if(confirm('Remove this item from the list?')) {
        shoppingList = shoppingList.filter(item => item.id !== id);
        renderUI(searchInput.value);
    }
}

// Logic: Toggle Status
function toggleStatus(id) {
    const item = shoppingList.find(i => i.id === id);
    if(item) {
        item.purchased = !item.purchased;
        renderUI(searchInput.value);
    }
}

// Logic: Edit Flow (Modal Management)
function openEditModal(id) {
    const item = shoppingList.find(i => i.id === id);
    if(item) {
        editItemId.value = item.id;
        editItemName.value = item.name;
        editItemQty.value = item.quantity;
        editModal.classList.remove('hidden');
    }
}

function closeEditModal() {
    editModal.classList.add('hidden');
}

closeModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

editForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = editItemId.value;
    const item = shoppingList.find(i => i.id === id);
    if(item) {
        const newName = editItemName.value.trim();
        if(newName) {
            item.name = newName;
            item.quantity = parseInt(editItemQty.value) || 1;
            closeEditModal();
            renderUI(searchInput.value);
        }
    }
});

// Initialize App
renderUI();
