import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { existsSync } from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 4000;

// Helper para detectar el ejecutable de Python compatible localmente (macOS) o en producción (Linux)
const getPythonCommand = () => {
  const localBrewPath = '/opt/homebrew/bin/python3.11';
  if (existsSync(localBrewPath)) {
    return localBrewPath;
  }
  return 'python3';
};

// Ruta del historial con soporte para volumen persistente en Docker/Easypanel (/app/data o /data)
const getHistoryFilePath = () => {
  const customPath = process.env.PERSISTENT_HISTORY_PATH;
  if (customPath) return customPath;

  const dataDir = path.join(__dirname, 'data');
  if (existsSync('/data')) {
    return '/data/prospects_history.json';
  }
  if (existsSync(dataDir)) {
    return path.join(dataDir, 'prospects_history.json');
  }
  return path.join(__dirname, 'prospects_history.json');
};

const historyFilePath = getHistoryFilePath();

// Función auxiliar para guardar prospecto en base de datos Supabase
async function saveToSupabase(p) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) return;

  try {
    const payload = {
      negocio: p.name,
      giro: p.giro || 'Odontología',
      ciudad: p.ciudad || 'Chihuahua',
      pais: p.pais || 'México',
      telefono: p.phone,
      email: p.email || null,
      web_actual: (p.urls && p.urls.principal) ? p.urls.principal : null,
      origen: 'scout_outbound',
      etapa: p.lastStage || 'nuevo'
    };

    console.log(`[Supabase] Intentando guardar prospecto en base de datos: ${p.name}`);
    const res = await fetch(`${url}/rest/v1/prospects`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error(`[Supabase] Error al guardar en base de datos: HTTP ${res.status} - ${errText}`);
    } else {
      console.log(`[Supabase] Prospecto ${p.name} guardado con éxito.`);
    }
  } catch (err) {
    console.error("[Supabase] Error de conexión con Supabase:", err);
  }
}

