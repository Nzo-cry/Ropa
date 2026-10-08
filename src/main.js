// URL de la API desplegada en Render
const API_BASE_URL = 'https://apiropa-1.onrender.com/api';

// Mapeo de imágenes en alta resolución para que no fallen
const IMAGENES_ROPA = {
  1: 'https://images.pexels.com/photos/1656684/pexels-photo-1656684.jpeg?auto=compress&cs=tinysrgb&w=800', // Polo Oversize
  2: 'https://images.pexels.com/photos/1598507/pexels-photo-1598507.jpeg?auto=compress&cs=tinysrgb&w=800', // Jean Slim
  3: 'https://images.pexels.com/photos/16170/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800',          // Casaca Impermeable
  4: 'https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800'  // Polera Hoodie
};

// Estado global
let productos = [];
let categorias = [];
let marcas = [];
let promociones = [];
let carrito = [];

// Elementos del DOM
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('error-message');
const emptyMessage = document.getElementById('empty-message');
const productsGrid = document.getElementById('products-grid');
const searchInput = document.getElementById('search-input');
const filterCategory = document.getElementById('filter-category');

document.addEventListener('DOMContentLoaded', () => {
  cargarEmpresa();
  cargarProductos();
  cargarCategorias();
  cargarMarcas();
  cargarPromociones();
  configurarFiltros();
});

// 1. Cargar Información de la Empresa
async function cargarEmpresa() {
  try {
    const res = await fetch(API_BASE_URL + '/empresa');
    if (!res.ok) throw new Error();
    const data = await res.json();

    const nombre = data.Nombre || data.nombre;
    const descripcion = data.Descripcion || data.descripcion;
    const ubicacion = data.Ubicacion || data.ubicacion;
    const horario = data.HorarioAtencion || data.horarioAtencion;
    const telefono = data.Telefono || data.telefono;

    document.getElementById('brand-name').innerHTML = '<i class="bi bi-bag-heart-fill text-danger me-2 fs-4"></i><span>' + nombre + '</span>';
    document.getElementById('empresa-titulo').innerText = nombre;
    document.getElementById('empresa-desc').innerText = descripcion;
    document.getElementById('empresa-ubicacion').innerText = ubicacion;
    document.getElementById('empresa-horario').innerText = horario;
    document.getElementById('empresa-telefono').innerText = telefono;
  } catch (e) {
    console.error('Error al cargar datos de empresa', e);
  }
}

// 2. Cargar Catálogo Principal
async function cargarProductos() {
  mostrarLoader(true);
  try {
    const res = await fetch(API_BASE_URL + '/ropa');
    if (!res.ok) throw new Error();
    const data = await res.json();

    productos = data.map(function(item) {
      const id = item.ID || item.id;
      return {
        id: id,
        nombre: item.Nombre || item.nombre,
        categoria: item.Categoria || item.categoria,
        marca: item.Marca || item.marca,
        talla: item.Talla || item.talla,
        precio: Number(item.Precio || item.precio || 0),
        stock: item.Stock || item.stock,
        descuento: Number(item.Descuento || item.descuento || 0),
        imagen: IMAGENES_ROPA[id] || item.Imagen || item.imagen,
        codigo: item.Codigo || item.codigo,
        genero: item.Genero || item.genero,
        color: item.Color || item.color,
        material: item.Material || item.material,
        descripcion: item.Descripcion || item.descripcion
      };
    });

    mostrarLoader(false);
    renderProductos(productos);
  } catch (e) {
    console.error(e);
    mostrarLoader(false);
    errorMessage.classList.remove('d-none');
  }
}

