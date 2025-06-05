// Configuración base de la API
const API_BASE_URL = 'http://localhost/ProyectoFinDeGrado/APIbiblioteca/public/api';

// Obtener datos de autenticación del localStorage
const token = localStorage.getItem('token');
const idUsuario = localStorage.getItem("id_usuario");
const idSocio = localStorage.getItem("id_socio");
const usuarioRol = localStorage.getItem('rol');

// Verificar autenticación
if (!token) {
  console.error('No se encontró el token de autenticación. Redirigiendo a login...');
  window.location.href = 'login.html';
}

// Constantes de paginación
const LIBROS_POR_PAGINA = 8;
const PRESTAMOS_POR_PAGINA = 8;

/* ----------  MÓDULO DE CATÁLOGO  ---------- */
const Catalogo = {
  loader: null,
  container: null,
  libros: [],
  librosFiltrados: [],
  paginaActual: 1,

  init: function() {
    this.loader = document.getElementById("loader");
    this.container = document.getElementById("libros-container");

    if (!this.loader || !this.container) {
      console.warn("Loader o container no encontrados");
      return;
    }

    this.fetch();
    this.initBuscador();
  },

  // Cargar catálogo desde API
  fetch: function() {
    console.log("Cargando catálogo...");
    this.loader.classList.remove("d-none"); // Mostrar loader
  // Mostrar contenedor
     // Limpiar contenido anterior
    axios.get(`${API_BASE_URL}/libros`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      this.loader.classList.add("d-none");
        this.container.classList.remove("d-none"); 
      this.libros = res.data;
      this.librosFiltrados = [...this.libros];
      this.paginaActual = 1;
      this.mostrarPagina(this.paginaActual);
      this.generarPaginacion();
    })
    .catch(err => {
      console.error('Error al obtener los libros:', err);
      this.loader.classList.add("d-none"); // Ocultar loader en caso de error
    });
  },

  // Mostrar página específica
  mostrarPagina: function(pagina) {
    const inicio = (pagina - 1) * LIBROS_POR_PAGINA;
    const fin = inicio + LIBROS_POR_PAGINA;
    const librosPagina = this.librosFiltrados.slice(inicio, fin);

    const catalogo = document.getElementById('catalogo');
    if (!catalogo) {
      console.warn("No se encontró el elemento con id 'catalogo'");
      return;
    }

    catalogo.innerHTML = '';

    if (librosPagina.length === 0) {
      catalogo.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">No se encontraron libros</div>
        </div>`;
      return;
    }

    const row = document.createElement('div');
    row.className = 'row g-4 justify-content-center';

    librosPagina.forEach(libro => {
      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 d-flex';

      let botones = '';

      if (usuarioRol === 'S') {
        botones += `
          <button class="btn btn-outline-success btn-sm w-100 mb-2 mt-auto"
                  onclick="verResenas(${libro.id})">
            <i class="bi bi-chat-left-text"></i> Ver reseñas
          </button>
          <button class="btn btn-primary btn-sm w-100"
                  onclick="reservarLibro(${libro.id})">
            <i class="bi bi-calendar-check"></i> Reservar
          </button>`;
      } else if (usuarioRol === 'A') {
        const botonAgregar = document.getElementById('botonAgregar');
        if (botonAgregar) {
          botonAgregar.classList.remove('d-none');
        }
        botones += `
          <button class="btn btn-outline-danger btn-sm w-100 mt-auto"
                  onclick="Catalogo.borrarLibro(${libro.id})">
            <i class="bi bi-trash"></i> Borrar libro
          </button>
          <button class="btn btn-outline-primary btn-sm w-100 mt-2"
                  onclick="Catalogo.actualizarEjemplares(${libro.id})">
            <i class="bi bi-pencil"></i> Actualizar ejemplares
          </button>
          `;
      }

      col.innerHTML = `
        <div class="card h-100 d-flex flex-column shadow-sm w-100">
          <div class="ratio ratio-4x3">
            <img src="${libro.img || 'https://via.placeholder.com/300x450?text=Sin+imagen'}"
                 class="card-img-top object-fit-cover w-100 h-100"
                 alt="Portada de ${libro.titulo}">
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${libro.titulo}</h5>
            <p class="card-text mb-1"><strong>Autor:</strong> ${libro.autor}</p>
            <p class="card-text mb-3 flex-grow-1"><strong>Ejemplares:</strong> ${libro.ejemplares}</p>
            ${botones}
          </div>
        </div>`;

      row.appendChild(col);
    });

    catalogo.appendChild(row);
  },

  // Borrar un libro
  borrarLibro: function(idLibro) {
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No hay token válido' });
      return;
    }

    Swal.fire({
      title: '¿Estás seguro de que quieres borrar este libro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, borrar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`${API_BASE_URL}/libros/${idLibro}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(response => {
            Swal.fire('Libro borrado', 'El libro ha sido borrado correctamente.', 'success');
            Catalogo.fetch(); // Recargar catálogo
          })
          .catch(error => {
            console.error("Error al borrar el libro:", error);
            Swal.fire('Error', error.response?.data?.error || 'Error al borrar el libro', 'error');
          });
      }
    });
  },
  actualizarEjemplares: function(idLibro) {
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No hay token válido' });
      return;
    } 
    Swal.fire({
      title: 'Actualizar ejemplares',
      html: `
       <div class="text-start">
  <div class="mb-3">
    <label for="ejemplares" class="form-label fw-bold">
      <i class="bi bi-collection me-2 text-primary"></i>Ejemplares
    </label>
    <div class="input-group shadow-sm rounded">
      <span class="input-group-text bg-primary text-white">
        <i class="bi bi-hash"></i>
      </span>
      <input
        type="number"
        id="ejemplares"
        class="form-control"
        placeholder="Número de ejemplares"
        min="1"
      />
    </div>
  </div>
</div>

      `,
      customClass: {
        popup: 'rounded shadow-lg',
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-outline-secondary me-2'
      },
      showCancelButton: true,
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.put(`${API_BASE_URL}/libros/${idLibro}`, {
          ejemplares: document.getElementById("ejemplares").value
        }, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(response => {
          Swal.fire('Libro actualizado', 'El libro ha sido actualizado correctamente.', 'success');
          Catalogo.fetch(); // Recargar catálogo
        })
        .catch(error => {
          console.error("Error al actualizar el libro:", error);
          Swal.fire('Error', error.response?.data?.error || 'Error al actualizar el libro', 'error');
        });
      }
    });
  },

  // Generar controles de paginación
  generarPaginacion: function() {
    const totalPaginas = Math.ceil(this.librosFiltrados.length / LIBROS_POR_PAGINA);
    const paginacion = document.getElementById('paginacion');
    if (!paginacion) {
      console.warn("No se encontró el elemento con id 'paginacion'");
      return;
    }
    paginacion.innerHTML = '';

    const crearBtn = (label, disabled, onClick) => {
      const li = document.createElement('li');
      li.className = `page-item ${disabled ? 'disabled' : ''}`;
      li.innerHTML = `<button class="page-link">${label}</button>`;
      li.querySelector('button').addEventListener('click', onClick);
      return li;
    };

    paginacion.appendChild(crearBtn('«', this.paginaActual === 1, () => {
      if (this.paginaActual > 1) {
        this.paginaActual--;
        this.mostrarPagina(this.paginaActual);
        this.generarPaginacion();
      }
    }));

    for (let i = 1; i <= totalPaginas; i++) {
      const li = crearBtn(i, false, () => {
        this.paginaActual = i;
        this.mostrarPagina(i);
        this.generarPaginacion();
      });
      if (i === this.paginaActual) li.classList.add('active');
      paginacion.appendChild(li);
    }

    paginacion.appendChild(crearBtn('»', this.paginaActual === totalPaginas, () => {
      if (this.paginaActual < totalPaginas) {
        this.paginaActual++;
        this.mostrarPagina(this.paginaActual);
        this.generarPaginacion();
      }
    }));
  },

  // Inicializar buscador
  initBuscador: function() {
    const input = document.getElementById('buscarLibro');
    if (!input) {
      console.warn("Input de búsqueda no encontrado.");
      return;
    }

    input.addEventListener('input', e => {
      const filtro = e.target.value.toLowerCase();
      this.librosFiltrados = this.libros.filter(l =>
        l.titulo.toLowerCase().includes(filtro) ||
        l.autor.toLowerCase().includes(filtro)
      );
      this.paginaActual = 1;
      this.mostrarPagina(this.paginaActual);
      this.generarPaginacion();
    });
  }
};


