#!/usr/bin/env python3
"""
MPLAD-GUARD AI - Orchestration Runner
Launches both the FastAPI backend (port 8000) and the Next.js frontend (port 3000).
"""
import subprocess
import time
import sys
import os
import signal

def run():
    print("==========================================================")
    print("      MPLAD-GUARD AI — STARTING LOCAL APPLICATION")
    print("  Explainable AI-Powered Investigation Intelligence for MPLADS")
    print("==========================================================")
    
    base_dir = os.path.dirname(os.path.abspath(__file__))
    venv_python = os.path.join(base_dir, ".venv", "bin", "python")
    
    # 1. Start Backend
    print("[1/2] Starting FastAPI Backend on http://127.0.0.1:8000 ...")
    backend_proc = subprocess.Popen(
        [venv_python, "-m", "uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"],
        cwd=base_dir,
        env={**os.environ, "PYTHONPATH": base_dir}
    )
    
    # Wait 2 seconds for backend to start
    time.sleep(2)
    
    # 2. Start Frontend
    print("[2/2] Starting Next.js Frontend on http://localhost:3000 ...")
    frontend_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=os.path.join(base_dir, "frontend"),
        env=os.environ
    )
    
    print("\n----------------------------------------------------------")
    print("APPLICATION IS LIVE AND READY FOR LIVE DEMONSTRATION!")
    print("  - Frontend UI:  http://localhost:3000")
    print("  - Backend API:   http://127.0.0.1:8000/api/docs")
    print("  - Demo Login:    investigator@mpladguard.gov.in / admin123")
    print("  - Golden Case:   MPLAD-NAL-2023-042 (Nalanda, Bihar)")
    print("----------------------------------------------------------")
    print("Press Ctrl+C to stop both servers.\n")
    
    def signal_handler(sig, frame):
        print("\nStopping services...")
        backend_proc.terminate()
        frontend_proc.terminate()
        sys.exit(0)
        
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    run()