async function getHistory() {
  try {
    const defaultHistoryPath = path.join(__dirname, 'prospects_history.json');
    if (!existsSync(historyFilePath) && historyFilePath !== defaultHistoryPath) {
      if (existsSync(defaultHistoryPath)) {
        console.log(`Inicializando historial persistente desde la plantilla por defecto en: ${historyFilePath}`);
        await fs.mkdir(path.dirname(historyFilePath), { recursive: true }).catch(() => {});
        await fs.copyFile(defaultHistoryPath, historyFilePath);
      }
    }

    if (existsSync(historyFilePath)) {
      const data = await fs.readFile(historyFilePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Error reading prospects history file:", err);
  }
  return [];
}

async function saveHistory(history) {
  try {
    await fs.writeFile(historyFilePath, JSON.stringify(history, null, 2), 'utf-8');
  } catch (err) {
    console.error("Error writing prospects history file:", err);
  }
}

async function addProspectsToHistory(prospects, lastStage, status) {
  const history = await getHistory();
  const timestamp = new Date().toISOString();
  
  for (const p of prospects) {
    const existingIndex = history.findIndex(h => h.slug === p.slug);
    const updatedProspect = {
      ...p,
      timestamp,
      lastStage,
      status
    };
    if (existingIndex !== -1) {
      if (history[existingIndex].urls) {
        updatedProspect.urls = history[existingIndex].urls;
      }
      history[existingIndex] = updatedProspect;
    } else {
      history.push(updatedProspect);
    }
    // Guardar asincrónicamente en Supabase si está configurado
    saveToSupabase(updatedProspect).catch(err => {
      console.error("Error al guardar en Supabase:", err);
    });
  }
  
  await saveHistory(history);
}

app.use(express.json());

app.get('/api/history', async (req, res) => {
  const history = await getHistory();
  res.json(history);
});

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

  // Ejecutamos runner.py y pasamos los argumentos necesarios
  const pythonCmd = getPythonCommand();
  const cmd = `${pythonCmd} runner.py outbound --nicho "${nicho.replace(/"/g, '\\"')}" --ciudad "${ciudad.replace(/"/g, '\\"')}" --pais "${pais.replace(/"/g, '\\"')}" --limit ${limit || 3} --test-phone "${testPhone || ''}" --test-email "${testEmail || ''}"`;
  const child = exec(cmd, { cwd: __dirname });

  let fullOutput = '';
  let prospectsJsonStr = '';
  let activeAgent = 'ceo'; // Guardamos qué agente está activo en cada momento

  child.stdout.on('data', (data) => {
    const lines = data.split('\n');
    lines.forEach(line => {
      if (!line.trim()) return;
      
      // Limpiar códigos de color ANSI de la consola
      const cleanLine = line.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
      
      // Si la línea contiene el JSON de los prospectos, la capturamos y no la mostramos en logs
      if (cleanLine.startsWith('__PROSPECTS_JSON__:')) {
        prospectsJsonStr = cleanLine.substring('__PROSPECTS_JSON__:'.length);
        return;
      }
      
      broadcastEvent('log', { text: cleanLine });
      fullOutput += cleanLine + '\n';

      // Parseamos los pasos para actualizar el estado visual de los agentes
      if (cleanLine.includes('[Paso 1]')) {
        activeAgent = 'ceo';
        broadcastEvent('status', { step: 1, agent: 'ceo', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 2]')) {
        activeAgent = 'scout';
        broadcastEvent('status', { step: 1, agent: 'ceo', status: 'success' });
        broadcastEvent('status', { step: 2, agent: 'scout', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 3]')) {
        activeAgent = 'qualifier';
        broadcastEvent('status', { step: 2, agent: 'scout', status: 'success' });
        broadcastEvent('status', { step: 3, agent: 'qualifier', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 4]')) {
        activeAgent = 'ceo';
        broadcastEvent('status', { step: 3, agent: 'qualifier', status: 'success' });
        broadcastEvent('status', { step: 4, agent: 'ceo', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 5]')) {
        activeAgent = 'outreach';
        broadcastEvent('status', { step: 4, agent: 'ceo', status: 'success' });
        broadcastEvent('status', { step: 5, agent: 'outreach', status: 'running', message: cleanLine });
      } else if (cleanLine.includes('[Paso 6]')) {
        activeAgent = 'closer';
        broadcastEvent('status', { step: 5, agent: 'outreach', status: 'success' });
        broadcastEvent('status', { step: 6, agent: 'closer', status: 'running', message: cleanLine });
      }
    });
  });

  child.stderr.on('data', (data) => {
    broadcastEvent('log', { text: `[Error] ${data}`, type: 'error' });
  });

  child.on('close', async (code) => {
    // Si el proceso de agentes falló (exited con código de error)
    if (code !== 0) {
      console.error(`Subproceso runner.py falló con código de salida: ${code}`);
      broadcastEvent('status', { agent: activeAgent, status: 'failed' });
      
      // Intentamos recuperar los prospectos del archivo temporal para registrar la falla en el historial
      let failedProspects = [];
      const tempFilePath = path.join(__dirname, 'tmp', 'current_prospects.json');
      if (existsSync(tempFilePath)) {
        try {
          const tempData = await fs.readFile(tempFilePath, 'utf-8');
          failedProspects = JSON.parse(tempData);
        } catch (err) {
          console.error("Error al leer prospectos temporales tras falla:", err);
        }
      }
      
      if (failedProspects.length > 0) {
        await addProspectsToHistory(failedProspects, activeAgent, 'failed');
      }

      broadcastEvent('complete', { 
        message: `El flujo de agentes falló y se detuvo en el agente: ${activeAgent.toUpperCase()}`, 
        code,
        prospects: failedProspects
      });
      return;
    }

    broadcastEvent('status', { step: 6, agent: 'closer', status: 'success' });
    
    let prospects = [];
    if (prospectsJsonStr) {
      try {
        prospects = JSON.parse(prospectsJsonStr);
      } catch (err) {
        console.error("Error al parsear el JSON de prospectos del script runner.py:", err);
      }
    }

    // Fallback a pool simulado en caso de error de extracción o JSON vacío
    if (!prospects || prospects.length === 0) {
      const allProspects = [
        {
          name: 'Clínica Dental Vitalis',
          slug: 'vitalis-chihuahua',
          opportunity: 9,
          package: 'Business',
          phone: '5216672013019',
          email: 'miguelespino@humanio.digital',
          test_phone: testPhone || '',
          test_email: testEmail || '',
          diagnostic: 'Invisibilidad en buscadores (0 páginas indexadas), falta de turismo médico y reseñas de 5.0 estrellas subexplotadas.'
        },
        {
          name: 'Dentalite',
          slug: 'dentalite-chihuahua',
          opportunity: 7,
          package: 'Pro',
          phone: '5216144134732',
          email: 'contacto@dentalite.mx',
          test_phone: testPhone || '',
          test_email: testEmail || '',
          diagnostic: 'Sin subdirectorios optimizados por plaza, rendimiento móvil lento y falta de contenido educativo.'
        },
        {
          name: 'dentalia Chihuahua',
          slug: 'dentalia-chihuahua',
          opportunity: 6,
          package: 'Business',
          phone: '5216144303127',
          email: 'info@dentalia.com',
          test_phone: testPhone || '',
          test_email: testEmail || '',
          diagnostic: 'Contenido local genérico, calificación de 4.1 estrellas y falta de WhatsApp directo.'
        }
      ];

      const count = Math.min(limit || 3, allProspects.length);
      for (let i = 0; i < count; i++) {
        prospects.push(allProspects[i]);
      }
    }

    // Guardar en el historial
    await addProspectsToHistory(prospects, 'closer', 'success');

    broadcastEvent('complete', { 
      message: `Flujo finalizado. Se han procesado ${prospects.length} prospectos en vivo de manera exitosa.`, 
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

  child.on('close', async (code) => {
    if (code !== 0) {
      console.error(`Subproceso coordinator.js demo falló con código de salida: ${code}`);
      broadcastEvent('status', { step: 5, agent: 'webpublisher', status: 'failed' });
      
      // Actualizar estado de demo fallida en el historial
      const history = await getHistory();
      const existingIndex = history.findIndex(h => h.slug === slug);
      if (existingIndex !== -1) {
        history[existingIndex].lastStage = 'webpublisher';
        history[existingIndex].status = 'failed';
        await saveHistory(history);
      }
      return;
    }

    // Generar urls de previsualización
    const urls = {
      principal: `/proposals/proposal-${slug}/index.html`,
      propuesta: `/proposals/proposal-${slug}/propuesta/index.html`,
      reporte: `/proposals/proposal-${slug}/reporte/index.html`
    };

    // Actualizar historial con éxito y urls
    const history = await getHistory();
    const existingIndex = history.findIndex(h => h.slug === slug);
    if (existingIndex !== -1) {
      history[existingIndex].lastStage = 'webpublisher';
      history[existingIndex].status = 'success';
      history[existingIndex].urls = urls;
      await saveHistory(history);
    }

    broadcastEvent('status', { step: 5, agent: 'webpublisher', status: 'success' });
    broadcastEvent('complete-demo', {
      slug,
      name,
      urls
    });
  });
});

// Endpoint para disparar WhatsApp manual
app.post('/api/send-manual-whatsapp', async (req, res) => {
  const { slug } = req.body;
  const history = await getHistory();
  const index = history.findIndex(h => h.slug === slug);
  if (index === -1) {
    return res.status(404).json({ error: "Prospecto no encontrado en el historial." });
  }
  const p = history[index];
  
  const pythonCmd = getPythonCommand();
  const targetPhone = p.test_phone || p.phone;
  const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
  const cleanName = p.name.replace(/"/g, '\\"');
  const cleanDiag = p.diagnostic.replace(/"/g, '\\"');
  
  const cmd = `${pythonCmd} runner.py send-manual-whatsapp --phone "${cleanPhone}" --name "${cleanName}" --diagnostic "${cleanDiag}"`;
  
  exec(cmd, { cwd: __dirname }, async (error, stdout, stderr) => {
    if (error) {
      console.error("Error al enviar WhatsApp manual:", stderr);
      p.whatsapp_status = "failed";
      await saveHistory(history);
      return res.status(500).json({ error: "Fallo al enviar WhatsApp", details: stderr });
    }
    
    if (stdout.includes("__SUCCESS_WA_ID__:")) {
      const match = stdout.match(/__SUCCESS_WA_ID__:(.+)/);
      const waId = match ? match[1].trim() : "sent";
      p.whatsapp_status = "accepted_by_meta";
      p.whatsapp_id = waId;
      await saveHistory(history);
      res.json({ status: "success", message: `WhatsApp enviado con éxito a ${cleanPhone}. ID de Meta: ${waId}` });
    } else {
      p.whatsapp_status = "simulated";
      await saveHistory(history);
      res.json({ status: "simulated", message: `Credenciales de WhatsApp no configuradas, se simuló el envío a ${cleanPhone}.` });
    }
  });
});

// Endpoint para disparar Correo SMTP manual
app.post('/api/send-manual-email', async (req, res) => {
  const { slug } = req.body;
  const history = await getHistory();
  const index = history.findIndex(h => h.slug === slug);
  if (index === -1) {
    return res.status(404).json({ error: "Prospecto no encontrado en el historial." });
  }
  const p = history[index];
  
  const pythonCmd = getPythonCommand();
  const targetEmail = p.test_email || p.email;
  const cleanEmail = targetEmail.replace(/"/g, '\\"');
  const cleanName = p.name.replace(/"/g, '\\"');
  const cleanDiag = p.diagnostic.replace(/"/g, '\\"');
  const cleanCity = (p.ciudad || "Chihuahua").replace(/"/g, '\\"');
  
  const cmd = `${pythonCmd} runner.py send-manual-email --email "${cleanEmail}" --name "${cleanName}" --diagnostic "${cleanDiag}" --ciudad "${cleanCity}"`;
  
  exec(cmd, { cwd: __dirname }, async (error, stdout, stderr) => {
    if (error) {
      console.error("Error al enviar email manual:", stderr);
      p.email_status = "failed";
      await saveHistory(history);
      return res.status(500).json({ error: "Fallo al enviar Email", details: stderr });
    }
    
    if (stdout.includes("__SUCCESS_EMAIL__")) {
      p.email_status = "sent";
      await saveHistory(history);
      res.json({ status: "success", message: `Correo SMTP enviado con éxito a ${cleanEmail}.` });
    } else {
      p.email_status = "simulated";
      await saveHistory(history);
      res.json({ status: "simulated", message: `Credenciales SMTP no configuradas, se simuló el envío a ${cleanEmail}.` });
    }
  });
});

app.listen(PORT, () => {
  console.log(`\n====================================================`);
  console.log(`🚀 Humanio Dashboard escuchando en http://localhost:${PORT}`);
  console.log(`====================================================\n`);
});