// 3. Cargar Categorías
async function cargarCategorias() {
  try {
    const res = await fetch(API_BASE_URL + '/categorias');
    if (!res.ok) throw new Error();
    const data = await res.json();

    categorias = data.map(function(c) {
      return {
        nombre: c.Nombre || c.nombre,
        descripcion: c.Descripcion || c.descripcion
      };
    });

    const catList = document.getElementById('categories-list');
    catList.innerHTML = '';
    filterCategory.innerHTML = '<option value="">Todas las categorías</option>';

    categorias.forEach(function(cat) {
      const opt = document.createElement('option');
      opt.value = cat.nombre;
      opt.textContent = cat.nombre;
      filterCategory.appendChild(opt);

      const li = document.createElement('li');
      li.className = 'list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center';
      li.innerHTML = '<div><strong class="text-dark">' + cat.nombre + '</strong><p class="text-muted small m-0">' + cat.descripcion + '</p></div>';
      catList.appendChild(li);
    });
  } catch (e) {
    console.error('Error al cargar categorías', e);
  }
}

// 4. Cargar Marcas
async function cargarMarcas() {
  try {
    const res = await fetch(API_BASE_URL + '/marcas');
    if (!res.ok) throw new Error();
    const data = await res.json();

    marcas = data.map(function(m) {
      return {
        nombre: m.Nombre || m.nombre,
        paisOrigen: m.PaisOrigen || m.paisOrigen
      };
    });

    const brandList = document.getElementById('brands-list');
    brandList.innerHTML = '';

    marcas.forEach(function(m) {
      const li = document.createElement('li');
      li.className = 'list-group-item border-0 px-0 py-2 d-flex justify-content-between align-items-center';
      li.innerHTML = '<span class="fw-bold text-dark">' + m.nombre + '</span><span class="badge bg-light text-dark border px-3 py-2 rounded-pill">' + m.paisOrigen + '</span>';
      brandList.appendChild(li);
    });
  } catch (e) {
    console.error('Error al cargar marcas', e);
  }
}

// 5. Cargar Promociones
async function cargarPromociones() {
  try {
    const res = await fetch(API_BASE_URL + '/promociones');
    if (!res.ok) throw new Error();
    const data = await res.json();

    promociones = data.map(function(p) {
      return {
        titulo: p.Titulo || p.titulo,
        descripcion: p.Descripcion || p.descripcion,
        codigoDescuento: p.CodigoDescuento || p.codigoDescuento
      };
    });

    const promoGrid = document.getElementById('promotions-grid');
    promoGrid.innerHTML = '';

    promociones.forEach(function(p) {
      const col = document.createElement('div');
      col.className = 'col';
      col.innerHTML = 
        '<div class="card border-0 shadow-sm rounded-4 p-4 bg-dark text-white h-100">' +
          '<div class="d-flex justify-content-between align-items-center mb-2">' +
            '<h5 class="fw-bold text-danger m-0"><i class="bi bi-gift-fill me-2"></i>' + p.titulo + '</h5>' +
            '<span class="badge bg-danger px-3 py-2 rounded-pill">PROMO</span>' +
          '</div>' +
          '<p class="text-light opacity-75 mb-3">' + p.descripcion + '</p>' +
          '<div>' +
            '<small class="text-muted d-block mb-1">Código de Descuento:</small>' +
            '<span class="badge bg-white text-dark fs-6 font-monospace px-3 py-2">' + p.codigoDescuento + '</span>' +
          '</div>' +
        '</div>';
      promoGrid.appendChild(col);
    });
  } catch (e) {
    console.error('Error al cargar promociones', e);
  }
}

