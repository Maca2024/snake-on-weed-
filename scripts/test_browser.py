"""Start an isolated local server, run browser checks, then stop it.
Requires: pip install playwright && python -m playwright install chromium
"""
import os
import socket
import subprocess
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parents[1]
with socket.socket() as probe:
    probe.bind(("127.0.0.1", 0))
    port = probe.getsockname()[1]
os.environ["SOW_TEST_URL"] = f"http://127.0.0.1:{port}"
server = subprocess.Popen(
    [sys.executable, "-m", "http.server", str(port), "--bind", "127.0.0.1"],
    cwd=root, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
)
try:
    for _ in range(100):
        with socket.socket() as probe:
            if probe.connect_ex(("127.0.0.1", port)) == 0:
                break
        if server.poll() is not None:
            raise RuntimeError("Test server exited before it became ready")
        time.sleep(0.1)
    else:
        raise RuntimeError("Test server did not become ready")
    raise SystemExit(subprocess.call([sys.executable, "scripts/browser_test.py"], cwd=root))
finally:
    server.terminate()
    try:
        server.wait(timeout=5)
    except subprocess.TimeoutExpired:
        server.kill()
        server.wait()
