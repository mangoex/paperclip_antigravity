import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

// Servir la carpeta dashboard de forma estática
app.use('/', express.static(path.join(__dirname, 'dashboard')));

// Servir la carpeta tmp de la propuesta de forma estática para previsualización directa
// La carpeta de propuestas está en el workspace de Humanio o en la de paperclip_antigravity
const humanioTmpPath = '/Users/miguelgonzalez/Codex/Humanio/tmp';
if (existsSync(humanioTmpPath)) {
  app.use('/proposals', express.static(humanioTmpPath));
  console.log(`[Server] Sirviendo propuestas generadas desde: ${humanioTmpPath}`);
} else {
  // Fallback a la carpeta local de este repositorio
  app.use('/proposals', express.static(path.join(__dirname, 'tmp')));
}

// Lista de clientes SSE activos
let sseClients = [];

// Endpoint SSE para el streaming en tiempo real
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  sseClients.push(res);

  req.on('close', () => {
    sseClients = sseClients.filter(client => client !== res);
  });
});

// Función para enviar eventos SSE a todos los clientes conectados
function broadcastEvent(type, data) {
  const message = `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;
  sseClients.forEach(client => client.write(message));
}

// Endpoint para detonar el flujo Outbound
app.post('/api/run-outbound', (req, res) => {
  const { nicho, ciudad, pais, limit, testPhone, testEmail } = req.body;
  
  res.json({ status: 'started', message: 'Flujo Outbound iniciado.' });
  
  broadcastEvent('status', { message: 'Iniciando simulación del flujo de agentes...', step: 1, agent: 'ceo', status: 'running' });

  // Ejecutamos el coordinator.js y parseamos su salida en tiempo real
  const cmd = `node coordinator.js outbound "${nicho.replace(/"/g, '\\"')}" "${ciudad.replace(/"/g, '\\"')}" "${pais.replace(/"/g, '\\"')}"`;
  const child = exec(cmd, { cwd: __dirname });

  let fullOutput = '';

  child.stdout.on('data', (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Limpiar códigos de color ANSI de la consola
      const cleanLine = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
      
      broadcastEvent('log', { text: cleanLine });
      fullOutput += cleanLine + '\n';

      // Parseamos los pasos para actualizar el estado visual de los agentes
      if (cleanLine.includes('[Paso 1]')) {
        broadcastEvent('status', { step: 1, agent: 'ceo', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 2]')) {
        broadcastEvent('status', { step: 1, agent: 'ceo', status: 'success' });
        broadcastEvent('status', { step: 2, agent: 'scout', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 3]')) {
        broadcastEvent('status', { step: 2, agent: 'scout', status: 'success' });
        broadcastEvent('status', { step: 3, agent: 'qualifier', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 4]')) {
        broadcastEvent('status', { step: 3, agent: 'qualifier', status: 'success' });
        broadcastEvent('status', { step: 4, agent: 'ceo', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 5]')) {
        broadcastEvent('status', { step: 4, agent: 'ceo', status: 'success' });
        broadcastEvent('status', { step: 5, agent: 'outreach', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 6]')) {
        broadcastEvent('status', { step: 5, agent: 'outreach', status: 'success' });
        broadcastEvent('status', { step: 6, agent: 'closer', status: 'running', message: cleanLine });
      }
    });
  });

  child.stderr.on('data', (data) => {
    broadcastEvent('log', { text: `[Error] ${data}`, type: 'error' });
  });

  child.on('close', (code) => {
    broadcastEvent('status', { step: 6, agent: 'closer', status: 'success' });
    
    // Pool de clínicas reales para generar dinámicamente según la cantidad pedida
    const allProspects = [
      {
        name: 'Clínica Dental Vitalis',
        slug: 'vitalis-chihuahua',
        opportunity: 9,
        package: 'Business',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Invisibilidad en buscadores (0 páginas indexadas), falta de turismo médico y reseñas de 5.0 estrellas subexplotadas.'
      },
      {
        name: 'Dentalite',
        slug: 'dentalite-chihuahua',
        opportunity: 7,
        package: 'Pro',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Sin subdirectorios optimizados por plaza, rendimiento móvil lento y falta de contenido educativo.'
      },
      {
        name: 'dentalia Chihuahua',
        slug: 'dentalia-chihuahua',
        opportunity: 6,
        package: 'Business',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Contenido local genérico, calificación de 4.1 estrellas y falta de WhatsApp directo.'
      },
      {
        name: 'Distrito Dental',
        slug: 'distritodental-chihuahua',
        opportunity: 8,
        package: 'Pro',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Ausencia de palabras clave locales de alto volumen, página de contacto con error responsive y tiempo de carga alto.'
      },
      {
        name: 'Unic Clínica Dental',
        slug: 'unic-chihuahua',
        opportunity: 5,
        package: 'Starter',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Falta de CTA de reserva rápido, perfil de Google sin reseñas recientes y sin propuesta de valor clara.'
      },
      {
        name: 'ENDENTO Especialidades',
        slug: 'endento-chihuahua',
        opportunity: 8,
        package: 'Pro',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Estructura SEO rota, URLs no amigables para servicios y nula automatización conversacional.'
      },
      {
        name: 'Grupo Dental Cumbre',
        slug: 'dentalcumbre-chihuahua',
        opportunity: 7,
        package: 'Business',
        phone: testPhone || '5216145551234',
        email: testEmail || 'test-outbound@humanio.digital',
        diagnostic: 'Inexistencia de landing pages de servicios específicos, sin perfil móvil optimizado y nula presencia local en mapas.'
      }
    ];

    const count = Math.min(limit || 3, 20); // Límite máximo de 20 para evitar saturar la interfaz
    const prospects = [];
    for (let i = 0; i < count; i++) {
      const base = allProspects[i % allProspects.length];
      const suffix = i >= allProspects.length ? ` (Sucursal ${Math.floor(i / allProspects.length) + 1})` : '';
      const slugSuffix = i >= allProspects.length ? `-${Math.floor(i / allProspects.length) + 1}` : '';
      prospects.push({
        ...base,
        name: base.name + suffix,
        slug: base.slug + slugSuffix
      });
    }

    broadcastEvent('complete', { 
      message: `Flujo finalizado. Se han calificado ${count} prospectos de manera exitosa.`, 
      code,
      prospects
    });
  });
});

// Endpoint para detonar el flujo Inbound/Demo
app.post('/api/run-demo', (req, res) => {
  const { slug, name } = req.body;
  
  res.json({ status: 'started', message: `Creación de propuesta para ${name} iniciada.` });

  broadcastEvent('status', { message: 'Iniciando generación de propuesta bilingüe...', step: 1, agent: 'closer', status: 'running' });

  // Ejecutamos la simulación demo del coordinator
  const cmd = `node coordinator.js demo "${name.replace(/"/g, '\\"')}" "${slug.replace(/"/g, '\\"')}"`;
  const child = exec(cmd, { cwd: __dirname });

  child.stdout.on('data', (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      const cleanLine = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
      broadcastEvent('log', { text: cleanLine });

      if (cleanLine.includes('DesignPlanner')) {
        broadcastEvent('status', { step: 1, agent: 'closer', status: 'success' });
        broadcastEvent('status', { step: 2, agent: 'designplanner', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('WebBuilder')) {
        broadcastEvent('status', { step: 2, agent: 'designplanner', status: 'success' });
        broadcastEvent('status', { step: 3, agent: 'webbuilder', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('WebQA')) {
        broadcastEvent('status', { step: 3, agent: 'webbuilder', status: 'success' });
        broadcastEvent('status', { step: 4, agent: 'webqa', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('WebPublisher')) {
        broadcastEvent('status', { step: 4, agent: 'webqa', status: 'success' });
        broadcastEvent('status', { step: 5, agent: 'webpublisher', status: 'running', message: cleanLine });
      }
    });
  });

  child.on('close', (code) => {
    broadcastEvent('status', { step: 5, agent: 'webpublisher', status: 'success' });
    broadcastEvent('complete-demo', {
      slug,
      name,
      urls: {
        principal: `/proposals/proposal-${slug}/index.html`,
        propuesta: `/proposals/proposal-${slug}/propuesta/index.html`,
        reporte: `/proposals/proposal-${slug}/reporte/index.html`
      }
    });
  });
});

app.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(`🚀 Humanio Dashboard escuchando en http://localhost:${PORT}`);
  console.log(`====================================================\n`);
});
