// ============================================================================
// CYBER COURIER: MULTIPLAYER API & SECURE LEDGER PORTAL (server.go)
// ============================================================================

package main

import (
	"crypto/hmac"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"

	_ "://github.com"
)

// MatchResult structures incoming game score payloads
type MatchResult struct {
	Name  string `json:"name"`
	Score int    `json:"score"`
}

// LeaderboardRow templates records retrieved from local SQLite database layers
type LeaderboardRow struct {
	ID        int
	PlayerTag string
	MaxScore  int
	Timestamp string
}

var db *sql.DB

// Secret cryptographic token matching the frontend verification pipeline
const SecretVerificationKey = "CYBER_SECRET_KEY"

// verifyPayloadSignature checks incoming hash signatures against calculated hashes
func verifyPayloadSignature(playerTag string, score int, clientSignature string, secretKey string) bool {
	message := fmt.Sprintf("%s:%d", playerTag, score)
	hash := hmac.New(sha256.New, []byte(secretKey))
	hash.Write([]byte(message))
	expectedSignature := hex.EncodeToString(hash.Sum(nil))
	return hmac.Equal([]byte(clientSignature), []byte(expectedSignature))
}

// scoreHandler intercepts incoming REST API payloads to validate and commit scores
func scoreHandler(w http.ResponseWriter, r *http.Request) {
	// Enable Cross-Origin Resource Sharing (CORS) security exceptions
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, X-Payload-Signature")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusOK)
		return
	}

	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	clientSig := r.Header.Get("X-Payload-Signature")
	var res MatchResult
	if err := json.NewDecoder(r.Body).Decode(&res); err != nil {
		http.Error(w, "Malformed JSON request structure", http.StatusBadRequest)
		return
	}

	// ANTI-CHEAT CHECKPOINT: Enforce signature authorization evaluation
	if !verifyPayloadSignature(res.Name, res.Score, clientSig, SecretVerificationKey) {
		log.Printf("[ANTI-CHEAT ALERT] Dropped fraudulent submission signature from player tag: %s", res.Name)
		http.Error(w, "Unauthorized payload modification detected", http.StatusForbidden)
		return
	}

	// Generate linear distance calculations derived from score telemetry metrics
	calculatedDistance := float64(res.Score) / 10.0

	// Insert data parameters cleanly into local relational storage grids
	_, err := db.Exec(
		"INSERT INTO highscores (player_tag, max_score, distance_meters) VALUES (?, ?, ?)",
		res.Name, res.Score, calculatedDistance,
	)
	if err != nil {
		log.Printf("[SERVER ERROR] System write error inside tracking database: %v", err)
		http.Error(w, "Database verification engine failure", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// adminPortalHandler reads database telemetry logs and outputs the admin console view
func adminPortalHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, player_tag, max_score, timestamp FROM highscores ORDER BY max_score DESC LIMIT 50")
	if err != nil {
		http.Error(w, "Database collection read error", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var ledger []LeaderboardRow
	for rows.Next() {
		var row LeaderboardRow
		if err := rows.Scan(&row.ID, &row.PlayerTag, &row.MaxScore, &row.Timestamp); err == nil {
			ledger = append(ledger, row)
		}
	}

	// Dynamic system diagnostic dashboard HTML template configuration layout
	tmplSrc := `
	<!DOCTYPE html>
	<html lang="en">
	<head>
		<meta charset="UTF-8">
		<title>Courier Ledger Portal</title>
		<style>
			body { background: #050510; color: #00f0ff; font-family: monospace; padding: 40px; }
			h2 { color: #ff007f; letter-spacing: 2px; text-shadow: 0 0 10px #ff007f; }
			table { width: 100%; border-collapse: collapse; border: 2px solid #ff007f; margin-top: 20px; box-shadow: 0 0 15px rgba(255,0,127,0.2); }
			th, td { padding: 12px; border: 1px solid #ff007f; text-align: left; }
			th { background: #140526; color: #ff007f; text-transform: uppercase; }
			tr:nth-child(even) { background: rgba(0, 240, 255, 0.05); }
			tr:hover { background: rgba(255, 0, 127, 0.1); }
		</style>
	</head>
	<body>
		<h2>CYBER COURIER SYSTEM LEDGER -- ADMIN VIEW</h2>
		<table>
			<tr><th>ID</th><th>PLAYER TAG</th><th>SCORE RECORD</th><th>TIMESTAMP</th></tr>
			{{range .}}
			<tr><td>{{.ID}}</td><td>{{.PlayerTag}}</td><td>{{.MaxScore}}</td><td>{{.Timestamp}}</td></tr>
			{{end}}
		</table>
	</body>
	</html>`

	tmpl, err := template.New("portal").Parse(tmplSrc)
	if err != nil {
		http.Error(w, "Template processing engine initialization error", http.StatusInternalServerError)
		return
	}
	tmpl.Execute(w, ledger)
}

func main() {
	dbPath := "./leaderboard.db"

	// Validate baseline database environment binary presence prior to mounting server ports
	if _, err := os.Stat(dbPath); os.IsNotExist(err) {
		log.Fatalf("[CRITICAL ERROR] Execution stopped: '%s' not found. Execute 'python init_leaderboard.py' before running server processes.", dbPath)
	}

	var err error
	db, err = sql.Open("sqlite3", dbPath)
	if err != nil {
		log.Fatalf("[DATABASE ERROR] Database allocation sequence aborted: %v", err)
	}
	defer db.Close()

	if err := db.Ping(); err != nil {
		log.Fatalf("[INTEGRITY ERROR] Connected database engine instance failed connection testing: %v", err)
	}

	http.HandleFunc("/api/score", scoreHandler)
	http.HandleFunc("/admin", adminPortalHandler)

	fmt.Println("==================================================================")
	fmt.Println("CYBER COURIER ROUTER SYSTEM HARDENED OPERATIONAL SERVER")
	fmt.Println("==================================================================")
	fmt.Println("-> REST API Endpoint Vector        : http://localhost:8080/api/score")
	fmt.Println("-> Ledger Admin Monitoring Panel  : http://localhost:8080/admin")
	fmt.Println("==================================================================")

	if err := http.ListenAndServe(":8080", nil); err != nil {
		log.Fatalf("[NETWORK ERROR] Local network host loop adapter socket binding failed: %v", err)
	}
}