// Renderizado de Tarjetas de Producto
function renderProductos(items) {
  productsGrid.innerHTML = '';

  if (items.length === 0) {
    emptyMessage.classList.remove('d-none');
    return;
  }
  emptyMessage.classList.add('d-none');

  items.forEach(function(prod) {
    const descuentoNum = Number(prod.descuento) || 0;
    const precioNum = Number(prod.precio) || 0;
    
    const precioFinal = descuentoNum > 0 
      ? (precioNum * (1 - descuentoNum / 100)).toFixed(2)
      : precioNum.toFixed(2);

    const badgeDescuentoHTML = descuentoNum > 0 
      ? '<span class="badge badge-discount">-' + descuentoNum + '%</span>' 
      : '';

    const precioTachadoHTML = descuentoNum > 0 
      ? '<span class="text-muted text-decoration-line-through small">S/ ' + precioNum.toFixed(2) + '</span>' 
      : '';

    const col = document.createElement('div');
    col.className = 'col';
    
    col.innerHTML = 
      '<div class="card card-product shadow-sm">' +
        '<div class="img-container">' +
          '<img src="' + prod.imagen + '" class="img-product" alt="' + prod.nombre + '" loading="lazy">' +
          badgeDescuentoHTML +
          '<span class="badge badge-category">' + prod.categoria + '</span>' +
        '</div>' +
        '<div class="card-body p-4 d-flex flex-column">' +
          '<small class="text-uppercase text-muted fw-bold mb-1">' + prod.marca + '</small>' +
          '<h5 class="fw-bold text-dark mb-2">' + prod.nombre + '</h5>' +
          '<p class="text-muted small flex-grow-1 mb-3">' + prod.descripcion + '</p>' +
          
          '<div class="d-flex align-items-baseline gap-2 mb-3">' +
            '<span class="fs-4 fw-extrabold text-danger">S/ ' + precioFinal + '</span>' +
            precioTachadoHTML +
          '</div>' +

          '<div class="d-grid gap-2">' +
            '<button class="btn btn-outline-dark btn-sm rounded-pill fw-semibold btn-detalle" data-id="' + prod.id + '">' +
              '<i class="bi bi-eye me-1"></i> Detalle' +
            '</button>' +
            '<button class="btn btn-accent btn-sm rounded-pill btn-agregar" data-id="' + prod.id + '">' +
              '<i class="bi bi-cart-plus me-1"></i> Agregar' +
            '</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    productsGrid.appendChild(col);
  });

  document.querySelectorAll('.btn-detalle').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      abrirDetalle(e.target.closest('button').dataset.id);
    });
  });

  document.querySelectorAll('.btn-agregar').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      agregarCarrito(e.target.closest('button').dataset.id);
    });
  });
}

// Filtros y Búsqueda
function configurarFiltros() {
  searchInput.addEventListener('input', filtrar);
  filterCategory.addEventListener('change', filtrar);
}

function filtrar() {
  const txt = searchInput.value.toLowerCase().trim();
  const cat = filterCategory.value;

  const res = productos.filter(function(p) {
    const matchTxt = p.nombre.toLowerCase().includes(txt) || p.marca.toLowerCase().includes(txt);
    const matchCat = cat === '' || p.categoria === cat;
    return matchTxt && matchCat;
  });

  renderProductos(res);
}

