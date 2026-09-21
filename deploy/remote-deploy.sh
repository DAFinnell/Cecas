#!/usr/bin/env bash

set -euo pipefail
set +x
umask 077

readonly APP_ROOT="/opt/cecas"
readonly RELEASES_DIR="${APP_ROOT}/releases"
readonly RUNTIME_ENV="${APP_ROOT}/runtime.env"
readonly RUNTIME_ROLLBACK_FILE="${APP_ROOT}/.runtime.env.rollback"
readonly CURRENT_LINK="${APP_ROOT}/current"
readonly PREVIOUS_LINK="${APP_ROOT}/previous"
readonly CURRENT_RELEASE_FILE="${APP_ROOT}/current-release"
readonly LOCK_FILE="${APP_ROOT}/deploy.lock"

readonly AWS_REGION="us-east-2"
readonly PUBLIC_HOST="cecas.dafinnell.com"
readonly COMPOSE_WAIT_SECONDS=420
readonly SMOKE_ATTEMPTS=30
readonly SMOKE_DELAY_SECONDS=10

export AWS_DEFAULT_REGION="${AWS_REGION}"
export AWS_PAGER=""

if [[ "$#" -ne 3 ]]; then
  echo "Usage: remote-deploy.sh COMMIT_SHA BACKEND_IMAGE FRONTEND_IMAGE" >&2
  exit 64
fi

readonly COMMIT_SHA="$1"
readonly BACKEND_IMAGE="$2"
readonly FRONTEND_IMAGE="$3"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
RELEASE_DIR="$(cd -- "${SCRIPT_DIR}/.." && pwd -P)"
readonly SCRIPT_DIR
readonly RELEASE_DIR

ECR_REGISTRY=""
PREVIOUS_RELEASE=""
TEMP_RUNTIME=""
TEMP_IMAGES=""
DEPLOYMENT_STARTED=false
RUNTIME_REPLACED=false
HAD_RUNTIME=false

log() {
  printf '[cecas-deploy] %s\n' "$*"
}

die() {
  printf '[cecas-deploy] ERROR: %s\n' "$*" >&2
  return 1
}

require_command() {
  local command_name="$1"

  command -v "${command_name}" >/dev/null 2>&1 ||
    die "Required command is unavailable: ${command_name}"
}

validate_inputs() {
  local backend_pattern
  local frontend_pattern

  [[ "${COMMIT_SHA}" =~ ^[0-9a-f]{40}$ ]] ||
    die "The commit SHA must contain exactly 40 lowercase hex characters."

  backend_pattern="^[0-9]{12}[.]dkr[.]ecr[.]${AWS_REGION}[.]amazonaws[.]com/cecas-backend@sha256:[0-9a-f]{64}$"
  frontend_pattern="^[0-9]{12}[.]dkr[.]ecr[.]${AWS_REGION}[.]amazonaws[.]com/cecas-frontend@sha256:[0-9a-f]{64}$"

  [[ "${BACKEND_IMAGE}" =~ ${backend_pattern} ]] ||
    die "The backend image must be an immutable cecas-backend ECR digest in ${AWS_REGION}."

  [[ "${FRONTEND_IMAGE}" =~ ${frontend_pattern} ]] ||
    die "The frontend image must be an immutable cecas-frontend ECR digest in ${AWS_REGION}."

  ECR_REGISTRY="${BACKEND_IMAGE%%/*}"

  [[ "${FRONTEND_IMAGE%%/*}" == "${ECR_REGISTRY}" ]] ||
    die "The backend and frontend images must use the same ECR registry."
}

preflight() {
  local command_name
  local expected_release_dir="${RELEASES_DIR}/${COMMIT_SHA}"

  [[ "${EUID}" -eq 0 ]] ||
    die "This deployment script must run as root."

  for command_name in aws docker curl flock grep install mktemp readlink chown chmod ln mv basename; do
    require_command "${command_name}"
  done

  install -d -o root -g root -m 0750 "${APP_ROOT}"
  install -d -o root -g root -m 0750 "${RELEASES_DIR}"

  [[ "${RELEASE_DIR}" == "${expected_release_dir}" ]] ||
    die "The release bundle must be installed at ${expected_release_dir}."

  [[ -f "${RELEASE_DIR}/docker-compose.prod.yml" ]] ||
    die "The release is missing docker-compose.prod.yml."

  [[ -f "${SCRIPT_DIR}/remote-deploy.sh" ]] ||
    die "The release is missing deploy/remote-deploy.sh."

  for link_path in "${CURRENT_LINK}" "${PREVIOUS_LINK}"; do
    if [[ -e "${link_path}" || -L "${link_path}" ]]; then
      [[ -L "${link_path}" ]] ||
        die "${link_path} exists but is not a symbolic link."
    fi
  done

  chown root:root \
    "${RELEASE_DIR}" \
    "${RELEASE_DIR}/docker-compose.prod.yml" \
    "${SCRIPT_DIR}" \
    "${SCRIPT_DIR}/remote-deploy.sh"

  chmod 0750 "${RELEASE_DIR}" "${SCRIPT_DIR}"
  chmod 0640 "${RELEASE_DIR}/docker-compose.prod.yml"
  chmod 0750 "${SCRIPT_DIR}/remote-deploy.sh"

  docker info >/dev/null
  docker compose version >/dev/null

  if ! docker compose up --help 2>/dev/null | grep -q -- '--wait'; then
    die "The installed Docker Compose version does not support the required --wait option."
  fi
}

