#!/bin/bash
# Claude Code status line: Pi-agent style 3-line status line.
# Line 1: model, project, git branch
# Line 2: (optional) phase/task from state file
# Line 3: context bar, cost, elapsed, edits, (optional) tests

input=$(cat)

# ---- colors ----
DIM='\033[2m'
RESET='\033[0m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'
CYAN='\033[36m'
BOLD='\033[1m'

# ---- basic fields ----
model_display=$(echo "$input" | jq -r '.model.display_name // "unknown"' 2>/dev/null)
effort=$(echo "$input" | jq -r '.effort.level // empty' 2>/dev/null)
current_dir=$(echo "$input" | jq -r '.workspace.current_dir // empty' 2>/dev/null)
project_dir=$(echo "$input" | jq -r '.workspace.project_dir // empty' 2>/dev/null)
session_id=$(echo "$input" | jq -r '.session_id // empty' 2>/dev/null)
claude_project_dir=$(echo "$input" | jq -r '.workspace.project_dir // empty' 2>/dev/null)

[ -z "$current_dir" ] && current_dir="$PWD"

# ---- shorten model name ----
# Drop leading "Claude " and collapse to short form, e.g. "Claude Opus 4.5" -> "Opus 4.5"
model_short=$(echo "$model_display" | sed -E 's/^Claude[[:space:]]+//')
[ -z "$model_short" ] && model_short="$model_display"
if [ -n "$effort" ]; then
  model_short="${model_short} · ${effort}"
fi

# ---- project basename ----
proj_base_src="$project_dir"
[ -z "$proj_base_src" ] && proj_base_src="$current_dir"
project_name=$(basename -- "$proj_base_src" 2>/dev/null)
[ -z "$project_name" ] && project_name="?"

# ---- git branch / worktree ----
git_segment=""
if git -C "$current_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  branch=$(git -C "$current_dir" symbolic-ref --short -q HEAD 2>/dev/null)
  if [ -z "$branch" ]; then
    branch=$(git -C "$current_dir" rev-parse --short HEAD 2>/dev/null)
  fi
  worktree_marker=""
  git_dir=$(git -C "$current_dir" rev-parse --git-dir 2>/dev/null)
  common_dir=$(git -C "$current_dir" rev-parse --git-common-dir 2>/dev/null)
  if [ -n "$git_dir" ] && [ -n "$common_dir" ]; then
    # Resolve to absolute paths for comparison
    git_dir_abs=$(cd "$current_dir" 2>/dev/null && cd "$git_dir" 2>/dev/null && pwd)
    common_dir_abs=$(cd "$current_dir" 2>/dev/null && cd "$common_dir" 2>/dev/null && pwd)
    if [ -n "$git_dir_abs" ] && [ -n "$common_dir_abs" ] && [ "$git_dir_abs" != "$common_dir_abs" ]; then
      worktree_marker=" 🌲"
    fi
  fi
  if [ -n "$branch" ]; then
    git_segment=" ${DIM}│${RESET} 🌿 ${branch}${worktree_marker}"
  fi
fi

line1="🧠 ${model_short} ${DIM}│${RESET} 📁 ${project_name}${git_segment}"

# ---- optional state file ----
state_file=""
if [ -n "$claude_project_dir" ] && [ -f "${claude_project_dir}/.claude/status.json" ]; then
  state_file="${claude_project_dir}/.claude/status.json"
elif [ -f "${current_dir}/.claude/status.json" ]; then
  state_file="${current_dir}/.claude/status.json"
elif [ -n "$session_id" ] && [ -f "${HOME}/.claude/state/${session_id}.json" ]; then
  state_file="${HOME}/.claude/state/${session_id}.json"
fi

