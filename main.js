const GRID = document.getElementById('product-grid');
const MODAL = document.getElementById('product-modal');
const FORM = document.getElementById('product-form');
const ADD_BTN = document.getElementById('add-product-btn');
const CANCEL_BTN = document.getElementById('cancel-btn');
const CLOSE_BTN = document.querySelector('.close-btn');
const UPLOAD_BTN = document.getElementById('upload-btn');
const PREVIEW = document.getElementById('image-preview');

let products = [];
let currentCloudinaryUrl = '';

// --- INITIALIZATION ---
async function init() {
    await fetchProducts();
    setupEventListeners();
}

// --- API CALLS ---
async function fetchProducts() {
    try {
        const res = await fetch('/api/products');
        products = await res.json();
        renderProducts();
    } catch (err) {
        console.error('Failed to fetch products:', err);
        GRID.innerHTML = '<div class="error">Failed to load catalog. Please try again later.</div>';
    }
}

async function saveProduct(product) {
    const method = product.id ? 'PUT' : 'POST';
    try {
        const res = await fetch('/api/products', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(product)
        });
        if (res.ok) {
            await fetchProducts();
            closeModal();
        }
    } catch (err) {
        console.error('Failed to save product:', err);
        alert('Failed to save product. Please check your connection.');
    }
}

async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) await fetchProducts();
    } catch (err) {
        console.error('Failed to delete product:', err);
    }
}

// --- RENDERING ---
function renderProducts() {
    if (products.length === 0) {
        GRID.innerHTML = '<div class="empty-state">No products found. Add your first item!</div>';
        return;
    }

    GRID.innerHTML = products.map(p => `
        <div class="product-card" data-id="${p.id}">
            <img src="${p.image_link}" alt="${p.title}" class="card-image">
            <div class="card-content">
                <span class="card-badge ${p.availability === 'in stock' ? 'badge-in-stock' : 'badge-out-of-stock'}">
                    ${p.availability}
                </span>
                <h3 class="card-title">${p.title}</h3>
                <p class="card-price">${p.price} ILS</p>
                <div class="card-actions">
                    <button class="btn-secondary edit-btn" onclick="openEditModal('${p.id}')">Edit</button>
                    <button class="btn-text delete-btn" onclick="deleteProduct('${p.id}')">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

// --- MODAL & FORM LOGIC ---
window.openEditModal = (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;

    document.getElementById('modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = product.id;
    document.getElementById('title').value = product.title;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('availability').value = product.availability;
    document.getElementById('image_link').value = product.image_link;
    
    currentCloudinaryUrl = product.image_link;
    PREVIEW.innerHTML = `<img src="${product.image_link}" alt="Preview">`;
    
    MODAL.classList.remove('hidden');
};

function openAddModal() {
    document.getElementById('modal-title').textContent = 'Add New Product';
    FORM.reset();
    document.getElementById('product-id').value = '';
    PREVIEW.innerHTML = '<span>No image selected</span>';
    currentCloudinaryUrl = '';
    MODAL.classList.remove('hidden');
}

function closeModal() {
    MODAL.classList.add('hidden');
}

// --- CLOUDINARY WIDGET ---
const widget = cloudinary.createUploadWidget({
    cloudName: 'demo', // USER MUST UPDATE THIS
    uploadPreset: 'ml_default' // USER MUST UPDATE THIS
}, (error, result) => {
    if (!error && result && result.event === "success") {
        currentCloudinaryUrl = result.info.secure_url;
        document.getElementById('image_link').value = currentCloudinaryUrl;
        PREVIEW.innerHTML = `<img src="${currentCloudinaryUrl}" alt="Preview">`;
    }
});

// --- EVENT LISTENERS ---
function setupEventListeners() {
    ADD_BTN.addEventListener('click', openAddModal);
    CANCEL_BTN.addEventListener('click', closeModal);
    CLOSE_BTN.addEventListener('click', closeModal);
    UPLOAD_BTN.addEventListener('click', () => widget.open());

    // Add Feed Download Link in Header
    const feedLink = document.createElement('a');
    feedLink.href = '/api/feed';
    feedLink.className = 'btn-text';
    feedLink.style.marginRight = '1rem';
    feedLink.textContent = 'Download Catalog CSV';
    document.querySelector('.header-content').insertBefore(feedLink, ADD_BTN);

    FORM.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = document.getElementById('save-btn');
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        const formData = new FormData(FORM);
        const product = {
            id: formData.get('id') || Date.now().toString(),
            title: formData.get('title'),
            description: formData.get('description'),
            price: formData.get('price'),
            availability: formData.get('availability'),
            image_link: formData.get('image_link'),
            condition: 'new', // Auto-populated
            brand: 'My Shop', // Auto-populated
            link: window.location.origin + '?id=' + (formData.get('id') || Date.now().toString()) // Auto-populated
        };
        
        await saveProduct(product);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Product';
    });

    window.onclick = (e) => {
        if (e.target === MODAL) closeModal();
    };
}

init();
