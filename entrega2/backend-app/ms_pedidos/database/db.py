import os
from filelock import FileLock

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DB_DIR, exist_ok=True)
PEDIDOS_FILE = os.path.join(DB_DIR, "pedidos.txt")

def read_lines(filepath):
    if not os.path.exists(filepath):
        return []
    lock = FileLock(f"{filepath}.lock")
    with lock:
        with open(filepath, "r", encoding="utf-8") as f:
            return [line.strip() for line in f.readlines() if line.strip()]

def write_lines(filepath, lines):
    lock = FileLock(f"{filepath}.lock")
    with lock:
        with open(filepath, "w", encoding="utf-8") as f:
            for line in lines:
                f.write(line + "\n")

def clear_file(filepath):
    lock = FileLock(f"{filepath}.lock")
    with lock:
        with open(filepath, "w", encoding="utf-8") as f:
            pass
