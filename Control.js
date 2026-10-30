let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
let orders = JSON.parse(localStorage.getItem('orders')) || [];
let currentCart = [];
let editingId = null; // Variable para saber si estamos editando una fila

let totalSalesCount = 0;
let totalRevenue = 0;

const inventoryBody = document.getElementById('inventory-body');
const cartModelSelect = document.getElementById('cart-model');
const cartItemsList = document.getElementById('cart-items');
const cartTotalPriceEl = document.getElementById('cart-total-price');
const ordersContainer = document.getElementById('orders-container');

// Elementos del formulario de inventario
const addModelForm = document.getElementById('add-model-form');
const formTitle = document.getElementById('form-title');
const btnSubmitModel = document.getElementById('btn-submit-model');
const btnCancelEdit = document.getElementById('btn-cancel-edit');

const addToCartForm = document.getElementById('add-to-cart-form');
const finalizeOrderForm = document.getElementById('finalize-order-form');

document.getElementById('order-date').valueAsDate = new Date();

function saveData() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    localStorage.setItem('orders', JSON.stringify(orders));
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active-tab'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`tab-${tabName}`).classList.add('active-tab');
    document.getElementById(`btn-tab-${tabName}`).classList.add('active');
}

// ==========================================
// NUEVO: ELIMINAR Y EDITAR FILAS
// ==========================================
function eliminarFila(id) {
    if(confirm("¿Estás seguro de que deseas eliminar este modelo del inventario?")) {
        inventory = inventory.filter(item => item.id !== id);
        saveData();
        updateUI();
    }
}

function editarFila(id) {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    // Pasar datos al formulario
    document.getElementById('new-model').value = item.name;
    document.getElementById('new-size').value = item.size;
    document.getElementById('new-color').value = item.color;
    document.getElementById('new-price').value = item.price;
    document.getElementById('new-stock').value = item.stock;

    // Cambiar apariencia del formulario
    editingId = id;
    formTitle.textContent = "Modificar Modelo";
    btnSubmitModel.textContent = "Guardar Cambios";
    btnCancelEdit.style.display = "block";
}

btnCancelEdit.addEventListener('click', function() {
    editingId = null;
    addModelForm.reset();
    formTitle.textContent = "1. Agregar Nuevo Modelo";
    btnSubmitModel.textContent = "Guardar en Inventario";
    btnCancelEdit.style.display = "none";
});

// ==========================================
// LÓGICA DE INVENTARIO (GUARDAR / ACTUALIZAR)
// ==========================================
addModelForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('new-model').value.trim();
    const size = document.getElementById('new-size').value.trim();
    const color = document.getElementById('new-color').value.trim();
    const price = parseFloat(document.getElementById('new-price').value);
    const stock = parseInt(document.getElementById('new-stock').value);

    if (editingId) {
        // MODO EDICIÓN
        // Revisar si existe OTRO modelo igual (que no sea el que estamos editando)
        const duplicateIndex = inventory.findIndex(item => 
            item.id !== editingId && 
            item.name.toLowerCase() === name.toLowerCase() &&
            item.size === size &&
            item.color.toLowerCase() === color.toLowerCase() &&
            item.price === price
        );

        if (duplicateIndex !== -1) {
            // Si ya existe uno igual, sumamos la cantidad al existente y borramos la fila editada
            inventory[duplicateIndex].stock += stock;
            inventory = inventory.filter(item => item.id !== editingId);
            alert("Los cambios coinciden con un modelo existente. Se han fusionado las cantidades.");
        } else {
            // Si no existe, simplemente actualizamos la fila actual
            const product = inventory.find(item => item.id === editingId);
            product.name = name;
            product.size = size;
            product.color = color;
            product.price = price;
            product.stock = stock;
        }

        // Resetear formulario
        btnCancelEdit.click(); 

    } else {
        // MODO AGREGAR NUEVO
        const existingProduct = inventory.find(item => 
            item.name.toLowerCase() === name.toLowerCase() &&
            item.size === size &&
            item.color.toLowerCase() === color.toLowerCase() &&
            item.price === price
        );

        if (existingProduct) {
            existingProduct.stock += stock;
        } else {
            const newProduct = {
                id: Date.now().toString(),
                name: name,
                size: size,
                color: color,
                price: price,
                stock: stock
            };
            inventory.push(newProduct);
        }
        addModelForm.reset();
    }

    saveData();
    updateUI();
});

// ==========================================
// LÓGICA DEL PEDIDO (CARRITO)
// ==========================================
addToCartForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedId = cartModelSelect.value;
    const quantity = parseInt(document.getElementById('cart-quantity').value);

    if (!selectedId) { alert("Selecciona un modelo."); return; }

    const product = inventory.find(item => item.id === selectedId);
    const existingCartItem = currentCart.find(item => item.id === selectedId);
    const quantityInCart = existingCartItem ? existingCartItem.quantity : 0;

    if (product.stock >= (quantityInCart + quantity)) {
        if (existingCartItem) {
            existingCartItem.quantity += quantity;
        } else {
            currentCart.push({
                id: product.id, name: product.name, size: product.size,
                color: product.color, price: product.price, quantity: quantity
            });
        }
        document.getElementById('cart-quantity').value = ''; 
        renderCart();
    } else {
        alert(`Stock insuficiente. Solo quedan ${product.stock - quantityInCart} pares disponibles.`);
    }
});

