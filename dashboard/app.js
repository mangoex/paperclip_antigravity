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
  const tabContacts = document.getElementById('tab-contacts');
  const contentActive = document.getElementById('content-active');
  const contentHistory = document.getElementById('content-history');
  const contentContacts = document.getElementById('content-contacts');
  const contactsContainer = document.getElementById('contacts-container');
  const crmSearch = document.getElementById('crm-search');

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
    tabContacts.classList.remove('active');
    contentActive.classList.add('active');
    contentHistory.classList.remove('active');
    contentContacts.classList.remove('active');
    contentActive.style.display = 'block';
    contentHistory.style.display = 'none';
    contentContacts.style.display = 'none';
  });

  tabHistory.addEventListener('click', () => {
    tabHistory.classList.add('active');
    tabActive.classList.remove('active');
    tabContacts.classList.remove('active');
    contentHistory.classList.add('active');
    contentActive.classList.remove('active');
    contentContacts.classList.remove('active');
    contentHistory.style.display = 'block';
    contentActive.style.display = 'none';
    contentContacts.style.display = 'none';
    fetchAndRenderHistory();
  });

  tabContacts.addEventListener('click', () => {
    tabContacts.classList.add('active');
    tabActive.classList.remove('active');
    tabHistory.classList.remove('active');
    contentContacts.classList.add('active');
    contentActive.classList.remove('active');
    contentHistory.classList.remove('active');
    contentContacts.style.display = 'block';
    contentActive.style.display = 'none';
    contentHistory.style.display = 'none';
    fetchAndRenderContacts();
  });

  crmSearch.addEventListener('input', () => {
    fetchAndRenderContacts(crmSearch.value.trim());
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

  function buildFunnelTimelineHtml(p) {
    // 1. WhatsApp 1 (Contacto Outbound)
    let wa1Status = 'badge-active';
    let wa1Text = 'WhatsApp 1: Pendiente';
    let wa1Icon = '○';
    
    if (p.whatsapp_status === 'accepted_by_meta') {
      wa1Status = 'badge-success';
      wa1Text = 'WhatsApp 1: Enviado (Meta API)';
      wa1Icon = '✓';
    } else if (p.whatsapp_status === 'simulated') {
      wa1Status = 'badge-warning';
      wa1Text = 'WhatsApp 1: Simulado';
      wa1Icon = '⚡';
    } else if (p.whatsapp_status === 'failed') {
      wa1Status = 'badge-failed';
      wa1Text = 'WhatsApp 1: Falló';
      wa1Icon = '✗';
    }
    
    // 2. Email 1 (Contacto Outbound)
    let emailStatus = 'badge-active';
    let emailText = 'Email SMTP: Pendiente';
    let emailIcon = '○';
    
    if (p.email_status === 'sent') {
      emailStatus = 'badge-success';
      emailText = 'Email SMTP: Enviado';
      emailIcon = '✓';
    } else if (p.email_status === 'simulated') {
      emailStatus = 'badge-warning';
      emailText = 'Email SMTP: Simulado';
      emailIcon = '⚡';
    } else if (p.email_status === 'failed') {
      emailStatus = 'badge-failed';
      emailText = 'Email SMTP: Falló';
      emailIcon = '✗';
    }

    // 3. WhatsApp 2 (Seguimiento Día 3)
    let wa2Status = 'badge-active';
    let wa2Text = 'WhatsApp 2 (Día 3): Pendiente';
    let wa2Icon = '○';
    
    // 4. WhatsApp 3 (Seguimiento Día 7)
    let wa3Status = 'badge-active';
    let wa3Text = 'WhatsApp 3 (Día 7): Pendiente';
    let wa3Icon = '○';

    // 5. Propuesta Personalizada (Demo Web)
    let demoStatus = 'badge-active';
    let demoText = 'Propuesta Web: No Construida';
    let demoIcon = '○';
    let demoLinksHtml = '';
    
    if (p.urls && p.urls.principal) {
      demoStatus = 'badge-success';
      demoText = 'Propuesta Web: Construida';
      demoIcon = '✓';
      demoLinksHtml = `
        <div class="demo-links" style="margin-top: 6px; display: flex; gap: 8px; font-size: 0.78rem; width: 100%;">
          <a href="${p.urls.principal}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; border-bottom: 1px dashed var(--accent-cyan);">🖥️ Landing</a>
          <a href="${p.urls.propuesta}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; border-bottom: 1px dashed var(--accent-cyan);">💰 Planes</a>
          <a href="${p.urls.reporte}" target="_blank" style="color: var(--accent-cyan); text-decoration: none; border-bottom: 1px dashed var(--accent-cyan);">📈 Reporte</a>
        </div>
      `;
    }

    return `
      <div class="funnel-timeline" style="margin: 12px 0; padding: 12px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 0.72rem; text-transform: uppercase; color: var(--text-secondary); font-weight: 700; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.05); padding-bottom: 6px; margin-bottom: 4px;">Progreso del Embudo</div>
        
        <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem;">
          <span style="color: ${wa1Icon === '✓' ? 'var(--accent-green)' : (wa1Icon === '⚡' ? 'var(--accent-orange)' : 'var(--text-muted)')}; font-weight: bold; width: 14px; text-align: center;">${wa1Icon}</span>
          <span class="badge ${wa1Status}" style="font-size: 0.65rem; padding: 2px 6px;">${wa1Text}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem;">
          <span style="color: ${emailIcon === '✓' ? 'var(--accent-green)' : (emailIcon === '⚡' ? 'var(--accent-orange)' : 'var(--text-muted)')}; font-weight: bold; width: 14px; text-align: center;">${emailIcon}</span>
          <span class="badge ${emailStatus}" style="font-size: 0.65rem; padding: 2px 6px;">${emailText}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem;">
          <span style="color: var(--text-muted); font-weight: bold; width: 14px; text-align: center;">${wa2Icon}</span>
          <span class="badge ${wa2Status}" style="font-size: 0.65rem; padding: 2px 6px;">${wa2Text}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem;">
          <span style="color: var(--text-muted); font-weight: bold; width: 14px; text-align: center;">${wa3Icon}</span>
          <span class="badge ${wa3Status}" style="font-size: 0.65rem; padding: 2px 6px;">${wa3Text}</span>
        </div>
        
        <div style="display: flex; align-items: center; gap: 10px; font-size: 0.8rem; flex-wrap: wrap;">
          <span style="color: ${demoIcon === '✓' ? 'var(--accent-green)' : 'var(--text-muted)'}; font-weight: bold; width: 14px; text-align: center;">${demoIcon}</span>
          <span class="badge ${demoStatus}" style="font-size: 0.65rem; padding: 2px 6px;">${demoText}</span>
          ${demoLinksHtml}
        </div>
      </div>
    `;
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
        ${buildFunnelTimelineHtml(p)}
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
          ${buildFunnelTimelineHtml(p)}
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

  // Carga y renderización de la pestaña CRM de Contactos
  async function fetchAndRenderContacts(filterQuery = '') {
    try {
      const response = await fetch('/api/history');
      let prospects = await response.json();
      
      // Ordenar por fecha descendente
      prospects.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Aplicar filtro si existe
      if (filterQuery) {
        const query = filterQuery.toLowerCase();
        prospects = prospects.filter(p => 
          (p.name && p.name.toLowerCase().includes(query)) ||
          (p.ciudad && p.ciudad.toLowerCase().includes(query)) ||
          (p.email && p.email.toLowerCase().includes(query)) ||
          (p.phone && p.phone.toLowerCase().includes(query))
        );
      }
      
      if (!prospects || prospects.length === 0) {
        contactsContainer.innerHTML = '<div class="no-leads">No se encontraron contactos...</div>';
        return;
      }
      
      contactsContainer.innerHTML = '';
      prospects.forEach(p => {
        const card = document.createElement('div');
        card.className = 'lead-card';
        
        // Estatus de Contacto (Meta/SMTP)
        let contactBadgeClass = 'badge-failed';
        let contactBadgeText = 'No Contactado';
        if (p.whatsapp_status === 'accepted_by_meta' || p.email_status === 'sent') {
          contactBadgeClass = 'badge-success';
          contactBadgeText = 'Contactado';
        } else if (p.whatsapp_status === 'simulated' || p.email_status === 'simulated') {
          contactBadgeClass = 'badge-warning';
          contactBadgeText = 'Simulado';
        }
        
        // Estatus de Página
        const hasDemo = p.urls && p.urls.principal;
        let pageBadgeClass = hasDemo ? 'badge-success' : 'badge-active';
        let pageBadgeText = hasDemo ? 'Tiene Página' : 'Sin Página';
        
        // Calificación Score
        const isHighOpportunity = p.opportunity >= 8;
        
        const demoBtnHtml = hasDemo 
          ? `<button class="btn btn-sm btn-secondary btn-view-demo">Ver Demo</button>`
          : `<button class="btn btn-sm btn-primary btn-build-demo">Generar Demo Web</button>`;

        card.innerHTML = `
          <div class="lead-header">
            <span class="lead-name">${p.name}</span>
            <span class="lead-score ${isHighOpportunity ? 'high' : ''}">Score: ${p.opportunity}/10</span>
          </div>
          
          <div class="lead-badges-row">
            <span class="badge ${contactBadgeClass}">${contactBadgeText}</span>
            <span class="badge ${pageBadgeClass}">${pageBadgeText}</span>
          </div>
          
          <div class="lead-details">
            <span><strong>Giro:</strong> Odontología</span>
            <span><strong>Ciudad:</strong> ${p.ciudad || 'Chihuahua'}</span>
            <span><strong>WhatsApp:</strong> ${p.phone}</span>
            <span><strong>Email:</strong> ${p.email || 'No proporcionado'}</span>
          </div>
          
          <div class="lead-actions" style="margin-top: 12px; display: flex; gap: 8px;">
            <a href="https://wa.me/${p.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(p.name)}%20" target="_blank" class="btn btn-sm btn-whatsapp" style="text-decoration: none; flex-grow: 1;">
              💬 WhatsApp
            </a>
            <a href="mailto:${p.email || ''}" class="btn btn-sm btn-email" style="text-decoration: none; flex-grow: 1;">
              ✉️ Correo
            </a>
            ${demoBtnHtml}
          </div>
        `;

        // Event listener para el botón de ver demo
        if (hasDemo) {
          card.querySelector('.btn-view-demo').addEventListener('click', () => {
            modalTitle.textContent = `Propuesta Generada: ${p.name}`;
            linkLanding.href = p.urls.principal;
            linkProposal.href = p.urls.propuesta;
            linkReport.href = p.urls.reporte;
            demoModal.classList.add('active');
          });
        } else {
          // Detonar flujo demo
          card.querySelector('.btn-build-demo').addEventListener('click', async (e) => {
            const btn = e.target;
            btn.disabled = true;
            btn.textContent = 'Construyendo...';
            
            resetPipelineNodes();
            nodes.scout.querySelector('.node-name').textContent = 'DesignPlanner';
            nodes.qualifier.querySelector('.node-name').textContent = 'WebBuilder';
            nodes.outreach.querySelector('.node-name').textContent = 'WebQA';
            nodes.closer.querySelector('.node-name').textContent = 'WebPublisher';
            
            consoleStream.innerHTML = `<div class="log-line system-line">&gt; Inició propuesta Demo para ${p.name}...</div>`;
            
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
        
        contactsContainer.appendChild(card);
      });
    } catch (err) {
      console.error("Error al cargar contactos en CRM:", err);
      contactsContainer.innerHTML = '<div class="no-leads">Error al cargar contactos en CRM.</div>';
    }
  }
});
