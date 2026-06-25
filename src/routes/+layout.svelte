<script>
  import '../app.css'
</script>

<svelte:head>
  <title>YVY AI – Conexión con la tierra</title>
</svelte:head>

<nav class="navbar navbar-expand-lg bg-light border-bottom">
  <div class="container-fluid">
    <a class="navbar-brand d-flex align-items-center gap-2" href="/">
      <i class="bi bi-flower1 text-success fs-4"></i>
      <span class="fw-bold">YVY AI</span>
    </a>
    <button
      class="navbar-toggler"
      type="button"
      data-bs-toggle="collapse"
      data-bs-target="#navMain"
      aria-controls="navMain"
      aria-expanded="false"
      aria-label="Toggle navigation"
    >
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navMain">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="/">Inicio</a></li>
        <li class="nav-item"><a class="nav-link" href="/">Sensores</a></li>
        <li class="nav-item"><a class="nav-link" href="/">Reportes</a></li>
      </ul>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-secondary btn-sm">Advanced</button>
        <button class="btn btn-success btn-sm">Usuario</button>
      </div>
    </div>
  </div>
</nav>

<main>
  <slot />
</main>