acquire_deployment_lock() {
  exec 9>"${LOCK_FILE}"

  flock -n 9 ||
    die "Another CECAS deployment is already running."

  log "Acquired the prod deployment lock."
}

valid_release_dir() {
  local release_dir="$1"

  [[ "${release_dir}" == "${RELEASES_DIR}/"* ]] &&
    [[ -f "${release_dir}/docker-compose.prod.yml" ]] &&
    [[ -f "${release_dir}/deploy/remote-deploy.sh" ]] &&
    [[ -f "${release_dir}/images.env" ]]
}

capture_current_release() {
  local current_target

  if [[ ! -e "${CURRENT_LINK}" && ! -L "${CURRENT_LINK}" ]]; then
    log "No previously recorded release exists."
    return
  fi

  current_target="$(readlink -f -- "${CURRENT_LINK}")" ||
    die "Unable to resolve the current release link."

  valid_release_dir "${current_target}" ||
    die "The current release link does not point to a valid CECAS release."

  PREVIOUS_RELEASE="${current_target}"
  log "Recorded current release before deployment: $(basename -- "${PREVIOUS_RELEASE}")"
}

get_parameter() {
  local parameter_name="$1"
  local parameter_value

  if ! parameter_value="$(
    aws ssm get-parameter \
      --name "${parameter_name}" \
      --with-decryption \
      --query 'Parameter.Value' \
      --output text
  )"; then
    die "Unable to retrieve required Parameter Store entry: ${parameter_name}"
  fi

  [[ -n "${parameter_value}" && "${parameter_value}" != "None" ]] ||
    die "Parameter Store entry is empty: ${parameter_name}"

  printf '%s' "${parameter_value}"
}

append_export() {
  local destination_file="$1"
  local variable_name="$2"
  local variable_value="$3"

  printf 'export %s=%q\n' \
    "${variable_name}" \
    "${variable_value}" \
    >> "${destination_file}"
}

build_runtime_env() {
  local db_host
  local db_name
  local db_user
  local db_password
  local db_root_password
  local seed_enabled
  local session_cookie_secure

  log "Retrieving runtime config from Parameter Store."

  TEMP_RUNTIME="$(mktemp "${APP_ROOT}/.runtime.env.XXXXXX")"
  chmod 0600 "${TEMP_RUNTIME}"

  db_host="$(get_parameter '/cecas/prod/db/host')"
  db_name="$(get_parameter '/cecas/prod/db/name')"
  db_user="$(get_parameter '/cecas/prod/db/user')"
  db_password="$(get_parameter '/cecas/prod/db/password')"
  db_root_password="$(get_parameter '/cecas/prod/db/root-password')"
  seed_enabled="$(get_parameter '/cecas/prod/app/seed-enabled')"
  session_cookie_secure="$(get_parameter '/cecas/prod/app/session-cookie-secure')"

  [[ "${db_host}" == "mysql" ]] ||
    die "/cecas/prod/db/host must be configured as mysql."

  [[ "${seed_enabled}" == "false" ]] ||
    die "/cecas/prod/app/seed-enabled must be configured as false."

  [[ "${session_cookie_secure}" == "true" ]] ||
    die "/cecas/prod/app/session-cookie-secure must be configured as true."

  append_export "${TEMP_RUNTIME}" "DB_HOST" "${db_host}"
  append_export "${TEMP_RUNTIME}" "MYSQL_DATABASE" "${db_name}"
  append_export "${TEMP_RUNTIME}" "MYSQL_USER" "${db_user}"
  append_export "${TEMP_RUNTIME}" "MYSQL_PASSWORD" "${db_password}"
  append_export "${TEMP_RUNTIME}" "MYSQL_ROOT_PASSWORD" "${db_root_password}"
  append_export "${TEMP_RUNTIME}" "APP_SEED_ENABLED" "${seed_enabled}"
  append_export "${TEMP_RUNTIME}" "SESSION_COOKIE_SECURE" "${session_cookie_secure}"

  unset db_host
  unset db_name
  unset db_user
  unset db_password
  unset db_root_password
  unset seed_enabled
  unset session_cookie_secure
}

