#!/usr/bin/env bash
set -euo pipefail

usage() {
  printf 'Usage: %s OUTPUT_JSON [3|4]\n' "$0" >&2
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 2
fi

output=$1
count=${2:-4}

if [[ "$count" != "3" && "$count" != "4" ]]; then
  printf 'Seed count must be 3 or 4, got %s\n' "$count" >&2
  exit 2
fi

mkdir -p "$(dirname "$output")"
tmp="${output}.tmp.$$"
trap 'rm -f "$tmp"' EXIT

{
  printf '{\n  "schema_version": 1,\n  "generator": "generate-design-seeds.sh",\n  "entropy_source": "/dev/urandom",\n  "count": %s,\n  "seeds": [' "$count"

  for ((index = 0; index < count; index += 1)); do
    seed=$(od -An -N32 -tx1 /dev/urandom | tr -d ' \n')
    if [[ ! "$seed" =~ ^[0-9a-f]{64}$ ]]; then
      printf 'Failed to produce a 64-character external seed\n' >&2
      exit 1
    fi
    if (( index > 0 )); then
      printf ','
    fi
    printf '\n    {"id":"seed-%02d","value":"%s"}' "$((index + 1))" "$seed"
  done

  printf '\n  ]\n}\n'
} > "$tmp"

mv "$tmp" "$output"
trap - EXIT
printf '%s\n' "$output"