/* ----------  MÓDULO DE PRÉSTAMOS  ---------- */
 
/* ====== Objeto UI de préstamos ====== */
const PrestamosUI = {
  prestamos: [],
  prestamosFiltrados: [],
  paginaActual: 1,

  cargarPrestamosSocio() {
    if (!idSocio || !token) return console.error('Faltan datos para cargar los préstamos');
    
    const loader = document.getElementById('loaderPrestamos');
    const contenedor = document.getElementById('contenedor-prestamos');
    if (loader) loader.classList.remove('d-none');
    if (contenedor) contenedor.classList.add('d-none');

    if (document.getElementById("alertaAdmin")) {
      document.getElementById("alertaAdmin").classList.add("d-none");
    }
    if (document.getElementById("alertaSocio")) {
      document.getElementById("alertaSocio").classList.remove("d-none");
    }

    axios.get(`${API_BASE_URL}/prestamos/${idSocio}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const prestamos = Array.isArray(res.data.data) ? res.data.data : [];
      this.prestamos = prestamos;
      this.prestamosFiltrados = [...prestamos];
      this.paginaActual = 1;
      this.renderPagina(this.paginaActual);
      this.renderPaginacion();

      const badgePrestamos = document.getElementById("badge-prestamos");
      if (badgePrestamos) {
        const pendientes = this.prestamosFiltrados.filter(p => p.estado === 'pendiente').length;
        badgePrestamos.textContent = pendientes;
        if (pendientes === 0) {
          badgePrestamos.classList.add("d-none");
        } else {
          badgePrestamos.classList.remove("d-none");
        }
      }
    })
    .catch(err => console.error('Error al cargar préstamos:', err))
    .finally(() => {
      if (loader) loader.classList.add('d-none');
      if (contenedor) contenedor.classList.remove('d-none');
    });
  },

  cargarPrestamos() {
    if (!token) return console.error('Faltan datos para cargar los préstamos');

    const loader = document.getElementById('loaderPrestamos');
    const contenedor = document.getElementById('contenedor-prestamos');
    if (loader) loader.classList.remove('d-none');
    if (contenedor) contenedor.classList.add('d-none');

    if (document.getElementById("alertaSocio")) {
      document.getElementById("alertaSocio").classList.add("d-none");
    }
    if (document.getElementById("alertaAdmin")) {
      document.getElementById("alertaAdmin").classList.remove("d-none");
    }

    axios.get(`${API_BASE_URL}/prestamos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      const prestamos = Array.isArray(res.data.data) ? res.data.data : [];
      this.prestamos = prestamos;
      this.prestamosFiltrados = [...prestamos];
      this.paginaActual = 1;
      this.renderPagina(this.paginaActual);
      this.renderPaginacion();

      const badgePrestamos = document.getElementById("badge-prestamos");
      if (badgePrestamos) {
        badgePrestamos.classList.add("d-none");
      }
    })
    .catch(err => console.error('Error al cargar préstamos:', err))
    .finally(() => {
      if (loader) loader.classList.add('d-none');
      if (contenedor) contenedor.classList.remove('d-none');
    });
  },

  renderPagina(pagina) {
    const inicio = (pagina - 1) * PRESTAMOS_POR_PAGINA;
    const fin = inicio + PRESTAMOS_POR_PAGINA;
    const listado = Array.isArray(this.prestamosFiltrados)
      ? this.prestamosFiltrados.slice(inicio, fin)
      : [];

    const contenedor = document.getElementById('listado-prestamos');
    if (!contenedor) return console.error('No existe #listado-prestamos');
    contenedor.innerHTML = '';

    if (listado.length === 0) {
      contenedor.innerHTML = `
        <div class="col-12">
          <div class="alert alert-info text-center">No se encontraron resultados</div>
        </div>`;
      return;
    }

    const row = document.createElement('div');
    row.className = 'row g-4 justify-content-center';

    listado.forEach(prestamo => {
      const estadoBadge = this.obtenerBadge(prestamo.estado);

      const devolverBtn = prestamo.estado === 'pendiente' && usuarioRol !== 'A'
        ? `<button class="btn btn-outline-success btn-sm w-100" onclick="devolverLibro(${prestamo.id})">
             <i class="bi bi-box-arrow-left"></i> Devolver
           </button>`
        : '';

      const resenaBtn = prestamo.estado === 'confirmado' && usuarioRol !== 'A'
        ? `<button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="aniadirResena(${prestamo.id_libro})">
             <i class="bi bi-star-fill"></i> Añadir reseña
           </button>`
        : '';

      const nombreSocioHTML = usuarioRol === 'A'
        ? `<p class="card-text mb-1"><strong>Nombre del socio:</strong> ${prestamo.nombre_socio}</p>`
        : '';

      const col = document.createElement('div');
      col.className = 'col-12 col-sm-6 col-md-4 col-lg-3 d-flex';

      col.innerHTML = `
        <div class="card h-100 d-flex flex-column shadow-sm w-100">
          <div class="ratio ratio-4x3">
            <img src="${prestamo.img || 'https://via.placeholder.com/300x450?text=Sin+imagen'}"
                 class="card-img-top object-fit-cover w-100 h-100"
                 alt="Portada de ${prestamo.libro}">
          </div>
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${prestamo.libro}</h5>
            <p class="card-text mb-1"><strong>Préstamo:</strong> ${prestamo.fecha_prestamo}</p>
            <p class="card-text mb-1"><strong>Devolución:</strong> ${prestamo.fecha_devolucion}</p>
            ${nombreSocioHTML}
            <p class="card-text">${estadoBadge}</p>
            <button class="btn btn-outline-info btn-sm w-100 mb-2 mt-auto"
                    onclick='mostrarDetalles(${JSON.stringify(prestamo)})'>
              <i class="bi bi-info-circle"></i> Detalles
            </button>
            ${devolverBtn}
            ${resenaBtn}
          </div>
        </div>
      `;

      row.appendChild(col);
    });

    contenedor.appendChild(row);
  },

  renderPaginacion() {
    const total = Math.ceil(this.prestamosFiltrados.length / PRESTAMOS_POR_PAGINA);
    const pag = document.getElementById('paginacionPrestamos');
    if (!pag) return;
    pag.innerHTML = '';

    const crea = (lbl, disabled, cb) => {
      const li = document.createElement('li');
      li.className = `page-item ${disabled ? 'disabled' : ''}`;
      li.innerHTML = `<button class="page-link">${lbl}</button>`;
      if (!disabled) li.querySelector('button').addEventListener('click', cb);
      pag.appendChild(li);
    };

    crea('«', this.paginaActual === 1, () => {
      this.paginaActual--;
      this.renderPagina(this.paginaActual);
      this.renderPaginacion();
    });

    for (let i = 1; i <= total; i++) {
      crea(i, false, () => {
        this.paginaActual = i;
        this.renderPagina(i);
        this.renderPaginacion();
      });
      pag.lastChild.classList.toggle('active', i === this.paginaActual);
    }

    crea('»', this.paginaActual === total, () => {
      this.paginaActual++;
      this.renderPagina(this.paginaActual);
      this.renderPaginacion();
    });
  },

  obtenerBadge(estado) {
    const map = {
      pendiente: '<span class="badge bg-warning text-dark">Pendiente</span>',
      confirmado: '<span class="badge bg-success">Confirmado</span>',
      cancelado: '<span class="badge bg-danger">Cancelado</span>'
    };
    return map[estado] || '<span class="badge bg-secondary">Desconocido</span>';
  },

  initBuscador() {
    const input = document.getElementById('buscarPrestamo');
    if (!input) return;
    input.addEventListener('input', e => {
      const f = e.target.value.toLowerCase();
      this.prestamosFiltrados = this.prestamos.filter(p =>
        p.libro.toLowerCase().includes(f) || p.estado.toLowerCase().includes(f)
      );
      this.paginaActual = 1;
      this.renderPagina(this.paginaActual);
      this.renderPaginacion();
    });
  }
};
/* ====== Objeto UI de Socios ====== */
const SociosUI = {
  socios: [],


  cargarSocios: function() {
    if (!token) {
      console.error("No hay token para cargar socios");
      return;
    }

    const loader = document.getElementById('loader-socios');
    const contenedor = document.getElementById('contenedor-socios');
    if (loader) loader.classList.remove('d-none');
    if (contenedor) contenedor.classList.add('d-none');

    axios.get(`${API_BASE_URL}/socios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (loader) loader.classList.add('d-none');
      if (contenedor) contenedor.classList.remove('d-none');
      this.socios = response.data.data || [];
      this.mostrarSocios(this.socios);
      this.configurarBuscador();
    })
    .catch(error => {
      console.error("Error al cargar socios:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los socios. Intenta nuevamente más tarde.'
      });
    });
    
   }}
// terminar función cargarSocios el lunes 
    const loader = document.getElementById('loader-socios');
/* ----------  MÓDULO DE MULTAS  ---------- */
const Multas = {
  multasCompletas: [],

  // Cargar multas del socio
  cargarMultasSocio: function() {
    if (!token || !idUsuario) {
      console.error("No hay token o idUsuario para cargar multas");
      return;
    }

    const loader = document.getElementById('loader-multas');
    const contenedor = document.getElementById('contenedor-multas');
    if (loader) loader.classList.remove('d-none');
    if (contenedor) contenedor.classList.add('d-none');

    axios.get(`${API_BASE_URL}/multas/${idUsuario}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      if (loader) loader.classList.add('d-none');
      if (contenedor) contenedor.classList.remove('d-none');
      const multas = response.data.data || [];
      this.multasCompletas = multas;
      this.mostrarMultas(multas);
      this.configurarBuscador();

      // Actualizar badge
      const badgeMultas = document.getElementById("badge-multas");
      const numPendientes = multas.filter(m => m.estado !== 1).length;

      if (badgeMultas) {
        if (numPendientes > 0) {
          badgeMultas.textContent = numPendientes;
          badgeMultas.classList.remove("d-none");
        } else {
          badgeMultas.classList.add("d-none");
        }
      }
    })
    .catch(error => {
      console.error("Error al cargar multas:", error.response?.data || error.message);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las multas. Intenta nuevamente más tarde.'
      });
    });
  },

  // Cargar multas para admin
  cargarMultas: function() {
    if (!token || !idUsuario) {
      console.error("No hay token o idUsuario para cargar multas");
      return;
    }
    console.log("Cargando multas para admin...");

    const loader = document.getElementById('loader-multas');
    const contenedor = document.getElementById('contenedor-multas');
    if (loader) loader.classList.remove('d-none');
    if (contenedor) contenedor.classList.add('d-none');

    axios.get(`${API_BASE_URL}/multas`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      console.log("Multas cargadas correctamente");
      if (loader) loader.classList.add('d-none');
      if (contenedor) contenedor.classList.remove('d-none');
      const multas = response.data.data || [];
      this.multasCompletas = multas;
      this.mostrarMultas(multas);
      this.configurarBuscador();

      const badgeMultas = document.getElementById("badge-multas");
      if (badgeMultas) {
        badgeMultas.classList.add("d-none");
      }
    })
    .catch(error => {
      console.error("Error al cargar multas:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar las multas. Intenta nuevamente más tarde.'
      });
    });
  },

  // Mostrar multas en la interfaz
  mostrarMultas: function(multas) {
  const listaPendientes = document.getElementById("lista-multas-pendientes");
  const listaPagadas = document.getElementById("lista-multas-pagadas");

  let tienePendientes = false;
  let tienePagadas = false;

  if (listaPendientes) listaPendientes.innerHTML = "";
  if (listaPagadas) listaPagadas.innerHTML = "";

  multas.forEach(multa => {
    const pagada = multa.estado === 1;

    const li = document.createElement("li");
    li.className = "list-group-item";

    const contenido = document.createElement("div");
    contenido.className = "d-flex justify-content-between align-items-start flex-column flex-md-row";

    const info = document.createElement("div");

    let usuarioInfo = '';
    if (usuarioRol === 'A') {
      usuarioInfo = `
        <div class="col-md-6 mb-2">
          <strong>Usuario:</strong> <span>${multa.usuario || 'N/A'}</span>
        </div>
      `;
    }

    // Información común
    let infoHTML = `
      <h6 class="mb-2 fw-semibold text-primary">
        <i class="bi bi-exclamation-circle me-1"></i> 
        ${multa.motivo || 'Multa por retraso'}
      </h6>
      <div class="row text-muted">
        ${usuarioInfo}
        <div class="col-md-6 mb-2">
          <strong>Préstamo:</strong> <span>${multa.prestamo || 'N/A'}</span>
        </div>
        <div class="col-md-6 mb-2">
          <strong>Libro:</strong> <span>${multa.libro || 'N/A'}</span>
        </div>`;

    // Solo si está pagada, agregamos fecha de pago
    if (pagada) {
      const fecha = multa.fecha ? new Date(multa.fecha).toLocaleDateString() : "Sin fecha";
      infoHTML += `
        <div class="col-md-6 mb-2">
          <strong>Fecha de pago:</strong> <span>${fecha}</span> 
        </div>`;
    }

    // Monto (se muestra siempre)
    infoHTML += `
      <div class="col-md-6 mb-2">
        <strong>Monto:</strong> <span class="text-danger">€${parseFloat(multa.monto).toFixed(2)}</span>
      </div>
    </div>`;

    info.innerHTML = infoHTML;

    const accion = document.createElement("div");

    if (pagada) {
      tienePagadas = true;
      accion.innerHTML = `
        <span class="badge bg-success align-self-center mt-2 mt-md-0">
          <i class="bi bi-check-circle me-1"></i>Pagada
        </span>`;
      contenido.appendChild(info);
      contenido.appendChild(accion);
      li.appendChild(contenido);
      if (listaPagadas) listaPagadas.appendChild(li);
    } else {
      const btn = document.createElement("button");
      btn.className = "btn btn-outline-danger align-self-center mt-2 mt-md-0";

      if (usuarioRol === 'A') {
        btn.innerHTML = `<i class="bi bi-cash-coin me-1"></i>Sin pagar`;
      } else {
        btn.innerHTML = `<i class="bi bi-cash-coin me-1"></i>Pagar`;
        btn.onclick = () => this.pagar(multa.id);
      }

      tienePendientes = true;
      contenido.appendChild(info);
      contenido.appendChild(btn);
      li.appendChild(contenido);
      if (listaPendientes) listaPendientes.appendChild(li);
    }
  });

  const cardPendientes = document.getElementById("card-multas-pendientes");
  const cardPagadas = document.getElementById("card-multas-pagadas");

  if (cardPendientes) {
    cardPendientes.classList.remove('d-none');
    if (!tienePendientes) {
      listaPendientes.innerHTML = `<li class="list-group-item text-center text-muted">No tienes multas pendientes.</li>`;
    }
  }

  if (cardPagadas) {
    cardPagadas.classList.remove('d-none');
    if (!tienePagadas) {
      listaPagadas.innerHTML = `<li class="list-group-item text-center text-muted">No hay multas pagadas.</li>`;
    }
  }
}
,

  // Pagar una multa
  pagar: function(idMulta) {
    Swal.fire({
      title: '¿Deseas pagar esta multa?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, pagar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.put(`${API_BASE_URL}/multas/${idMulta}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        .then(() => {
          Swal.fire('Pagada', 'La multa ha sido pagada correctamente.', 'success')
            .then(() => this.cargarMultasSocio());
        })
        .catch(error => {
          console.error("Error al pagar la multa:", error.response?.data || error.message);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo pagar la multa. Inténtalo de nuevo más tarde.'
          });
        });
      }
    });
  },

  // Configurar buscador
  configurarBuscador: function () {
  const input = document.getElementById('buscador-multas');
  if (!input) return;

  input.addEventListener('input', (e) => {
    const texto = e.target.value.toLowerCase().trim();
    const filtradas = this.multasCompletas.filter(multa =>
      (multa.usuario && multa.usuario.toLowerCase().includes(texto)) ||
      (multa.libro && multa.libro.toLowerCase().includes(texto)) ||
      (multa.motivo && multa.motivo.toLowerCase().includes(texto)) ||
      String(multa.prestamo || '').toLowerCase().includes(texto)
    );
    this.mostrarMultas(filtradas);
  });
}

};

