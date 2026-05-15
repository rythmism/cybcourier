# ============================================================================
# CYBER COURIER: NON-BLOCKING ONLINE BACKUP SYSTEM (backup_ledger.py)
# ============================================================================

import sqlite3
from datetime import datetime
import os
import time

def execute_safe_database_vacuum_backup():
    source_db = "./leaderboard.db"
    backup_directory = "../backups"
    
    # Secure target directory mapping dependencies
    if not os.path.exists(backup_directory):
        os.makedirs(backup_directory)
        
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    destination_db = os.path.join(backup_directory, f"backup_ledger_{timestamp}.db")
    
    if not os.path.exists(source_db):
        print(f"[ERROR] Source tracking target file missing: '{source_db}'")
        return

    try:
        print(f"[{datetime.now().strftime('%H:%M:%S')}] Snapping database snapshot matrix...")
        
        # Open connections to both target allocation layers
        source_connection = sqlite3.connect(source_db)
        backup_connection = sqlite3.connect(destination_db)
        
        # Deploy non-blocking streaming data copy routines
        with backup_connection:
            source_connection.backup(backup_connection)
            
        backup_connection.close()
        source_connection.close()
        
        print(f"[SUCCESS] Isolated runtime shadow checkpoint generated: {destination_db}")
        
    except Exception as error:
        print(f"[CRITICAL] Database snapshot generation terminated abruptly: {error}")

if __name__ == "__main__":
    print("==================================================================")
    print("CYBER COURIER BACKGROUND DATABASE DATA ROTATION WORKER")
    print("==================================================================")
    
    try:
        while True:
            execute_safe_database_vacuum_backup()
            print("Worker engine thread entering standby state. Awaiting next hour cycle...")
            print("-" * 66)
            time.sleep(3600) # Wait exactly 60 minutes between automated structural sync frames
    except KeyboardInterrupt:
        print("\nBackup engine background daemon terminated via user signal request.")