install_runtime_env() {
  if [[ -f "${RUNTIME_ENV}" ]]; then
    install \
      -o root \
      -g root \
      -m 0600 \
      "${RUNTIME_ENV}" \
      "${RUNTIME_ROLLBACK_FILE}"

    HAD_RUNTIME=true
  else
    rm -f -- "${RUNTIME_ROLLBACK_FILE}"
    HAD_RUNTIME=false
  fi

  install \
    -o root \
    -g root \
    -m 0600 \
    "${TEMP_RUNTIME}" \
    "${RUNTIME_ENV}"

  rm -f -- "${TEMP_RUNTIME}"
  TEMP_RUNTIME=""
  RUNTIME_REPLACED=true

  log "Installed root-only runtime config."
}

write_images_env() {
  TEMP_IMAGES="$(mktemp "${RELEASE_DIR}/.images.env.XXXXXX")"
  chmod 0600 "${TEMP_IMAGES}"

  append_export "${TEMP_IMAGES}" "BACKEND_IMAGE" "${BACKEND_IMAGE}"
  append_export "${TEMP_IMAGES}" "FRONTEND_IMAGE" "${FRONTEND_IMAGE}"

  install \
    -o root \
    -g root \
    -m 0600 \
    "${TEMP_IMAGES}" \
    "${RELEASE_DIR}/images.env"

  rm -f -- "${TEMP_IMAGES}"
  TEMP_IMAGES=""
}

load_release_environment() {
  local release_dir="$1"

  set -a

  # These files are generated by this script with Bash-safe escaping.
  # shellcheck disable=SC1090
  source "${RUNTIME_ENV}"

  # shellcheck disable=SC1090
  source "${release_dir}/images.env"

  set +a
}

compose_for_release() {
  local release_dir="$1"
  shift

  load_release_environment "${release_dir}"

  docker compose \
    --project-name cecas \
    --project-directory "${release_dir}" \
    --file "${release_dir}/docker-compose.prod.yml" \
    "$@"
}

authenticate_and_pull_images() {
  log "Authenticating Docker to ECR with the EC2 instance role."

  aws ecr get-login-password --region "${AWS_REGION}" |
    docker login \
      --username AWS \
      --password-stdin \
      "${ECR_REGISTRY}" \
      >/dev/null

  log "Pulling immutable application images."

  compose_for_release "${RELEASE_DIR}" pull backend frontend
}

smoke_release() {
  local attempt
  local health_body

  for ((attempt = 1; attempt <= SMOKE_ATTEMPTS; attempt++)); do
    if curl \
      --fail \
      --silent \
      --location \
      --connect-timeout 5 \
      --max-time 15 \
      --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
      "https://${PUBLIC_HOST}/" \
      >/dev/null 2>&1; then

      if health_body="$(
        curl \
          --fail \
          --silent \
          --connect-timeout 5 \
          --max-time 15 \
          --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
          "https://${PUBLIC_HOST}/actuator/health" \
          2>/dev/null
      )" &&
        [[ "${health_body}" == *'"status":"UP"'* ]]; then

        log "HTTPS smoke tests passed."
        return 0
      fi
    fi

    log "HTTPS is not ready yet (${attempt}/${SMOKE_ATTEMPTS})."

    if ((attempt < SMOKE_ATTEMPTS)); then
      sleep "${SMOKE_DELAY_SECONDS}"
    fi
  done

  log "HTTPS smoke tests did not pass before the timeout."

  curl \
    --fail \
    --show-error \
    --silent \
    --location \
    --connect-timeout 5 \
    --max-time 15 \
    --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
    "https://${PUBLIC_HOST}/" \
    --output /dev/null ||
    true

  curl \
    --fail \
    --show-error \
    --silent \
    --connect-timeout 5 \
    --max-time 15 \
    --resolve "${PUBLIC_HOST}:443:127.0.0.1" \
    "https://${PUBLIC_HOST}/actuator/health" \
    --output /dev/null ||
    true

  return 1
}

activate_release() {
  log "Validating the resolved Compose model."
  compose_for_release "${RELEASE_DIR}" config --quiet

  authenticate_and_pull_images

  log "Starting release ${COMMIT_SHA}."
  DEPLOYMENT_STARTED=true

  compose_for_release "${RELEASE_DIR}" \
    up \
    --detach \
    --remove-orphans \
    --wait \
    --wait-timeout "${COMPOSE_WAIT_SECONDS}"

  smoke_release
}

replace_symlink() {
  local target_path="$1"
  local link_path="$2"
  local temporary_link="${link_path}.tmp.$$"

  rm -f -- "${temporary_link}"
  ln -s -- "${target_path}" "${temporary_link}"
  mv -Tf -- "${temporary_link}" "${link_path}"
}