phase=""
task=""
jira=""
tests=""
if [ -n "$state_file" ]; then
  state_json=$(cat "$state_file" 2>/dev/null)
  if [ -n "$state_json" ] && echo "$state_json" | jq -e . >/dev/null 2>&1; then
    phase=$(echo "$state_json" | jq -r '.phase // empty' 2>/dev/null)
    task=$(echo "$state_json" | jq -r '.task // empty' 2>/dev/null)
    jira=$(echo "$state_json" | jq -r '.jira // empty' 2>/dev/null)
    tests=$(echo "$state_json" | jq -r '.tests // empty' 2>/dev/null)
  fi
fi

line2=""
if [ -n "$phase" ] || [ -n "$task" ]; then
  case "$phase" in
  Investigating | Investigate) phase_emoji="🔍" ;;
  Implementing | Implement) phase_emoji="💻" ;;
  Testing | Tests) phase_emoji="🧪" ;;
  Reading | Docs) phase_emoji="📖" ;;
  Debugging | Debug) phase_emoji="🐛" ;;
  Planning | Plan) phase_emoji="📝" ;;
  Waiting) phase_emoji="⏳" ;;
  *) phase_emoji="⚙️" ;;
  esac
  task_display="$task"
  if [ -n "$jira" ]; then
    task_display="${jira} ${task}"
  fi
  line2="${phase_emoji} ${phase} ${DIM}│${RESET} 🎯 ${task_display}"
fi

# ---- context window usage ----
total_input=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0' 2>/dev/null)
total_output=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0' 2>/dev/null)
window_size=$(echo "$input" | jq -r '.context_window.context_window_size // 0' 2>/dev/null)
remaining_pct=$(echo "$input" | jq -r '.context_window.remaining_percentage // empty' 2>/dev/null)

[ -z "$total_input" ] && total_input=0
[ -z "$total_output" ] && total_output=0
[ -z "$window_size" ] && window_size=0

used_tokens=$((total_input + total_output))

# condensed token count: <1000 -> "N", <1M -> "N.Nk"/"NNk", >=1M -> "N.NM"
humanize_tokens() {
  local n="$1"
  if [ "$n" -lt 1000 ] 2>/dev/null; then
    printf '%s' "$n"
  elif [ "$n" -lt 1000000 ] 2>/dev/null; then
    if [ "$n" -lt 10000 ] 2>/dev/null; then
      # one decimal for 1.0k-9.9k
      printf '%d.%dk' "$((n / 1000))" "$(((n % 1000) / 100))"
    else
      printf '%dk' "$((n / 1000))"
    fi
  else
    printf '%d.%dM' "$((n / 1000000))" "$(((n % 1000000) / 100000))"
  fi
}
tokens_fmt=$(humanize_tokens "$used_tokens")

# Plain token count with hand-off thresholds (no gradient bar).
# Neutral below WARN, yellow heads-up between WARN and HANDOFF,
# red + marker at/above HANDOFF ("dumber zone" — time for a new chat).
WARN_TOKENS=140000
HANDOFF_TOKENS=160000

ctx_color="$RESET"
ctx_marker=""
if [ "$used_tokens" -ge "$HANDOFF_TOKENS" ] 2>/dev/null; then
  ctx_color="$RED"
  ctx_marker=" ${RED}⚠ new chat${RESET}"
elif [ "$used_tokens" -ge "$WARN_TOKENS" ] 2>/dev/null; then
  ctx_color="$YELLOW"
fi
context_segment="${ctx_color}${tokens_fmt}${RESET} ${DIM}tokens${RESET}${ctx_marker}"

# ---- elapsed ----
duration_ms=$(echo "$input" | jq -r '.cost.total_duration_ms // 0' 2>/dev/null)
[ -z "$duration_ms" ] && duration_ms=0
total_secs=$((duration_ms / 1000))
hours=$((total_secs / 3600))
mins=$(((total_secs % 3600) / 60))
secs=$((total_secs % 60))
if [ "$hours" -gt 0 ]; then
  elapsed="${hours}h${mins}m"
elif [ "$mins" -gt 0 ]; then
  elapsed="${mins}m"
else
  elapsed="${secs}s"
