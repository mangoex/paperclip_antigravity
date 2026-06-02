import sys
import os
import subprocess
import time
import socket

# Intentar importar pywebview, avisar si falta e intentar instalarlo
try:
    import webview
except ImportError:
    print("⚠️  pywebview no está instalado. Instalando pywebview a través de pip...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "pywebview"])
        import webview
        print("✓ pywebview instalado con éxito.")
    except Exception as e:
        print(f"❌ Error al instalar pywebview automáticamente: {e}")
        print("Por favor, ejecuta: pip install pywebview")
        sys.exit(1)

def is_port_open(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 1. Detener procesos previos que usen el puerto 4000 (limpieza)
    print("Limpiando puertos anteriores...")
    if sys.platform != "win32":
        try:
            # Encontrar el PID usando lsof y matarlo
            pid_str = subprocess.check_output(["lsof", "-t", "-i:4000"], text=True).strip()
            if pid_str:
                for pid in pid_str.split():
                    print(f"Deteniendo proceso previo en puerto 4000 (PID: {pid})")
                    os.kill(int(pid), 9)
                time.sleep(0.5)
        except Exception:
            pass

    # 2. Iniciar el servidor Express en segundo plano
    print("🚀 Iniciando servidor backend de Humanio (node server.js)...")
    server_process = subprocess.Popen(
        ['node', 'server.js'],
        cwd=script_dir,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # 3. Esperar a que el puerto 4000 esté disponible
    print("Esperando a que el puerto 4000 responda...")
    server_ready = False
    for _ in range(50):
        if is_port_open(4000):
            server_ready = True
            break
        # Verificar si el servidor falló de inmediato
        if server_process.poll() is not None:
            stdout, stderr = server_process.communicate()
            print(f"❌ El servidor falló al iniciar:\nSTDOUT:\n{stdout}\nSTDERR:\n{stderr}")
            sys.exit(1)
        time.sleep(0.1)
        
    if server_ready:
        print("✓ Servidor Express listo en http://localhost:4000")
    else:
        print("⚠️ El puerto 4000 tardó demasiado en responder, abriendo la interfaz de todos modos...")

    # 4. Lanzar la ventana nativa de pywebview
    try:
        print("🖥️  Abriendo ventana de aplicación de escritorio...")
        webview.create_window(
            title="Humanio — Control de Orquestación de Agentes",
            url="http://localhost:4000",
            width=1366,
            height=850,
            resizable=True,
            background_color="#030812"
        )
        webview.start()
    except Exception as e:
        print(f"❌ Error al iniciar pywebview: {e}")
    finally:
        # 5. Cerrar limpiamente el servidor al salir
        print("🔌 Cerrando el servidor backend...")
        server_process.terminate()
        try:
            server_process.wait(timeout=2)
        except subprocess.TimeoutExpired:
            server_process.kill()
        print("✓ Aplicación cerrada de forma segura.")

if __name__ == '__main__':
    main()