write_current_release_file() {
  local release_dir="$1"
  local temporary_file

  temporary_file="$(mktemp "${APP_ROOT}/.current-release.XXXXXX")"

  printf '%s\n' "$(basename -- "${release_dir}")" > "${temporary_file}"
  chown root:root "${temporary_file}"
  chmod 0640 "${temporary_file}"
  mv -Tf -- "${temporary_file}" "${CURRENT_RELEASE_FILE}"
}

record_successful_release() {
  replace_symlink "${RELEASE_DIR}" "${CURRENT_LINK}"

  if [[ -n "${PREVIOUS_RELEASE}" && "${PREVIOUS_RELEASE}" != "${RELEASE_DIR}" ]]; then
    replace_symlink "${PREVIOUS_RELEASE}" "${PREVIOUS_LINK}"
  fi

  write_current_release_file "${RELEASE_DIR}"

  rm -f -- "${RUNTIME_ROLLBACK_FILE}"
  RUNTIME_REPLACED=false

  log "Recorded ${COMMIT_SHA} as the current successful release."
}

print_safe_diagnostics() {
  local release_dir="$1"
  local service_name
  local diagnostic_file="${APP_ROOT}/deploy-failure-${COMMIT_SHA}.log"

  : > "${diagnostic_file}"
  chown root:root "${diagnostic_file}"
  chmod 0600 "${diagnostic_file}"

  {
    printf 'Container status\n'
    compose_for_release "${release_dir}" ps --all || true

    for service_name in mysql backend frontend; do
      printf '\nLast 100 %s log lines\n' "${service_name}"
      compose_for_release "${release_dir}" \
        logs \
        --no-color \
        --tail 100 \
        "${service_name}" ||
        true
    done
  } > "${diagnostic_file}" 2>&1

  log "Container status follows."
  compose_for_release "${release_dir}" ps --all || true
  log "Detailed root-only diagnostics were saved to ${diagnostic_file}."
}

restore_runtime_env() {
  if [[ "${RUNTIME_REPLACED}" != "true" ]]; then
    rm -f -- "${RUNTIME_ROLLBACK_FILE}"
    return
  fi

  if [[ "${HAD_RUNTIME}" == "true" && -f "${RUNTIME_ROLLBACK_FILE}" ]]; then
    install \
      -o root \
      -g root \
      -m 0600 \
      "${RUNTIME_ROLLBACK_FILE}" \
      "${RUNTIME_ENV}"
  else
    rm -f -- "${RUNTIME_ENV}"
  fi

  rm -f -- "${RUNTIME_ROLLBACK_FILE}"
  RUNTIME_REPLACED=false
}

on_error() {
  local exit_code="${1:-1}"
  local failed_line="${2:-unknown}"

  trap - ERR INT TERM
  set +e

  log "Deployment failed near script line ${failed_line}."

  if [[ "${DEPLOYMENT_STARTED}" == "true" ]]; then
    print_safe_diagnostics "${RELEASE_DIR}"
  fi

  restore_runtime_env

  if [[ "${DEPLOYMENT_STARTED}" == "true" && -n "${PREVIOUS_RELEASE}" ]]; then
    if valid_release_dir "${PREVIOUS_RELEASE}"; then
      log "Attempting to restore release $(basename -- "${PREVIOUS_RELEASE}")."

      if compose_for_release "${PREVIOUS_RELEASE}" \
        up \
        --detach \
        --remove-orphans \
        --wait \
        --wait-timeout "${COMPOSE_WAIT_SECONDS}" &&
        smoke_release; then

        if replace_symlink "${PREVIOUS_RELEASE}" "${CURRENT_LINK}" &&
          write_current_release_file "${PREVIOUS_RELEASE}"; then
          log "Previous release restored successfully."
        else
          log "Previous containers were restored, but release-state recording failed."
        fi
      else
        log "Automatic restoration of the previous release failed."
      fi
    else
      log "The recorded previous release is invalid; automatic restoration was skipped."
    fi
  elif [[ "${DEPLOYMENT_STARTED}" == "true" ]]; then
    log "No previous successful release exists; automatic restoration is unavailable."
  fi

  if [[ -n "${TEMP_RUNTIME}" ]]; then
    rm -f -- "${TEMP_RUNTIME}"
  fi

  if [[ -n "${TEMP_IMAGES}" ]]; then
    rm -f -- "${TEMP_IMAGES}"
  fi

  exit "${exit_code}"
}

main() {
  validate_inputs
  preflight
  acquire_deployment_lock
  capture_current_release

  build_runtime_env
  install_runtime_env
  write_images_env
  activate_release
  record_successful_release

  log "Deployment completed successfully."
}

trap 'on_error "$?" "$LINENO"' ERR
trap 'on_error 130 "$LINENO"' INT
trap 'on_error 143 "$LINENO"' TERM

main