fi

# ---- plan usage (5-hour rate-limit window) + time until reset ----
usage_segment=""
usage_pct=$(echo "$input" | jq -r '.rate_limits.five_hour.used_percentage // empty' 2>/dev/null)
usage_reset=$(echo "$input" | jq -r '.rate_limits.five_hour.resets_at // empty' 2>/dev/null)
if [ -n "$usage_pct" ]; then
  usage_pct_int=${usage_pct%.*}
  [ -z "$usage_pct_int" ] && usage_pct_int=0
  if [ "$usage_pct_int" -ge 90 ] 2>/dev/null; then
    usage_color="$RED"
  elif [ "$usage_pct_int" -ge 70 ] 2>/dev/null; then
    usage_color="$YELLOW"
  else
    usage_color="$RESET"
  fi
  reset_txt=""
  if [ -n "$usage_reset" ]; then
    now_secs=$(date +%s 2>/dev/null)
    secs_left=$((usage_reset - now_secs))
    if [ "$secs_left" -gt 0 ] 2>/dev/null; then
      r_h=$((secs_left / 3600))
      r_m=$(((secs_left % 3600) / 60))
      if [ "$r_h" -gt 0 ]; then
        reset_txt=" ${DIM}(resets ${r_h}h${r_m}m)${RESET}"
      else
        reset_txt=" ${DIM}(resets ${r_m}m)${RESET}"
      fi
    fi
  fi
  usage_segment=" ${DIM}│${RESET} 📊 ${usage_color}${usage_pct_int}%${RESET}${reset_txt}"
fi

# ---- edits (git porcelain preferred, fallback to cost.lines) ----
edits_segment=""
if git -C "$current_dir" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  porcelain=$(git -C "$current_dir" status --porcelain 2>/dev/null)
  modified_count=0
  staged_count=0
  if [ -n "$porcelain" ]; then
    while IFS= read -r line; do
      [ -z "$line" ] && continue
      idx_char="${line:0:1}"
      wt_char="${line:1:1}"
      if [ "$idx_char" != " " ] && [ "$idx_char" != "?" ]; then
        staged_count=$((staged_count + 1))
      fi
      if [ "$wt_char" != " " ] && [ "$wt_char" != "?" ]; then
        modified_count=$((modified_count + 1))
      fi
    done <<<"$porcelain"
  fi
  edits_segment="✏️ ${modified_count}M +${staged_count}S"
else
  lines_added=$(echo "$input" | jq -r '.cost.total_lines_added // empty' 2>/dev/null)
  lines_removed=$(echo "$input" | jq -r '.cost.total_lines_removed // empty' 2>/dev/null)
  if [ -n "$lines_added" ] || [ -n "$lines_removed" ]; then
    [ -z "$lines_added" ] && lines_added=0
    [ -z "$lines_removed" ] && lines_removed=0
    edits_segment="✏️ +${lines_added}/-${lines_removed}"
  fi
fi

# ---- tests segment ----
tests_segment=""
if [ -n "$tests" ]; then
  tests_lower=$(echo "$tests" | tr '[:upper:]' '[:lower:]')
  if echo "$tests_lower" | grep -q "fail"; then
    tests_color="$RED"
  elif echo "$tests_lower" | grep -q "pass"; then
    tests_color="$GREEN"
  else
    tests_color="$RESET"
  fi
  tests_segment=" ${DIM}│${RESET} ${tests_color}✓ ${tests}${RESET}"
fi

line3="${context_segment}${usage_segment} ${DIM}│${RESET} ⏱ ${elapsed}"
if [ -n "$edits_segment" ]; then
  line3="${line3} ${DIM}│${RESET} ${edits_segment}"
fi
line3="${line3}${tests_segment}"

# ---- assemble output ----
if [ -n "$line2" ]; then
  printf '%b\n%b\n%b' "$line1" "$line2" "$line3"
else
  printf '%b\n%b' "$line1" "$line3"
fi