// Modal de Detalle de Producto
function abrirDetalle(id) {
  const prod = productos.find(function(p) { return p.id == id; });
  if (!prod) return;

  const descuentoNum = Number(prod.descuento) || 0;
  const precioNum = Number(prod.precio) || 0;

  const precioFinal = descuentoNum > 0 
    ? (precioNum * (1 - descuentoNum / 100)).toFixed(2)
    : precioNum.toFixed(2);

  const precioTachadoHTML = descuentoNum > 0 
    ? '<span class="text-muted text-decoration-line-through ms-2">S/ ' + precioNum.toFixed(2) + '</span>' 
    : '';

  const modalBody = document.getElementById('modal-product-body');
  modalBody.innerHTML = 
    '<div class="row g-4 align-items-center">' +
      '<div class="col-md-6">' +
        '<img src="' + prod.imagen + '" class="img-fluid rounded-4 shadow-sm w-100" style="height: 380px; object-fit: cover;" alt="' + prod.nombre + '">' +
      '</div>' +
      '<div class="col-md-6">' +
        '<span class="badge bg-dark rounded-pill px-3 py-2 mb-2">' + prod.categoria + '</span> ' +
        '<span class="badge bg-secondary rounded-pill px-3 py-2 mb-2">' + prod.marca + '</span>' +
        '<h3 class="fw-bold text-dark">' + prod.nombre + '</h3>' +
        '<p class="text-muted mb-3">' + prod.descripcion + '</p>' +
        
        '<div class="bg-light p-3 rounded-3 mb-3">' +
          '<div class="row text-center g-2">' +
            '<div class="col-6"><small class="text-muted d-block">Talla</small><strong>' + prod.talla + '</strong></div>' +
            '<div class="col-6"><small class="text-muted d-block">Color</small><strong>' + prod.color + '</strong></div>' +
            '<div class="col-6 mt-2"><small class="text-muted d-block">Material</small><strong>' + prod.material + '</strong></div>' +
            '<div class="col-6 mt-2"><small class="text-muted d-block">Stock</small><strong>' + prod.stock + ' un.</strong></div>' +
          '</div>' +
        '</div>' +

        '<div class="d-flex align-items-baseline gap-2 mb-4">' +
          '<span class="fs-2 fw-bold text-danger">S/ ' + precioFinal + '</span>' +
          precioTachadoHTML +
        '</div>' +

        '<button class="btn btn-accent w-100 rounded-pill py-2" onclick="window.agregarDirecto(' + prod.id + ')">' +
          '<i class="bi bi-cart-plus me-1"></i> Agregar al Carrito' +
        '</button>' +
      '</div>' +
    '</div>';

  const modal = new bootstrap.Modal(document.getElementById('productModal'));
  modal.show();
}

// Carrito de compras
function agregarCarrito(id) {
  const prod = productos.find(function(p) { return p.id == id; });
  if (!prod) return;

  const item = carrito.find(function(i) { return i.id == id; });
  const descuentoNum = Number(prod.descuento) || 0;
  const precioNum = Number(prod.precio) || 0;
  const precioFinalCalculado = descuentoNum > 0 ? (precioNum * (1 - descuentoNum / 100)) : precioNum;

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({
      id: prod.id,
      nombre: prod.nombre,
      precioFinal: precioFinalCalculado,
      cantidad: 1
    });
  }

  actualizarCarrito();
}

window.agregarDirecto = function(id) {
  agregarCarrito(id);
  const modalEl = document.getElementById('productModal');
  const modal = bootstrap.Modal.getInstance(modalEl);
  if (modal) modal.hide();
};

function actualizarCarrito() {
  const count = document.getElementById('cart-count');
  const items = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  const totalCount = carrito.reduce(function(acc, i) { return acc + i.cantidad; }, 0);
  count.innerText = totalCount;

  items.innerHTML = '';
  let totalSum = 0;

  if (carrito.length === 0) {
    items.innerHTML = '<li class="list-group-item border-0 text-center text-muted py-4">Tu carrito está vacío</li>';
  } else {
    carrito.forEach(function(i) {
      const subtotal = i.precioFinal * i.cantidad;
      totalSum += subtotal;

      const li = document.createElement('li');
      li.className = 'list-group-item border-0 px-0 py-3 d-flex justify-content-between align-items-center border-bottom';
      li.innerHTML = 
        '<div>' +
          '<h6 class="mb-0 fw-bold text-dark">' + i.nombre + '</h6>' +
          '<small class="text-muted">S/ ' + i.precioFinal.toFixed(2) + ' x ' + i.cantidad + '</small>' +
        '</div>' +
        '<span class="fw-bold text-dark">S/ ' + subtotal.toFixed(2) + '</span>';
      items.appendChild(li);
    });
  }

  totalEl.innerText = 'S/ ' + totalSum.toFixed(2);
}

function mostrarLoader(estado) {
  if (estado) {
    loader.classList.remove('d-none');
    errorMessage.classList.add('d-none');
    emptyMessage.classList.add('d-none');
  } else {
    loader.classList.add('d-none');
  }
}