// Lógica de cliente para la consola de orquestación de Humanio

document.addEventListener('DOMContentLoaded', () => {
  const outboundForm = document.getElementById('outbound-form');
  const btnRun = document.getElementById('btn-run');
  const consoleStream = document.getElementById('console-stream');
  const btnClearConsole = document.getElementById('btn-clear-console');
  const leadsContainer = document.getElementById('leads-container');
  
  // Elementos de Pestañas
  const tabActive = document.getElementById('tab-active');
  const tabHistory = document.getElementById('tab-history');
  const contentActive = document.getElementById('content-active');
  const contentHistory = document.getElementById('content-history');

  // Nodos del pipeline
  const nodes = {
    ceo: document.getElementById('node-ceo'),
    scout: document.getElementById('node-scout'),
    qualifier: document.getElementById('node-qualifier'),
    outreach: document.getElementById('node-outreach'),
    closer: document.getElementById('node-closer'),
    designplanner: document.getElementById('node-scout'),  // Reutilizado para la demo
    webbuilder: document.getElementById('node-qualifier'),  // Reutilizado para la demo
    webqa: document.getElementById('node-outreach'),         // Reutilizado para la demo
    webpublisher: document.getElementById('node-closer')    // Reutilizado para la demo
  };

  // Elementos de la modal
  const demoModal = document.getElementById('demo-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const modalTitle = document.getElementById('modal-title');
  const linkLanding = document.getElementById('link-landing');
  const linkProposal = document.getElementById('link-proposal');
  const linkReport = document.getElementById('link-report');

  // Inicializar stream de Server-Sent Events (SSE)
  const eventSource = new EventSource('/api/events');

  // Manejo de clicks en Pestañas
  tabActive.addEventListener('click', () => {
    tabActive.classList.add('active');
    tabHistory.classList.remove('active');
    contentActive.classList.add('active');
    contentHistory.classList.remove('active');
    contentActive.style.display = 'block';
    contentHistory.style.display = 'none';
  });

  tabHistory.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabActive.classList.remove('active');
    contentHistory.classList.add('active');
    contentActive.classList.remove('active');
    contentHistory.style.display = 'block';
    contentActive.style.display = 'none';
    fetchAndRenderHistory();
  });

  // Cargar historial al inicio
  fetchAndRenderHistory();

  eventSource.addEventListener('log', (event) => {
    const data = JSON.parse(event.data);
    appendConsoleLine(data.text, data.type);
  });

  eventSource.addEventListener('status', (event) => {
    const data = JSON.parse(event.data);
    updatePipelineNode(data);
  });

  eventSource.addEventListener('complete', (event) => {
    const data = JSON.parse(event.data);
    appendConsoleLine(`🎉 ${data.message}`, 'system');
    btnRun.disabled = false;
    btnRun.textContent = 'Detonar Pipeline Outbound';
    
    // Renderizar tarjetas de prospectos calificados
    renderLeads(data.prospects);
    fetchAndRenderHistory();
  });

  eventSource.addEventListener('complete-demo', (event) => {
    const data = JSON.parse(event.data);
    appendConsoleLine(`🎉 Demo construida y validada con éxito para ${data.name}!`, 'system');
    
    // Configurar y mostrar modal de visualización
    modalTitle.textContent = `Propuesta Generada: ${data.name}`;
    linkLanding.href = data.urls.principal;
    linkProposal.href = data.urls.propuesta;
    linkReport.href = data.urls.reporte;
    
    demoModal.classList.add('active');

    // Reactivar botones de Demo
    document.querySelectorAll('.btn-build-demo').forEach(btn => {
      btn.disabled = false;
      btn.textContent = 'Generar Demo Web';
    });
    fetchAndRenderHistory();
  });

  // Limpiar terminal
  btnClearConsole.addEventListener('click', () => {
    consoleStream.innerHTML = '<div class="log-line system-line">&gt; Terminal limpia. Listo.</div>';
  });

  // Cerrar modal
  btnCloseModal.addEventListener('click', () => {
    demoModal.classList.remove('active');
  });

  window.addEventListener('click', (e) => {
    if (e.target === demoModal) {
      demoModal.classList.remove('active');
    }
  });

  // Detonar flujo Outbound
  outboundForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    btnRun.disabled = true;
    btnRun.textContent = 'Ejecutando...';
    
    // Resetear nodos de la UI
    resetPipelineNodes();
    
    // Resetear nombres visuales de los nodos para el flujo outbound
    nodes.scout.querySelector('.node-name').textContent = 'Scout';
    nodes.qualifier.querySelector('.node-name').textContent = 'Qualifier';
    nodes.outreach.querySelector('.node-name').textContent = 'Outreach';
    nodes.closer.querySelector('.node-name').textContent = 'Closer';
    
    consoleStream.innerHTML = '<div class="log-line system-line">&gt; Iniciando conexión con el pipeline de agentes...</div>';

    const payload = {
      nicho: document.getElementById('nicho').value,
      ciudad: document.getElementById('ciudad').value,
      pais: document.getElementById('pais').value,
      limit: parseInt(document.getElementById('limit').value, 10) || 3,
      testPhone: document.getElementById('test-phone').value,
      testEmail: document.getElementById('test-email').value
    };

    try {
      const response = await fetch('/api/run-outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      appendConsoleLine(`Status: ${data.message}`, 'system');
    } catch (err) {
      appendConsoleLine(`Error al conectar con la API: ${err.message}`, 'error');
      btnRun.disabled = false;
      btnRun.textContent = 'Detonar Pipeline Outbound';
    }
  });

  // Funciones de actualización de UI
  function appendConsoleLine(text, type = 'default') {
    const line = document.createElement('div');
    line.classList.add('log-line');
    if (type === 'error') line.classList.add('error-line');
    else if (type === 'system') line.classList.add('system-line');
    else if (text.startsWith('[Paso')) line.classList.add('step-line');
    
    line.textContent = text;
    consoleStream.appendChild(line);
    consoleStream.scrollTop = consoleStream.scrollHeight;
  }

  function updatePipelineNode({ agent, status }) {
    const node = nodes[agent];
    if (!node) return;

    if (status === 'running') {
      node.classList.remove('success', 'failed');
      node.classList.add('running');
      node.querySelector('.node-status').textContent = 'Active';
    } else if (status === 'success') {
      node.classList.remove('running', 'failed');
      node.classList.add('success');
      node.querySelector('.node-status').textContent = 'Done';
    } else if (status === 'failed') {
      node.classList.remove('running', 'success');
      node.classList.add('failed');
      node.querySelector('.node-status').textContent = 'Blocked';
    }
  }

  function resetPipelineNodes() {
    Object.values(nodes).forEach(node => {
      node.className = 'node';
      node.querySelector('.node-status').textContent = 'Idle';
    });
  }

  function renderLeads(prospects) {
    leadsContainer.innerHTML = '';
    
    prospects.forEach(p => {
      const card = document.createElement('div');
      card.className = 'lead-card';
      
      const isHighOpportunity = p.opportunity >= 8;
      
      card.innerHTML = `
        <div class="lead-header">
          <span class="lead-name">${p.name}</span>
          <span class="lead-score ${isHighOpportunity ? 'high' : ''}">Score: ${p.opportunity}/10</span>
        </div>
        <div class="lead-details">
          <span><strong>Giro:</strong> Odontología</span>
          <span><strong>Paquete:</strong> ${p.package}</span>
          <span><strong>Teléfono:</strong> ${p.phone}</span>
        </div>
        <div class="lead-diagnostic">
          ${p.diagnostic}
        </div>
        <div class="lead-actions">
          <button class="btn btn-sm btn-secondary btn-diagnostic">Ver Diagnóstico</button>
          <button class="btn btn-sm btn-primary btn-build-demo">Generar Demo Web</button>
        </div>
      `;

      // Detonar flujo Inbound/Demo
      card.querySelector('.btn-build-demo').addEventListener('click', async (e) => {
        const btn = e.target;
        btn.disabled = true;
        btn.textContent = 'Construyendo...';
        
        resetPipelineNodes();
        // Cambiamos nombres visuales de los nodos para que coincidan con el flujo demo
        nodes.scout.querySelector('.node-name').textContent = 'DesignPlanner';
        nodes.qualifier.querySelector('.node-name').textContent = 'WebBuilder';
        nodes.outreach.querySelector('.node-name').textContent = 'WebQA';
        nodes.closer.querySelector('.node-name').textContent = 'WebPublisher';
        
        consoleStream.innerHTML = `<div class="log-line system-line">&gt; Iniciando pipeline de Demo para ${p.name}...</div>`;

        try {
          const response = await fetch('/api/run-demo', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: p.slug, name: p.name })
          });
          const data = await response.json();
          appendConsoleLine(`Status: ${data.message}`, 'system');
        } catch (err) {
          appendConsoleLine(`Error al detonar demo: ${err.message}`, 'error');
          btn.disabled = false;
          btn.textContent = 'Generar Demo Web';
        }
      });

      card.querySelector('.btn-diagnostic').addEventListener('click', () => {
        appendConsoleLine(`\n[Auditoría SEO - ${p.name}]:`, 'system');
        appendConsoleLine(`- Diagnóstico: ${p.diagnostic}`);
        appendConsoleLine(`- Plan sugerido: Paquete ${p.package}`);
        appendConsoleLine(`- Estado comercial: Esperando lanzamiento de demo.\n`);
      });

      leadsContainer.appendChild(card);
    });
  }

  // Carga y renderización del historial de prospectos
  async function fetchAndRenderHistory() {
    const historyContainer = document.getElementById('history-container');
    try {
      const response = await fetch('/api/history');
      const prospects = await response.json();
      prospects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      if (!prospects || prospects.length === 0) {
        historyContainer.innerHTML = '<div class="no-leads">No hay historial disponible...</div>';
        return;
      }
      
      historyContainer.innerHTML = '';
      prospects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        
        const isHighOpportunity = p.opportunity >= 8;
        
        let badgeClass = 'badge-active';
        let badgeText = `${p.lastStage} [Active]`;
        if (p.status === 'success') {
          badgeClass = 'badge-success';
          badgeText = `${p.lastStage} [Done]`;
        } else if (p.status === 'failed') {
          badgeClass = 'badge-failed';
          badgeText = `${p.lastStage} [Failed]`;
        }
        
        const dateStr = new Date(p.timestamp).toLocaleString('es-MX', {
          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });

        const hasDemo = p.urls && p.urls.principal;
        const demoBtnHtml = hasDemo 
          ? `<button class="btn btn-sm btn-secondary btn-view-demo">Ver Demo</button>`
          : `<button class="btn btn-sm btn-primary btn-build-demo">Generar Demo Web</button>`;

        card.innerHTML = `
          <div class="lead-header">
            <span class="lead-name">${p.name}</span>
            <span class="lead-score ${isHighOpportunity ? 'high' : ''}">Score: ${p.opportunity}/10</span>
          </div>
          <div style="margin: 8px 0 12px;">
            <span class="badge ${badgeClass}">${badgeText}</span>
            <span class="lead-card-timestamp">${dateStr}</span>
          </div>
          <div class="lead-details">
            <span><strong>Giro:</strong> Odontología</span>
            <span><strong>Teléfono:</strong> ${p.phone}</span>
            <span><strong>Email:</strong> ${p.email}</span>
          </div>
          <div class="lead-diagnostic">
            ${p.diagnostic}
          </div>
          <div class="lead-actions">
            <button class="btn btn-sm btn-secondary btn-diagnostic">Ver Diagnóstico</button>
            ${demoBtnHtml}
          </div>
        `;

        card.querySelector('.btn-diagnostic').addEventListener('click', () => {
          appendConsoleLine(`\n[Auditoría SEO - ${p.name}]:`, 'system');
          appendConsoleLine(`- Diagnóstico: ${p.diagnostic}`);
          appendConsoleLine(`- Plan sugerido: Paquete ${p.package}`);
          appendConsoleLine(`- Último Agente: ${p.lastStage.toUpperCase()} (${p.status})\n`);
        });

        if (hasDemo) {
          card.querySelector('.btn-view-demo').addEventListener('click', () => {
            modalTitle.textContent = `Propuesta Generada: ${p.name}`;
            linkLanding.href = p.urls.principal;
            linkProposal.href = p.urls.propuesta;
            linkReport.href = p.urls.reporte;
            demoModal.classList.add('active');
          });
        } else {
          card.querySelector('.btn-build-demo').addEventListener('click', async (e) => {
            const btn = e.target;
            btn.disabled = true;
            btn.textContent = 'Construyendo...';
            
            resetPipelineNodes();
            nodes.scout.querySelector('.node-name').textContent = 'DesignPlanner';
            nodes.qualifier.querySelector('.node-name').textContent = 'WebBuilder';
            nodes.outreach.querySelector('.node-name').textContent = 'WebQA';
            nodes.closer.querySelector('.node-name').textContent = 'WebPublisher';
            
            consoleStream.innerHTML = `<div class="log-line system-line">&gt; Iniciando pipeline de Demo para ${p.name}...</div>`;

            try {
              const response = await fetch('/api/run-demo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ slug: p.slug, name: p.name })
              });
              const data = await response.json();
              appendConsoleLine(`Status: ${data.message}`, 'system');
            } catch (err) {
              appendConsoleLine(`Error al detonar demo: ${err.message}`, 'error');
              btn.disabled = false;
              btn.textContent = 'Generar Demo Web';
            }
          });
        }

        historyContainer.appendChild(card);
      });
    } catch (err) {
      console.error("Error al cargar el historial:", err);
      historyContainer.innerHTML = '<div class="no-leads">Error al cargar el historial.</div>';
    }
  }
});
