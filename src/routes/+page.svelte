<script>
  import { onMount } from 'svelte'
  import Chart from 'chart.js/auto'

  let messages = []
  let input = ''
  let busy = false
  let endEl
  let barEl
  let lineEl

  $: messages, busy, endEl?.scrollIntoView({ behavior: 'smooth' })

  function parseCSV(text) {
    const [hdr, ...rows] = text.trim().split('\n')
    const keys = hdr.split(',').map(k => k.trim())
    return rows.map(r => {
      const vals = r.split(',')
      return Object.fromEntries(
        keys.map((k, i) => [k, isNaN(Number(vals[i])) ? vals[i] : Number(vals[i])])
      )
    })
  }

  async function send() {
    const q = input.trim()
    if (!q || busy) return
    messages = [...messages, { role: 'human', text: q }]
    input = ''
    busy = true
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q })
      })
      const data = await res.json()
      messages = [...messages, { role: 'ai', text: data.response }]
    } catch {
      messages = [...messages, { role: 'ai', text: '❌ Error al conectar.' }]
    }
    busy = false
  }

  function handleKey(e) {
    if (e.key === 'Enter') send()
  }

  onMount(async () => {
    // --- Bar chart ---
    let barData = [
      { name: 'Lote A', humedad: 68, temp: 27.5 },
      { name: 'Lote B', humedad: 61, temp: 26.8 }
    ]
    try {
      const r = await fetch('/data/kpi_bar.csv')
      if (r.ok) barData = parseCSV(await r.text())
    } catch {}

    const barChart = new Chart(barEl, {
      type: 'bar',
      data: {
        labels: barData.map(r => r.name),
        datasets: [
          {
            label: 'Humedad (%)',
            data: barData.map(r => r.humedad),
            backgroundColor: 'rgba(54, 162, 235, 0.7)'
          },
          {
            label: 'Temp (°C)',
            data: barData.map(r => r.temp),
            backgroundColor: 'rgba(255, 99, 132, 0.7)'
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })

    // --- Line chart ---
    let lineData = [
      { h: '00', suelo: 68, aire: 22 },
      { h: '04', suelo: 65, aire: 20 },
      { h: '08', suelo: 70, aire: 24 },
      { h: '12', suelo: 72, aire: 28 }
    ]
    try {
      const r = await fetch('/data/kpi_line.csv')
      if (r.ok) lineData = parseCSV(await r.text())
    } catch {}

    const lineChart = new Chart(lineEl, {
      type: 'line',
      data: {
        labels: lineData.map(r => r.h),
        datasets: [
          {
            label: 'Suelo',
            data: lineData.map(r => r.suelo),
            borderColor: 'rgba(153, 102, 255, 1)',
            backgroundColor: 'rgba(153, 102, 255, 0.1)',
            tension: 0.3,
            fill: true
          },
          {
            label: 'Aire',
            data: lineData.map(r => r.aire),
            borderColor: 'rgba(255, 159, 64, 1)',
            backgroundColor: 'rgba(255, 159, 64, 0.1)',
            tension: 0.3,
            fill: true
          }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })

    return () => {
      barChart.destroy()
      lineChart.destroy()
    }
  })
</script>

<div class="container-fluid" style="height: calc(100vh - 56px);">
  <div class="row h-100 g-2 p-2">

    <!-- Chat -->
    <div class="col-12 col-lg-6 d-flex flex-column" style="min-height: 0;">
      <div class="card flex-grow-1 d-flex flex-column" style="min-height: 0;">
        <div class="card-header fw-semibold">
          <i class="bi bi-chat-dots-fill me-2 text-success"></i>Chat RAG · YVY AI
        </div>

        <div
          // class="card-body flex-grow-1 chat-scroll d-flex flex-column gap-2 h-100"
          class="card-body overflow-auto"
          //style="min-height: 0; padding-right: 0.5rem; overflow-y: auto;"
          style="flex: 1 1 0; min-height: 0"
        >
          {#each messages as msg}
            {#if msg.role === 'human'}
              <div style="
                background: #111827;
                color: white;
                border-radius: 0.75rem;
                padding: 0.5rem 0.75rem;
                max-width: 85%;
                margin-left: auto;
                margin-bottom: 0.5rem;
                box-shadow: 0 1px 2px rgba(0,0,0,0.1);
                white-space: pre-wrap;
              ">
                {msg.text}
              </div>
            {:else}
              <div style="
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 0.75rem;
                padding: 0.5rem 0.75rem;
                max-width: 85%;
                box-shadow: 0 1px 2px rgba(0,0,0,0.05);
                white-space: pre-wrap;
                margin-bottom: 0.5rem;
              ">
                {msg.text}
              </div>
            {/if}
          {/each}

          {#if busy}
            <div style="
              background: white;
              border: 2px solid #fd9992;
              border-radius: 0.75rem;
              padding: 0.5rem 0.75rem;
              max-width: 85%;
              color: #888;
              font-style: italic;
              margin-bottom: 0.5rem;
            ">
              Pensando…
            </div>
          {/if}

          <div bind:this={endEl}></div>
        </div>

        <div class="card-footer">
          <div class="input-group">
            <input
              type="text"
              class="form-control"
              placeholder="Preguntá algo sobre tus cultivos…"
              bind:value={input}
              on:keydown={handleKey}
              disabled={busy}
            />
            <button class="btn btn-primary" on:click={send} disabled={busy}>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts -->
    <div class="col-12 col-lg-6 d-flex flex-column gap-2" style="min-height: 0;">
      <div class="card flex-grow-1">
        <div class="card-header fw-semibold">
          <i class="bi bi-bar-chart-fill me-2 text-primary"></i>Humedad / Temperatura por Lote
        </div>
        <div class="card-body" style="height: 280px; position: relative;">
          <canvas bind:this={barEl}></canvas>
        </div>
      </div>

      <div class="card flex-grow-1">
        <div class="card-header fw-semibold">
          <i class="bi bi-graph-up me-2 text-warning"></i>Tendencia 24 h – Suelo vs. Aire
        </div>
        <div class="card-body" style="height: 280px; position: relative;">
          <canvas bind:this={lineEl}></canvas>
        </div>
      </div>
    </div>

  </div>
</div>
