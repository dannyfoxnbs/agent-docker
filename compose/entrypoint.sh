#!/bin/sh
set -eu

agent=${1:-}
if [ -z "$agent" ]; then
  printf '%s\n' 'Expected one of: claude, codex, pi' >&2
  exit 2
fi
shift

skills=/opt/agent-skills
config=/opt/agent-config
eslint_rules=/opt/agent-eslint-rules

if [ ! -d "$skills" ] || [ ! -d "$config" ]; then
  printf '%s\n' 'This entrypoint must run inside the Compose container. Use ./compose/run instead.' >&2
  exit 2
fi

replace_link() {
  source=$1
  destination=$2
  if [ -d "$destination" ] && [ ! -L "$destination" ]; then
    rm -rf "$destination"
  else
    rm -f "$destination"
  fi
  ln -s "$source" "$destination"
}

write_pi_settings() {
  source=$1
  destination=$2
  shift 2
  rm -f "$destination"
  packages=$(printf '%s\n' "$@" | jq -Rs 'split("\n") | map(select(. != ""))')
  jq --argjson add "$packages" '
    .packages = reduce $add[] as $package ((.packages // []);
      if index($package) == null then . + [$package] else . end)
  ' "$source" > "$destination"
}

# The lint hook and the Pi extension both fail open when the rules are absent,
# so a missing mount degrades to no checking rather than a broken agent.
export_eslint_runner() {
  if [ -f "$eslint_rules/lint-agent.mjs" ]; then
    AGENT_ESLINT_RUNNER="$eslint_rules/lint-agent.mjs"
    export AGENT_ESLINT_RUNNER
  fi
}

mkdir -p "$HOME/.agents" "$HOME/.claude" "$HOME/.codex" "$HOME/.pi/agent"
replace_link "$skills" "$HOME/.agents/skills"

if [ -s "$config/shared/AGENTS.md" ]; then
  replace_link "$config/shared/AGENTS.md" "$HOME/.claude/CLAUDE.md"
  replace_link "$config/shared/AGENTS.md" "$HOME/.codex/AGENTS.md"
  replace_link "$config/shared/AGENTS.md" "$HOME/.pi/agent/AGENTS.md"
fi

case "$agent" in
  claude)
    replace_link "$skills" "$HOME/.claude/skills"
    replace_link "$config/claude/hooks" "$HOME/.claude/hooks"
    replace_link "$config/claude/commands" "$HOME/.claude/commands"
    replace_link "$config/claude/statusline-command.sh" "$HOME/.claude/statusline-command.sh"
    export_eslint_runner
    set -- --settings "$config/claude/settings.json" "$@"
    if [ -f "$config/claude/mcp.json" ]; then
      set -- --mcp-config "$config/claude/mcp.json" "$@"
    fi
    exec claude "$@"
    ;;
  codex)
    replace_link "$config/codex/config.toml" "$HOME/.codex/config.toml"
    exec codex "$@"
    ;;
  pi)
    export_eslint_runner
    pi_settings=$HOME/.pi/agent/settings.json
    if [ -f "$eslint_rules/package.json" ]; then
      write_pi_settings "$config/pi/settings.json" "$pi_settings" /opt/diff-review "$eslint_rules"
    else
      write_pi_settings "$config/pi/settings.json" "$pi_settings" /opt/diff-review
    fi
    if [ -f "$config/pi/models.json" ]; then
      replace_link "$config/pi/models.json" "$HOME/.pi/agent/models.json"
    else
      rm -f "$HOME/.pi/agent/models.json"
    fi
    replace_link "$config/pi/web-search.json" "$HOME/.pi/agent/web-search.json"
    for resource in extensions prompts themes; do
      replace_link "$config/pi/$resource" "$HOME/.pi/agent/$resource"
    done
    exec pi "$@"
    ;;
  *)
    printf 'Unknown agent: %s\n' "$agent" >&2
    exit 2
    ;;
esac
