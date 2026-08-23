#!/bin/bash
# Play a notification sound when Claude finishes / needs attention AND the terminal is not focused.
# Cross-platform: WSL (Windows host) and macOS. Falls back to the terminal bell elsewhere.
#
# Focus model (tmux + terminal emulator):
#   1. If our tmux window is NOT the active window            -> away (fast, local check)
#   2. Else if the OS foreground app is NOT the terminal      -> away (you're in a browser/etc.)
#   3. Else                                                   -> focused, stay silent
# Any failure in the checks defaults to "focused" (silent) so we never nag while you're looking.

# ---- sounds (change these to taste) ----
NOTIFY_SOUND_WIN='C:\Windows\Media\Windows Message Nudge.wav' # any C:\Windows\Media\*.wav
NOTIFY_SOUND_MAC='/System/Library/Sounds/Tink.aiff'           # any /System/Library/Sounds/*.aiff

# Terminal emulator names to treat as "focused" (extend for your setup).
TERM_APPS_RE='[Ww]ez[Tt]erm|iTerm|Terminal|Ghostty|Alacritty|kitty|Hyper'

is_wsl() { grep -qiE '(microsoft|wsl)' /proc/version 2>/dev/null; }
is_mac() { [ "$(uname -s)" = "Darwin" ]; }

away=0

# 1) tmux: are we on a different tmux window?
if [ -n "$TMUX" ]; then
  active=$(tmux display-message -p -t "${TMUX_PANE:-}" '#{window_active}' 2>/dev/null)
  [ "$active" = "0" ] && away=1
fi

# 2) OS focus: is the terminal the foreground app?
if [ "$away" = "0" ]; then
  fg=""
  if is_wsl && command -v powershell.exe >/dev/null 2>&1; then
    fg=$(powershell.exe -NoProfile -Command '
$s=@"
using System;
using System.Runtime.InteropServices;
public class Fg{
[DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
[DllImport("user32.dll")] public static extern int GetWindowThreadProcessId(IntPtr h, out int p);
}
"@
Add-Type $s
$h=[Fg]::GetForegroundWindow()
$procId=0
[void][Fg]::GetWindowThreadProcessId($h,[ref]$procId)
(Get-Process -Id $procId).ProcessName
' 2>/dev/null | tr -d '\r\n')
  elif is_mac && command -v lsappinfo >/dev/null 2>&1; then
    # lsappinfo needs no accessibility permission
    fg=$(lsappinfo info -only name "$(lsappinfo front 2>/dev/null)" 2>/dev/null | sed -E 's/.*"[^"]*"="([^"]*)".*/\1/')
  fi
  if [ -n "$fg" ]; then
    echo "$fg" | grep -qE "$TERM_APPS_RE" && away=0 || away=1
  fi
fi

# 3) Play the sound if away. Backgrounded so the hook returns immediately.
if [ "$away" = "1" ]; then
  if is_wsl && command -v powershell.exe >/dev/null 2>&1; then
    (powershell.exe -NoProfile -Command "(New-Object Media.SoundPlayer '$NOTIFY_SOUND_WIN').PlaySync()" >/dev/null 2>&1) &
  elif is_mac && command -v afplay >/dev/null 2>&1; then
    (afplay "$NOTIFY_SOUND_MAC" >/dev/null 2>&1) &
  else
    printf '\a' # terminal bell fallback
  fi
fi

exit 0
