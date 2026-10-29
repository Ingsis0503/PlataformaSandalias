// Memoria de la aplicación
let inventory = [];
let totalSalesCount = 0;
let totalRevenue = 0;

// Referencias a los elementos de HTML
const inventoryBody = document.getElementById('inventory-body');
const saleModelSelect = document.getElementById('sale-model');
const totalStockEl = document.getElementById('total-stock');
const totalSalesEl = document.getElementById('total-sales');
const totalRevenueEl = document.getElementById('total-revenue');

const addModelForm = document.getElementById('add-model-form');
const saleForm = document.getElementById('sale-form');

// 1. Lógica para agregar un nuevo modelo al inventario
addModelForm.addEventListener('submit', function(e) {
    e.preventDefault(); // Evita que la página se recargue
    
    // Capturar datos del formulario
    const name = document.getElementById('new-model').value;
    const size = document.getElementById('new-size').value;
    const color = document.getElementById('new-color').value;
    const price = parseFloat(document.getElementById('new-price').value);
    const stock = parseInt(document.getElementById('new-stock').value);

    // Crear un ID único para el modelo
    const id = Date.now().toString();

    // Guardar en el arreglo (Base de datos temporal)
    inventory.push({ id, name, size, color, price, stock });

    // Limpiar el formulario y actualizar la pantalla
    addModelForm.reset();
    updateUI();
});

// 2. Lógica para registrar una venta
saleForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const selectedId = saleModelSelect.value;
    const quantity = parseInt(document.getElementById('sale-quantity').value);

    if (!selectedId) {
        alert("Por favor, selecciona un modelo del inventario.");
        return;
    }

    // Buscar el producto exacto en el arreglo
    const product = inventory.find(item => item.id === selectedId);

    // Validar que haya suficiente inventario
    if (product.stock >= quantity) {
        // Restar inventario y sumar dinero/ventas
        product.stock -= quantity;
        totalSalesCount += quantity;
        totalRevenue += (product.price * quantity);
        
        saleForm.reset();
        updateUI();
    } else {
        alert("Error: No tienes suficientes sandalias de este modelo para completar la venta.");
    }
});

// 3. Función principal para dibujar la interfaz
function updateUI() {
    // Vaciar la tabla y la lista desplegable antes de redibujar
    inventoryBody.innerHTML = '';
    saleModelSelect.innerHTML = '<option value="">Selecciona un modelo disponible...</option>';

    let currentTotalStock = 0;

    // Recorrer cada elemento del inventario
    inventory.forEach(item => {
        currentTotalStock += item.stock;

        // Crear una fila para la tabla
        const row = document.createElement('tr');
        // Si el stock es 5 o menos, aplicamos un color rojo de advertencia
        const stockClass = item.stock <= 5 ? 'low-stock' : '';
        
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.size}</td>
            <td>${item.color}</td>
            <td>$${item.price.toLocaleString()}</td>
            <td class="${stockClass}">${item.stock}</td>
        `;
        inventoryBody.appendChild(row);

        // Si hay stock, agregar el modelo a la lista desplegable de ventas
        if (item.stock > 0) {
            const option = document.createElement('option');
            option.value = item.id;
            option.textContent = `${item.name} (${item.color} - Talla ${item.size}) | Quedan: ${item.stock}`;
            saleModelSelect.appendChild(option);
        }
    });

    // Actualizar los números grandes de arriba
    totalStockEl.textContent = currentTotalStock;
    totalSalesEl.textContent = totalSalesCount;
    totalRevenueEl.textContent = `$${totalRevenue.toLocaleString()}`;
}

// Iniciar la interfaz limpia al abrir el archivo
updateUI();