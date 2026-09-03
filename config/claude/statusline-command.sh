#!/bin/bash
# Claude Code status line: single-line status.
# Layout: <model> │ 🌿 <branch> │ <tokens> │ cache <session tokens saved> ×<hits> · <ttl countdown> │ ⏳ <5h usage>

input=$(cat)

# ---- colors ----
DIM='\033[2m'
RESET='\033[0m'
GREEN='\033[32m'
YELLOW='\033[33m'
RED='\033[31m'

# ---- basic fields ----
model_display=$(echo "$input" | jq -r '.model.display_name // "unknown"' 2>/dev/null)
effort=$(echo "$input" | jq -r '.effort.level // empty' 2>/dev/null)
current_dir=$(echo "$input" | jq -r '.workspace.current_dir // empty' 2>/dev/null)
transcript_path=$(echo "$input" | jq -r '.transcript_path // empty' 2>/dev/null)

[ -z "$current_dir" ] && current_dir="$PWD"

# ---- shorten model name ----
# Drop leading "Claude " and collapse to short form, e.g. "Claude Opus 4.5" -> "Opus 4.5"
[ -z "$model_display" ] && model_display="unknown"
model_short=$(echo "$model_display" | sed -E 's/^Claude[[:space:]]+//')
[ -z "$model_short" ] && model_short="$model_display"
if [ -n "$effort" ]; then
	model_short="${model_short}·${effort}"
fi

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

# ---- context window usage ----
total_input=$(echo "$input" | jq -r '.context_window.total_input_tokens // 0' 2>/dev/null)
total_output=$(echo "$input" | jq -r '.context_window.total_output_tokens // 0' 2>/dev/null)

[ -z "$total_input" ] && total_input=0
[ -z "$total_output" ] && total_output=0

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
WARN_TOKENS=160000
HANDOFF_TOKENS=180000

ctx_color="$RESET"
ctx_marker=""
if [ "$used_tokens" -ge "$HANDOFF_TOKENS" ] 2>/dev/null; then
	ctx_color="$RED"
	ctx_marker=" ${RED}⚠ new chat${RESET}"
elif [ "$used_tokens" -ge "$WARN_TOKENS" ] 2>/dev/null; then
	ctx_color="$YELLOW"
fi
context_segment="${ctx_color}${tokens_fmt}${RESET} ${DIM}tokens${RESET}${ctx_marker}"

# ---- plan usage (5-hour rate-limit window) as a bar + countdown ----
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
		usage_color="$GREEN"
	fi

	filled=$((usage_pct_int / 10))
	[ "$filled" -gt 10 ] 2>/dev/null && filled=10
	[ "$filled" -lt 0 ] 2>/dev/null && filled=0
	bar=""
	i=0
	while [ "$i" -lt 10 ]; do
		if [ "$i" -lt "$filled" ]; then
			bar="${bar}▓"
		else
			bar="${bar}░"
		fi
		i=$((i + 1))
	done

	reset_txt=""
	if [ -n "$usage_reset" ]; then
		now_secs=$(date +%s 2>/dev/null)
		secs_left=$((usage_reset - now_secs))
		if [ "$secs_left" -gt 0 ] 2>/dev/null; then
			r_h=$((secs_left / 3600))
			r_m=$(((secs_left % 3600) / 60))
			if [ "$r_h" -gt 0 ]; then
				reset_txt=" ${DIM}· ${r_h}h${r_m}m left${RESET}"
			else
				reset_txt=" ${DIM}· ${r_m}m left${RESET}"
			fi
		fi
	fi
	usage_segment="⏳ ${usage_color}${bar} ${usage_pct_int}%${RESET}${reset_txt}"
fi

# ---- cache: prompt-cache hit rate + age ----
cache_read=$(echo "$input" | jq -r '.context_window.current_usage.cache_read_input_tokens // 0' 2>/dev/null)
cache_create=$(echo "$input" | jq -r '.context_window.current_usage.cache_creation_input_tokens // 0' 2>/dev/null)
cache_fresh=$(echo "$input" | jq -r '.context_window.current_usage.input_tokens // 0' 2>/dev/null)
[ -z "$cache_read" ] && cache_read=0
[ -z "$cache_create" ] && cache_create=0
[ -z "$cache_fresh" ] && cache_fresh=0

hit_part=""
denom=$((cache_read + cache_create + cache_fresh))
if [ "$denom" -gt 0 ] 2>/dev/null; then
	# Colour still reflects THIS turn's hit rate: green = the turn was served
	# almost entirely from cache, red = most of it had to be reprocessed.
	hit=$((cache_read * 100 / denom))
	if [ "$hit" -ge 80 ] 2>/dev/null; then
		hit_color="$GREEN"
	elif [ "$hit" -ge 50 ] 2>/dev/null; then
		hit_color="$YELLOW"
	else
		hit_color="$RED"
	fi
fi