function renderCart() {
    cartItemsList.innerHTML = '';
    let cartTotal = 0;

    if (currentCart.length === 0) {
        cartItemsList.innerHTML = '<li class="empty-cart">El pedido está vacío</li>';
        cartTotalPriceEl.textContent = '$0';
        return;
    }

    currentCart.forEach(item => {
        const subtotal = item.price * item.quantity;
        cartTotal += subtotal;
        const li = document.createElement('li');
        li.innerHTML = `<span>${item.quantity}x ${item.name} (${item.color} - ${item.size})</span><span>$${subtotal.toLocaleString()}</span>`;
        cartItemsList.appendChild(li);
    });
    cartTotalPriceEl.textContent = `$${cartTotal.toLocaleString()}`;
}

finalizeOrderForm.addEventListener('submit', function(e) {
    e.preventDefault();

    if (currentCart.length === 0) {
        alert("El pedido está vacío. Agrega sandalias primero."); return;
    }

    const clientName = document.getElementById('order-client').value;
    const orderDate = document.getElementById('order-date').value;
    const orderTotal = currentCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const newOrder = {
        orderId: 'PED-' + Math.floor(Math.random() * 10000),
        client: clientName, date: orderDate,
        items: [...currentCart], total: orderTotal
    };

    currentCart.forEach(cartItem => {
        const inventoryItem = inventory.find(inv => inv.id === cartItem.id);
        if (inventoryItem) inventoryItem.stock -= cartItem.quantity;
    });

    inventory = inventory.filter(item => item.stock > 0);
    orders.push(newOrder);
    saveData();

    currentCart = [];
    finalizeOrderForm.reset();
    document.getElementById('order-date').valueAsDate = new Date(); 
    
    renderCart();
    updateUI();
    alert("¡Pedido registrado con éxito!");
});

// ==========================================
// RENDERIZADO GENERAL (UI)
// ==========================================
function updateUI() {
    inventoryBody.innerHTML = '';
    cartModelSelect.innerHTML = '<option value="">Selecciona un modelo disponible...</option>';
    ordersContainer.innerHTML = '';
    
    let currentTotalStock = 0;
    totalSalesCount = 0;
    totalRevenue = 0;

    orders.forEach(order => {
        totalRevenue += order.total;
        order.items.forEach(item => totalSalesCount += item.quantity);
    });

    inventory.forEach(item => {
        currentTotalStock += item.stock;

        const row = document.createElement('tr');
        const stockClass = item.stock <= 5 ? 'low-stock' : '';
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.color}</td>
            <td>$${item.price.toLocaleString()}</td>
            <td class="${stockClass}">${item.stock}</td>
            <td class="action-btns">
                <button class="btn-sm btn-warning" onclick="editarFila('${item.id}')">Editar</button>
                <button class="btn-sm btn-danger" onclick="eliminarFila('${item.id}')">Eliminar</button>
            </td>
        `;
        inventoryBody.appendChild(row);

        if (item.stock > 0) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.color} - Talla ${item.size}) | Disp: ${item.stock}`;
            cartModelSelect.appendChild(option);
        }
    });

    document.getElementById('total-stock').textContent = currentTotalStock;
    document.getElementById('total-sales').textContent = totalSalesCount;
    document.getElementById('total-revenue').textContent = `$${totalRevenue.toLocaleString()}`;

    if (orders.length === 0) {
        ordersContainer.innerHTML = '<p style="color: #6b7280; font-style: italic;">No hay pedidos registrados aún.</p>';
    } else {
        [...orders].reverse().forEach(order => {
            const card = document.createElement('div');
            card.classList.add('order-card');
            
            let itemsHTML = '';
            order.items.forEach(item => {
                const sub = item.price * item.quantity;
                itemsHTML += `<tr><td>${item.quantity}x ${item.name} (${item.size}, ${item.color})</td><td>$${item.price.toLocaleString()}</td><td>$${sub.toLocaleString()}</td></tr>`;
            });

            card.innerHTML = `
                <div class="order-header">
                    <h3>Cliente: ${order.client} <span style="color:#6b7280; font-size:12px;">(${order.orderId})</span></h3>
                    <div class="order-date">Fecha: ${order.date}</div>
                </div>
                <div class="order-details">
                    <table>
                        <thead><tr><th>Producto</th><th>Precio Und.</th><th>Subtotal</th></tr></thead>
                        <tbody>${itemsHTML}</tbody>
                    </table>
                </div>
                <div class="order-total">Total del Pedido: $${order.total.toLocaleString()}</div>
            `;
            ordersContainer.appendChild(card);
        });
    }
}

updateUI();
renderCart();