/* ----------  FUNCIONES DE UTILIDAD  ---------- */
// Reservar un libro
function reservarLibro(idLibro) {
  const idSocio = Number(localStorage.getItem('id_socio'));
  if (!token || !idSocio) {
    return Swal.fire({ icon:'warning', title:'Datos incompletos', text:'Faltan datos para reservar.' });
  }

  axios.post(`${API_BASE_URL}/prestamos`, { id_socio:idSocio, id_libro:idLibro }, {
    headers:{ Authorization:`Bearer ${token}` }
  })
  .then(() => {
    Swal.fire({ icon:'success', title:'¡Libro reservado!' })
      .then((response) => {
        
           window.location.reload();

      });
  })
  .catch(err => {
    Swal.fire({ icon:'error', title:'Oops...', text: err.response?.data?.error || 'Error al reservar.' });
    console.error(err);
  });
}

// Ver reseñas de un libro
function verResenas(libroId) {
  axios.get(`${API_BASE_URL}/reseñas/${libroId}`, {
    headers:{ Authorization:`Bearer ${token}` }
  })
  .then(({data}) => {
    const resenas = data.data;
    if (!resenas.length) {
      return Swal.fire({ icon:'info', title:'Sin reseñas', text:'Este libro aún no tiene reseñas.' });
    }

    const html = resenas.map(r => `
      <div class="card shadow-sm border-0 mb-3">
        <div class="card-body">
          <h5 class="card-title text-primary">
            <i class="bi bi-person-circle me-2"></i>${r.usuario || 'Usuario'}
          </h5>
          <p class="card-text">${r.comentario}</p>
          <div class="text-warning mb-1">
            ${'★'.repeat(r.calificacion)}${'☆'.repeat(5 - r.calificacion)}
          </div>
          <small class="text-muted">
            <i class="bi bi-calendar-date me-1"></i>${new Date(r.fecha).toLocaleDateString()}
          </small>
        </div>
      </div>`).join('');

    Swal.fire({
      title:'<i class="bi bi-chat-left-text me-2 text-success"></i> Reseñas',
      html:`<div style="max-height:400px;overflow-y:auto;">${html}</div>`,
      width:600, showCloseButton:true, showConfirmButton:false
    });
  })
  .catch(err => {
    Swal.fire({ icon:'error', title:'Error', text:'No se pudieron cargar las reseñas.' });
    console.error(err);
  });
}

