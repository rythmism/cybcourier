# ============================================================================
# CYBER COURIER: RETRO HIGH-SCORE SQLITE LAYER INITIALIZER (init_leaderboard.py)
# ============================================================================

import sqlite3
import os

def setup_mock_database():
    database_name = "leaderboard.db"
    
    # Remove existing database file if a clean reset is ever required
    if os.path.exists(database_name):
        print(f"Existing tracking ledger '{database_name}' found. Overwriting...")
        try:
            os.remove(database_name)
        except PermissionError:
            print("Error: Database file is currently locked by a running process.")
            return

    connection = sqlite3.connect(database_name)
    cursor = connection.cursor()

    print("Configuring local relational storage schemas...")
    
    # Create arcade record schemas matching game telemetry requirements
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS highscores (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            player_tag TEXT NOT NULL,
            max_score INTEGER NOT NULL,
            distance_meters REAL NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # Baseline seed data to simulate historical arcade cabinet rankings
    mock_records = [
        ('NEO', 95400, 4820.5),
        ('CTR', 84120, 3910.2),
        ('VLT', 72000, 3100.8),
        ('SLK', 55300, 2450.1),
        ('RUN', 32000, 1200.0)
    ]

    print("Injecting system baseline leaderboard entries...")
    cursor.executemany("""
        INSERT INTO highscores (player_tag, max_score, distance_meters) 
        VALUES (?, ?, ?)
    """, mock_records)

    connection.commit()
    print(f"\n[SUCCESS] Relational storage matrix deployed as '{database_name}'.")
    
    # Verify records were added successfully
    print("-" * 65)
    print(f"{'RANK':<6} | {'TAG':<10} | {'SCORE':<12} | {'DISTANCE':<12}")
    print("-" * 65)
    
    cursor.execute("SELECT player_tag, max_score, distance_meters FROM highscores ORDER BY max_score DESC")
    for index, row in enumerate(cursor.fetchall(), start=1):
        print(f"#{index:<5} | {row[0]:<10} | {row[1]:<12} | {row[2]:<11}m")
        
    print("-" * 65)
    connection.close()

if __name__ == "__main__":
    setup_mock_database()

