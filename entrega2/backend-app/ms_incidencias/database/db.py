import os

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
os.makedirs(DB_DIR, exist_ok=True)
INCIDENCIAS_FILE = os.path.join(DB_DIR, "incidencias.txt")

def read_lines(filepath):
    if not os.path.exists(filepath):
        return []
    with open(filepath, "r", encoding="utf-8") as f:
        return [line.strip() for line in f.readlines() if line.strip()]

def write_lines(filepath, lines):
    with open(filepath, "w", encoding="utf-8") as f:
        for line in lines:
            f.write(line + "\n")

def clear_file(filepath):
    with open(filepath, "w", encoding="utf-8") as f:
        pass
