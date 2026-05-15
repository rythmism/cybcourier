# Stage 1: Build the backend binary executable
FROM golang:1.22-alpine AS builder
RUN apk add --no-cache gcc musl-dev sqlite-dev
WORKDIR /app
COPY . .
RUN go mod init cyber-courier-backend && go mod tidy
RUN CGO_ENABLED=1 GOOS=linux go build -o courier-server server.go

# Stage 2: Create highly-optimized slim distribution environment
FROM alpine:3.19
RUN apk add --no-cache sqlite-libs ca-certificates
WORKDIR /root/
COPY --from=builder /app/courier-server .
# Pull static assets into root context spaces
COPY backend/leaderboard.db .
COPY frontend/ ./frontend/
EXPOSE 8080
CMD ["./courier-server"]