// Devolver un libro
function devolverLibro(idPrestamo) {
  if (!token) {
    Swal.fire({ icon: 'error', title: 'Error', text: 'No hay token válido' });
    return;
  }

  axios.put(`${API_BASE_URL}/prestamos/${idPrestamo}`, {}, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(response => {
    const data = response.data;
    if (data.multa) {
        console.warn('Devolución con multa:', data.multa);
      Swal.fire({
        icon: 'warning',
        title: 'Devolución con multa',
        text: `Multa de ${data.multa.monto} € por entrega tardía. No podrás pedir nuevos libros hasta pagarla.`
      });
    } else {
      Swal.fire({
        icon: 'success',
        title: 'Libro devuelto correctamente',
        text: 'El libro ha sido devuelto correctamente.'
      });
    }
    PrestamosUI.cargarPrestamosSocio();
  })
  .catch(error => {
    Swal.fire({
      icon: 'error',
      title: 'Error al devolver el libro',
      text: error.response?.data?.error || 'No se pudo devolver el libro. Inténtalo de nuevo más tarde.'
    });
  });
}function aniadirLibro() {
    Swal.fire({
        title: 'Añadir Libro',
        html: `
            <div class="text-start">
                <div class="mb-3">
                    <label for="titulo" class="form-label fw-semibold">Título</label>
                    <input type="text" id="titulo" class="form-control" placeholder="Título del libro">
                </div>
                <div class="mb-3">
                    <label for="tutor" class="form-label fw-semibold">Tutor</label>
                    <input type="text" id="tutor" class="form-control" placeholder="Nombre del tutor">
                </div>
                <div class="mb-3">
                    <label for="ejemplares" class="form-label fw-semibold">Ejemplares</label>
                    <input type="number" id="ejemplares" class="form-control" placeholder="Número de ejemplares">
                </div>
                <div class="mb-3">
                    <label for="img" class="form-label fw-semibold">Imagen (URL)</label>
                    <input type="text" id="img" class="form-control" placeholder="URL de la imagen">
                </div>
            </div>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Guardar',
        cancelButtonText: 'Cancelar',
        customClass: {
            popup: 'text-start'
        },
        preConfirm: () => {
            const titulo = document.getElementById('titulo').value.trim();
            const tutor = document.getElementById('tutor').value.trim();
            const ejemplares = document.getElementById('ejemplares').value.trim();
            const img = document.getElementById('img').value.trim();

            if (!titulo || !tutor || !ejemplares || !img) {
                Swal.showValidationMessage('Por favor, completa todos los campos');
                return false;
            }

            return { titulo, tutor, ejemplares, img };
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const data = {
                titulo: result.value.titulo,
                autor: result.value.tutor,
                ejemplares: result.value.ejemplares,
                img: result.value.img
            };

            axios.post(`${API_BASE_URL}/libros`, data, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
                .then(response => {
                    Swal.fire('¡Libro añadido!', 'El libro ha sido guardado correctamente.', 'success');
                    Catalogo.fetch(); // Recargar catálogo
                    document.getElementById('buscarLibro').value = ''; // Limpiar buscador
                })
                .catch(error => {
                    console.error("Error al guardar el libro:", error);
                    Swal.fire('Error', error.response?.data?.error || 'Error al guardar el libro', 'error');
                });
        }
    });
}


// Añadir reseña a un libro
function aniadirResena(id_libro) {
  if (!token || !idUsuario) {
    Swal.fire({
      icon: 'warning',
      title: 'Datos incompletos',
      text: 'Faltan datos para realizar la reseña.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  Swal.fire({
    title: '<i class="bi bi-star-fill text-warning me-2"></i> Añadir Reseña',
    html: `
      <div class="text-start">
        <div class="mb-3">
          <label for="comentario" class="form-label fw-bold">Comentario</label>
          <textarea id="comentario" class="form-control rounded" rows="3" placeholder="Escribe tu opinión..."></textarea>
        </div>
        <div class="mb-3">
          <label for="puntuacion" class="form-label fw-bold">Puntuación</label>
          <select id="puntuacion" class="form-select rounded">
            <option value="">Selecciona una opción</option>
            <option value="1">⭐ 1 estrella</option>
            <option value="2">⭐⭐ 2 estrellas</option>
            <option value="3">⭐⭐⭐ 3 estrellas</option>
            <option value="4">⭐⭐⭐⭐ 4 estrellas</option>
            <option value="5">⭐⭐⭐⭐⭐ 5 estrellas</option>
          </select>
        </div>
      </div>
    `,
    customClass: {
      popup: 'rounded shadow-lg',
      confirmButton: 'btn btn-primary',
      cancelButton: 'btn btn-outline-secondary me-2'
    },
    showCancelButton: true,
    confirmButtonText: 'Enviar reseña',
    cancelButtonText: 'Cancelar',
    focusConfirm: false,
    preConfirm: () => {
      const comentario = document.getElementById('comentario').value;
      const puntuacion = document.getElementById('puntuacion').value;

      if (!comentario || !puntuacion) {
        Swal.showValidationMessage('Por favor, completa todos los campos.');
        return false;
      }
      return { comentario, puntuacion };
    }
  }).then((result) => {
    if (result.isConfirmed && result.value) {
      const { comentario, puntuacion } = result.value;
      
      axios.post(`${API_BASE_URL}/reseñas`, {
        id_usuario: idUsuario,
        id_libro: id_libro,
        comentario: comentario,
        calificacion: puntuacion
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(() => {
        Swal.fire({
          icon: 'success',
          title: '¡Gracias por tu reseña!',
          text: 'Tu opinión ha sido registrada correctamente.',
          confirmButtonColor: '#3085d6'
        }).then(() => {
          PrestamosUI.cargarPrestamosSocio();
        });
      })
      .catch(error => {
        Swal.fire({
          icon: 'error',
          title: 'Error al enviar reseña',
          text: error.response?.data?.error || 'Algo salió mal. Inténtalo de nuevo.',
          confirmButtonColor: '#d33'
        });
      });
    }
  });
}

// Mostrar detalles de un préstamo
function mostrarDetalles(prestamo) {
  document.getElementById("detalleTitulo").textContent = prestamo.libro;
  document.getElementById("detallePrestamo").textContent = prestamo.fecha_prestamo;
  document.getElementById("detalleDevolucionPrevista").textContent = prestamo.fecha_devolucion;
  document.getElementById("detalleDevolucion").textContent = prestamo.fecha_real_devolucion || "Pendiente";
  document.getElementById("detalleEstado").textContent = prestamo.estado;

  const diasRestantesContainer = document.getElementById("diasRestantesContainer");
  const detalleDiasRestantes = document.getElementById("detalleDiasRestantes");

  if (prestamo.estado === "pendiente") {
    const hoy = new Date();
    const fechaDevolucion = new Date(prestamo.fecha_devolucion);
    const diasRestantes = Math.ceil((fechaDevolucion - hoy) / (1000 * 60 * 60 * 24));

    let texto, claseColor;
    if (diasRestantes >= 0) {
      texto = `${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
      claseColor = "text-success";
    } else {
      texto = `Vencido hace ${Math.abs(diasRestantes)} día${Math.abs(diasRestantes) !== 1 ? 's' : ''}`;
      claseColor = "text-danger";
    }

    detalleDiasRestantes.textContent = texto;
    detalleDiasRestantes.className = `fw-bold ${claseColor}`;
    diasRestantesContainer.classList.remove("d-none");
  } else {
    diasRestantesContainer.classList.add("d-none");
  }

  const modal = new bootstrap.Modal(document.getElementById("modalDetalles"));
  modal.show();
}

// Cerrar sesión
function logout() {
  axios.post(`${API_BASE_URL}/logout`, {}, {
    headers:{ Authorization:`Bearer ${token}` }
  })
  .then(() => {
    ['token','us','id_socio','id_usuario'].forEach(k => localStorage.removeItem(k));
    Swal.fire({ title:'Sesión cerrada', text:'Redirigiendo...' });
    setTimeout(() => window.location.href = 'login.html', 2000);
  })
  .catch(err => {
    Swal.fire({ icon:'error', title:'Oops...', text: err.response?.data?.error || 'Error al cerrar sesión.' });
    console.error(err);
  });
}
function cargarSocios() {

  document.getElementById("loader-usuarios").classList.remove("d-none");
  axios.get(  
    `${API_BASE_URL}/usuarios`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      document.getElementById("loader-usuarios").classList.add("d-none");
      document.getElementById("contenedor-usuarios").classList.remove("d-none");
      const socios = res.data.data;
      const tabla = document.getElementById("tabla-socios");
      tabla.innerHTML = "";

      socios.forEach((socio, index) => {
        const nombre = socio.nombre || "N/A";
        const email = socio.email || "N/A";
        const ultimoAcceso = socio.fecha;
          
        const tipo = socio.tipo === 'A' ? 'Administrador' : 'Usuario';

        tabla.innerHTML += `
          <tr>
            <td>${index + 1}</td>
            <td>${nombre}</td>
            <td>${email}</td>
            <td>${ultimoAcceso}</td>
            <td>${tipo}</td>
          </tr>
        `;
      });
    })
    .catch(err => {
      console.error(err);
      alert("Error al cargar socios.");
    });
  }

/* ----------  INICIALIZACIÓN DE LA APLICACIÓN  ---------- */
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM cargado');
   const buscador = document.getElementById("buscarUsuario");
  if (buscador) {
    buscador.addEventListener("input", function () {
      const filtro = this.value.toLowerCase();
      const filas = document.querySelectorAll("#tabla-socios tr");

      filas.forEach(fila => {
        const textoFila = fila.textContent.toLowerCase();
        fila.style.display = textoFila.includes(filtro) ? "" : "none";
      });
    });
  }
  // Verificar autenticación
  const nombreUsuario = localStorage.getItem('us');
  const token = localStorage.getItem('token');
  
  if (!token || !nombreUsuario) {
    console.log('No token o usuario, redirigiendo a login...');
    window.location.href = 'login.html';
    return;
  }
  
  // Mostrar nombre de usuario
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = `Hola, ${nombreUsuario}`;
  } else {
    console.warn('No existe elemento con id user-name');
  }
  if (document.getElementById('catalogo')) {
    Catalogo.init();
  }
  // Inicializar módulos según la página actual
 if (document.getElementById('contenedor-prestamos')) {
    // Página de préstamos
     if(usuarioRol === 'S') {
  PrestamosUI.cargarPrestamosSocio();
  }else{
    PrestamosUI.cargarPrestamos();
  }
  PrestamosUI.initBuscador();
  } else if (document.getElementById('lista-multas-pendientes')) {
    // Página de multas
    console.log(usuarioRol);
    if(usuarioRol === 'S') {
        console.log('Cargando multas para socio');
      Multas.cargarMultasSocio();
    }else{
  
      console.log('Cargando multas para administrador');
      Multas.cargarMultas();
    }
  }
  if(usuarioRol === 'A') {
    // Si es administrador, cargar socios
    document.getElementById('nav-socios').classList.remove('d-none');
  if (document.getElementById('tabla-socios')) { 

    cargarSocios();
  }
  }else{
    // Si no es administrador, ocultar el menú socios
    document.getElementById('nav-socios').classList.add('d-none');
  }
});

// Cargar módulos necesarios al inicio
window.onload = () => {
  if(usuarioRol === 'S') {
  PrestamosUI.cargarPrestamosSocio();
  Multas.cargarMultasSocio();

  }else{
    console.log('Cargando préstamos y multas para administrador');
    PrestamosUI.cargarPrestamos();
    Multas.cargarMultas();
  }
};