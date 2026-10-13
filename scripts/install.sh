#!/usr/bin/env bash
# Install skills from this repo into your personal Claude Code skills folder.
#
# Usage:
#   scripts/install.sh                      install every skill in skills/
#   scripts/install.sh jira-client-update   install only the named skill(s)
#
# Set CLAUDE_SKILLS_DIR to install somewhere else (default: ~/.claude/skills).
# Re-running overwrites the installed copy, so any local edits to it are lost.
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"

# A skill is any folder under skills/ that contains a SKILL.md. This skips
# local workspace folders (evals, snapshots) that sit next to the real skills.
available=()
for dir in "$REPO"/skills/*/; do
  [ -f "${dir}SKILL.md" ] && available+=("$(basename "$dir")")
done

if [ "${#available[@]}" -eq 0 ]; then
  echo "No skills found under $REPO/skills" >&2
  exit 1
fi

if [ "$#" -gt 0 ]; then
  selected=("$@")
  for name in "${selected[@]}"; do
    found=0
    for a in "${available[@]}"; do [ "$a" = "$name" ] && found=1; done
    if [ "$found" -eq 0 ]; then
      echo "Unknown skill: $name" >&2
      echo "Available: ${available[*]}" >&2
      exit 1
    fi
  done
else
  selected=("${available[@]}")
fi

mkdir -p "$DEST"
for name in "${selected[@]}"; do
  rm -rf "${DEST:?}/$name"
  cp -R "$REPO/skills/$name" "$DEST/$name"
  rm -rf "$DEST/$name/evals"
  echo "Installed $name -> $DEST/$name"
done

echo
echo "Done. New skills are normally picked up live. If a session that was already"
echo "running does not see them, start a new session or try /reload-skills."
