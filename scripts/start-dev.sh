#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND="$ROOT/src/backend"
ANGULAR="$ROOT/src/angular"
ENV_FILE="$ROOT/.env.codespace"
API_PID=""
ANGULAR_PID=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM
  if [[ -n "$ANGULAR_PID" ]] && kill -0 "$ANGULAR_PID" 2>/dev/null; then
    kill "$ANGULAR_PID" 2>/dev/null || true
    wait "$ANGULAR_PID" 2>/dev/null || true
  fi
  if [[ -n "$API_PID" ]] && kill -0 "$API_PID" 2>/dev/null; then
    kill "$API_PID" 2>/dev/null || true
    wait "$API_PID" 2>/dev/null || true
  fi
  exit "$exit_code"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

if [[ ! -r "$ENV_FILE" ]]; then
  echo "Arquivo .env.codespace ausente ou sem leitura em $ROOT." >&2
  exit 1
fi

for command_name in curl java mvn node npm docker; do
  if ! command -v "$command_name" >/dev/null 2>&1; then
    echo "Pré-requisito ausente: '$command_name'. Instale-o no Codespace e tente novamente." >&2
    exit 1
  fi
done

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose precisa estar disponível neste Codespace." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ ! -x "$ANGULAR/node_modules/.bin/ng" ]]; then
  echo "Instalando dependências Angular..."
  npm --prefix "$ANGULAR" install --legacy-peer-deps --no-package-lock
fi

echo "Iniciando MySQL..."
docker compose --env-file "$ENV_FILE" -f "$BACKEND/compose.yaml" up -d --wait mysql

echo "Iniciando API Spring Boot..."
(
  cd "$BACKEND"
  exec mvn spring-boot:run
) &
API_PID=$!

api_ready=false
for _ in $(seq 1 180); do
  if ! kill -0 "$API_PID" 2>/dev/null; then
    echo "A API encerrou antes de ficar disponível." >&2
    wait "$API_PID" || true
    exit 1
  fi
  if curl --fail --silent --show-error --max-time 2 http://127.0.0.1:8080/api/v1/produtos >/dev/null 2>&1; then
    api_ready=true
    break
  fi
  sleep 2
done

if [[ "$api_ready" != true ]]; then
  echo "A API não respondeu em http://127.0.0.1:8080 após 6 minutos." >&2
  exit 1
fi

echo "Aplicando dados demonstrativos..."
docker compose --env-file "$ENV_FILE" -f "$BACKEND/compose.yaml" exec -T mysql \
  sh -c 'exec mysql -uroot -p"$MYSQL_ROOT_PASSWORD"' < "$BACKEND/data/demo-seed.sql"

echo "Iniciando Angular..."
(
  cd "$ANGULAR"
  exec node ./node_modules/@angular/cli/bin/ng.js serve --host 0.0.0.0
) &
ANGULAR_PID=$!

angular_ready=false
for _ in $(seq 1 450); do
  if ! kill -0 "$ANGULAR_PID" 2>/dev/null; then
    echo "O servidor Angular encerrou antes de ficar disponível." >&2
    wait "$ANGULAR_PID" || true
    exit 1
  fi
  if curl --fail --silent --max-time 2 http://127.0.0.1:4200/ >/dev/null 2>&1; then
    angular_ready=true
    break
  fi
  sleep 2
done

if [[ "$angular_ready" != true ]]; then
  echo "O Angular não respondeu em http://127.0.0.1:4200 após 15 minutos." >&2
  exit 1
fi

echo
echo "DaHorta está no ar:"
if [[ -n "${CODESPACE_NAME:-}" ]]; then
  echo "Frontend: https://${CODESPACE_NAME}-4200.app.github.dev"
  echo "API:      https://${CODESPACE_NAME}-8080.app.github.dev"
else
  echo "Frontend: http://localhost:4200"
  echo "API:      http://localhost:8080"
fi
echo "Pressione Ctrl+C para parar API e frontend. O MySQL permanece no Docker Compose."

wait "$ANGULAR_PID"
