# ============================================================================
# CYBER COURIER: PERSISTENT BINARY ENVIRONMENT INITIALIZER (generate_db.py)
# ============================================================================

import sqlite3
import os

SQL_SCHEMA_BLUEPRINT = """
CREATE TABLE IF NOT EXISTS highscores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_tag TEXT NOT NULL,
    max_score INTEGER NOT NULL,
    distance_meters REAL NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
"""

MOCK_RECORDS = [
    ('NEO', 95400, 4820.5),
    ('CTR', 84120, 3910.2),
    ('VLT', 72000, 3100.8),
    ('SLK', 55300, 2450.1),
    ('RUN', 32000, 1200.0)
]

def build_binary_file():
    db_filename = "leaderboard.db"
    
    if os.path.exists(db_filename):
        print(f"[WARN] Local database artifact targets found at '{db_filename}'. Dropping files...")
        try:
            os.remove(db_filename)
        except PermissionError:
            print("[CRITICAL] Operational permission error: Database file currently locked by active application loop.")
            return

    print(f"Allocating local SQLite structural footprint file headers for '{db_filename}'...")
    
    try:
        # Open clean write channel vector blocks into binary structures
        connection = sqlite3.connect(db_filename)
        cursor = connection.cursor()
        
        # Compile raw layout matrices 
        cursor.executescript(SQL_SCHEMA_BLUEPRINT)
        
        # Inject standard seed logs
        cursor.executemany("""
            INSERT INTO highscores (player_tag, max_score, distance_meters) 
            VALUES (?, ?, ?)
        """, MOCK_RECORDS)
        
        connection.commit()
        connection.close()
        print(f"[SUCCESS] Binary structural formatting completed. '{db_filename}' populated and stable.")
        
    except Exception as error:
        print(f"[ERROR] Failed initializing environment structure array maps: {error}")

if __name__ == "__main__":
    build_binary_file()

