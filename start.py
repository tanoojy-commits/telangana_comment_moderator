import subprocess
import os
import sys
import time
import threading

# Get absolute paths for the directories
base_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(base_dir, 'backend')
frontend_dir = os.path.join(base_dir, 'frontend')

def print_banner():
    print("=" * 65)
    print("  TELANGANA TODAY -- AI COMMENT MODERATION SYSTEM LAUNCHER  ")
    print("=" * 65)

def log_message(prefix, message):
    timestamp = time.strftime("%H:%M:%S")
    # Clean output to remove any non-ASCII characters to avoid CP1252 errors on Windows
    clean_msg = message.encode('ascii', errors='replace').decode('ascii')
    print(f"[{timestamp}] [{prefix}] {clean_msg.strip()}")

def pipe_output(stream, prefix):
    for line in iter(stream.readline, b''):
        if line:
            log_message(prefix, line.decode('utf-8', errors='ignore'))
    stream.close()

def setup_backend():
    log_message("SETUP-BACKEND", "Checking backend python dependencies...")
    try:
        subprocess.check_call(
            [sys.executable, "-m", "pip", "install", "-r", "requirements.txt"],
            cwd=backend_dir,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL
        )
        log_message("SETUP-BACKEND", "[SUCCESS] Backend packages installed/verified.")
    except Exception as e:
        log_message("SETUP-BACKEND", f"[ERROR] Error running pip install: {e}")

def setup_frontend():
    node_modules_path = os.path.join(frontend_dir, 'node_modules')
    if not os.path.exists(node_modules_path):
        log_message("SETUP-FRONTEND", "node_modules not found. Running npm install (this may take a minute)...")
        try:
            # Run npm install
            process = subprocess.Popen(
                "npm install",
                cwd=frontend_dir,
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
            # Stream npm install output
            for line in iter(process.stdout.readline, b''):
                log_message("SETUP-FRONTEND", line.decode('utf-8', errors='ignore'))
            process.stdout.close()
            process.wait()
            log_message("SETUP-FRONTEND", "[SUCCESS] NPM packages installed successfully.")
        except Exception as e:
            log_message("SETUP-FRONTEND", f"[ERROR] Error running npm install: {e}")
    else:
        log_message("SETUP-FRONTEND", "[SUCCESS] node_modules folder detected. Skipping npm install.")

def main():
    print_banner()
    
    # 1. Setup
    setup_backend()
    setup_frontend()
    
    # 2. Start Servers
    backend_proc = None
    frontend_proc = None
    
    try:
        # Start Backend (Flask)
        log_message("LAUNCHER", "Starting Flask backend on http://localhost:5000...")
        backend_proc = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=backend_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Start threads to stream stdout/stderr
        threading.Thread(target=pipe_output, args=(backend_proc.stdout, "BACKEND-API"), daemon=True).start()
        threading.Thread(target=pipe_output, args=(backend_proc.stderr, "BACKEND-ERR"), daemon=True).start()
        
        # Start Frontend (Vite)
        log_message("LAUNCHER", "Starting Vite frontend on http://localhost:5173...")
        frontend_proc = subprocess.Popen(
            "npm run dev",
            cwd=frontend_dir,
            shell=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        threading.Thread(target=pipe_output, args=(frontend_proc.stdout, "FRONTEND-UI"), daemon=True).start()
        threading.Thread(target=pipe_output, args=(frontend_proc.stderr, "FRONTEND-ERR"), daemon=True).start()
        
        log_message("LAUNCHER", "[SUCCESS] Both servers are now running in parallel!")
        log_message("LAUNCHER", "--> Open your browser at: http://localhost:5173")
        log_message("LAUNCHER", "Press Ctrl+C to terminate both servers.")
        
        # Keep launcher script running
        while True:
            time.sleep(1)
            
            # Check if processes crashed
            if backend_proc.poll() is not None:
                log_message("LAUNCHER", "[CRITICAL] Backend process terminated unexpectedly!")
                break
            if frontend_proc.poll() is not None:
                log_message("LAUNCHER", "[CRITICAL] Frontend process terminated unexpectedly!")
                break
                
    except KeyboardInterrupt:
        log_message("LAUNCHER", "Shutting down servers...")
    finally:
        # 3. Clean Shutdown
        if backend_proc:
            backend_proc.terminate()
            backend_proc.wait()
            log_message("LAUNCHER", "Backend process terminated.")
        if frontend_proc:
            frontend_proc.terminate()
            frontend_proc.wait()
            log_message("LAUNCHER", "Frontend process terminated.")
        log_message("LAUNCHER", "Done. Goodbye!")

if __name__ == '__main__':
    main()
