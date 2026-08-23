#!/bin/bash
# Maintains the Pi-style status state file that statusline-command.sh renders.
# Writes to ~/.claude/state/<session_id>.json (per-session, no repo pollution).
#   UserPromptSubmit -> set .task from the prompt, phase = Investigating
#   PreToolUse       -> set .phase inferred from the tool being used
#   Stop             -> phase = Waiting
# Always exits 0 so it can never block a tool or the turn.

input=$(cat)

event=$(echo "$input" | jq -r '.hook_event_name // empty' 2>/dev/null)
session=$(echo "$input" | jq -r '.session_id // empty' 2>/dev/null)
[ -z "$session" ] && exit 0

state_dir="$HOME/.claude/state"
state_file="$state_dir/$session.json"
mkdir -p "$state_dir" 2>/dev/null

# Load existing state (or start fresh if missing/corrupt).
if [ -f "$state_file" ]; then
  cur=$(cat "$state_file" 2>/dev/null)
  echo "$cur" | jq -e . >/dev/null 2>&1 || cur='{}'
else
  cur='{}'
fi

case "$event" in
UserPromptSubmit)
  prompt=$(echo "$input" | jq -r '.prompt // empty' 2>/dev/null)
  # single line, trimmed to 60 chars
  task=$(printf '%s' "$prompt" | tr '\n' ' ' | cut -c1-60)
  cur=$(echo "$cur" | jq --arg t "$task" '.task = $t | .phase = "Investigating"' 2>/dev/null)
  ;;
PreToolUse)
  tool=$(echo "$input" | jq -r '.tool_name // empty' 2>/dev/null)
  case "$tool" in
  Edit | Write | MultiEdit | NotebookEdit) phase="Implementing" ;;
  Read | Grep | Glob) phase="Investigating" ;;
  WebFetch | WebSearch) phase="Reading" ;;
  Task | Agent) phase="Investigating" ;;
  Bash)
    cmd=$(echo "$input" | jq -r '.tool_input.command // empty' 2>/dev/null | tr '[:upper:]' '[:lower:]')
    case "$cmd" in
    *test* | *jest* | *karma* | *pytest* | *vitest* | *" spec"* | *ng\ test*) phase="Testing" ;;
    *git\ commit* | *git\ push*) phase="Implementing" ;;
    *) phase="Implementing" ;;
    esac
    ;;
  *) phase="" ;;
  esac
  [ -n "$phase" ] && cur=$(echo "$cur" | jq --arg p "$phase" '.phase = $p' 2>/dev/null)
  ;;
Stop)
  cur=$(echo "$cur" | jq '.phase = "Waiting"' 2>/dev/null)
  ;;
esac

# Guard against a jq failure blanking the file.
[ -z "$cur" ] && exit 0
printf '%s\n' "$cur" >"$state_file" 2>/dev/null

exit 0