# The NUMBER shown is cumulative for the session, not this turn: total tokens
# ever served from cache, and how many API calls hit the cache at all. Summed
# straight off the transcript (~20ms on a multi-MB file). Per-turn cache_read
# just tracks context size, which is why it was uninformative.
cache_saved=0
cache_hits=0
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
	read -r cache_hits cache_saved <<<"$(jq -s -r '
    [.[] | .message.usage.cache_read_input_tokens // empty | select(. > 0)]
    | "\(length) \(add // 0)"
  ' "$transcript_path" 2>/dev/null)"
fi
[ -z "$cache_hits" ] && cache_hits=0
[ -z "$cache_saved" ] && cache_saved=0

if [ "$cache_saved" -gt 0 ] 2>/dev/null; then
	saved_fmt=$(humanize_tokens "$cache_saved")
	hit_part="${hit_color}${saved_fmt}${RESET} ${DIM}saved ×${cache_hits}${RESET}"
elif [ "$cache_read" -gt 0 ] 2>/dev/null; then
	# transcript unreadable: fall back to this turn's figure
	saved_fmt=$(humanize_tokens "$cache_read")
	hit_part="${hit_color}${saved_fmt}${RESET} ${DIM}saved${RESET}"
fi

# Prompt-cache TTL. Claude Code opts the main REPL thread into the API's 1h
# extended TTL (the API default is 5m), gated the same way it gates it itself:
# FORCE_PROMPT_CACHING_5M pins 5m, ENABLE_PROMPT_CACHING_1H pins 1h. Override
# directly with CLAUDE_STATUSLINE_CACHE_TTL=<seconds>.
CACHE_TTL=3600
case "$(printf '%s' "${FORCE_PROMPT_CACHING_5M:-}" | tr '[:upper:]' '[:lower:]')" in
1 | true | yes) CACHE_TTL=300 ;;
esac
case "$(printf '%s' "${ENABLE_PROMPT_CACHING_1H:-}" | tr '[:upper:]' '[:lower:]')" in
1 | true | yes) CACHE_TTL=3600 ;;
esac
if [ -n "${CLAUDE_STATUSLINE_CACHE_TTL:-}" ] && [ "$CLAUDE_STATUSLINE_CACHE_TTL" -eq "$CLAUDE_STATUSLINE_CACHE_TTL" ] 2>/dev/null; then
	CACHE_TTL="$CLAUDE_STATUSLINE_CACHE_TTL"
fi

# Time REMAINING before the cache goes cold (counts down), then how long ago it
# went cold — a red "expired" on return to a session is the cue to compact.
age_part=""
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
	# GNU stat on Linux (container), BSD stat on macOS (host).
	ts=$(stat -c %Y "$transcript_path" 2>/dev/null || stat -f %m "$transcript_path" 2>/dev/null)
	if [ -n "$ts" ] && [ "$ts" -eq "$ts" ] 2>/dev/null; then
		now_secs=$(date +%s 2>/dev/null)
		elapsed=$((now_secs - ts))
		if [ "$elapsed" -ge 0 ] 2>/dev/null; then
			left=$((CACHE_TTL - elapsed))
			if [ "$left" -gt 0 ] 2>/dev/null; then
				if [ "$left" -ge 3600 ] 2>/dev/null; then
					left_txt="$((left / 3600))h$(((left % 3600) / 60))m"
				elif [ "$left" -ge 600 ] 2>/dev/null; then
					left_txt="$((left / 60))m"
				else
					left_txt="$((left / 60))m$((left % 60))s"
				fi
				if [ "$left" -ge 600 ] 2>/dev/null; then
					age_color="$GREEN"
				elif [ "$left" -ge 120 ] 2>/dev/null; then
					age_color="$YELLOW"
				else
					age_color="$RED"
				fi
				age_part="${age_color}${left_txt} left${RESET}"
			else
				cold=$((elapsed - CACHE_TTL))
				if [ "$cold" -ge 3600 ] 2>/dev/null; then
					cold_txt="$((cold / 3600))h$(((cold % 3600) / 60))m"
				elif [ "$cold" -ge 60 ] 2>/dev/null; then
					cold_txt="$((cold / 60))m"
				else
					cold_txt="${cold}s"
				fi
				age_part="${RED}expired ${cold_txt} ago${RESET}"
			fi
		fi
	fi
fi

cache_segment=""
if [ -n "$hit_part" ] || [ -n "$age_part" ]; then
	if [ -n "$hit_part" ]; then
		cache_segment="${DIM}cache${RESET} ${hit_part}"
		if [ -n "$age_part" ]; then
			cache_segment="${cache_segment} ${DIM}·${RESET} ${age_part}"
		fi
	else
		cache_segment="${DIM}cache${RESET} ${age_part}"
	fi
fi

# ---- assemble output ----
line="${model_short}${git_segment} ${DIM}│${RESET} ${context_segment}"
if [ -n "$cache_segment" ]; then
	line="${line} ${DIM}│${RESET} ${cache_segment}"
fi
if [ -n "$usage_segment" ]; then
	line="${line} ${DIM}│${RESET} ${usage_segment}"
fi

printf '%b' "$line"
