# Base image con Node.js
FROM node:20-bookworm-slim

# Instalar Python 3 y pip para ejecutar el SDK de Antigravity
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    python3-venv \
    && rm -rf /var/lib/apt/lists/*

# Crear un entorno virtual de Python e instalar las dependencias necesarias
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Instalar dependencias de Python del SDK de Antigravity
RUN pip3 install --no-cache-dir \
    google-antigravity \
    python-dotenv

# Crear directorio de la aplicación
WORKDIR /app

# Copiar archivos de dependencias de Node.js e instalar
COPY package*.json ./
RUN npm ci --only=production

# Copiar el resto del código del proyecto
COPY . .

# Exponer el puerto del servidor (Easypanel lo mapeará dinámicamente)
EXPOSE 4000

# Variables de entorno por defecto (se pueden sobrescribir en el panel de Easypanel)
ENV NODE_ENV=production
ENV PORT=4000

# Ejecutar el servidor web
CMD ["node", "server.js"]
