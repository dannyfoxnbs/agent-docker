FROM node:24-bookworm-slim

ARG CLAUDE_CODE_VERSION=latest
ARG CODEX_VERSION=latest
ARG PI_VERSION=latest
ARG DIFF_REVIEW_REF=main
ARG INSTALL_AZURE_CLI=false

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
      bash \
      ca-certificates \
      chromium \
      curl \
      git \
      jq \
      less \
      python3 \
      ripgrep \
      sudo \
      tmux \
    && rm -rf /var/lib/apt/lists/* \
    && echo 'node ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/node

RUN npm install -g \
      "@anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}" \
      "@openai/codex@${CODEX_VERSION}" \
    && npm install -g --ignore-scripts \
      "@earendil-works/pi-coding-agent@${PI_VERSION}" \
    && npm cache clean --force

RUN git clone --depth 1 --branch "${DIFF_REVIEW_REF}" \
      https://github.com/dfox97/pi-git-diff-reviewer.git /opt/diff-review \
    && cd /opt/diff-review \
    && npm ci \
    && npm run build \
    && npm prune --omit=dev \
    && npm link \
    && rm -rf /opt/diff-review/.git \
    && npm cache clean --force

# Optional: the az CLI plus its azure-devops extension, for ad-hoc Azure DevOps
# work in a shell. The azure-devops-* skills do not need it — they talk to the
# REST API with the Python standard library — so this is off by default because
# it adds roughly 900MB to the image.
RUN if [ "${INSTALL_AZURE_CLI}" = "true" ]; then \
      apt-get update \
      && apt-get install -y --no-install-recommends gnupg lsb-release \
      && mkdir -p /etc/apt/keyrings \
      && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc \
        | gpg --dearmor -o /etc/apt/keyrings/microsoft.gpg \
      && chmod 0644 /etc/apt/keyrings/microsoft.gpg \
      && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/microsoft.gpg] https://packages.microsoft.com/repos/azure-cli/ $(lsb_release -cs) main" \
        > /etc/apt/sources.list.d/azure-cli.list \
      && apt-get update \
      && apt-get install -y --no-install-recommends azure-cli \
      && rm -rf /var/lib/apt/lists/* \
      && az extension add --name azure-devops --system; \
    fi

COPY entrypoint.sh /usr/local/bin/portable-agent
RUN chmod 0755 /usr/local/bin/portable-agent \
    && mkdir -p /workspace /home/node/.claude /home/node/.codex /home/node/.pi/agent /home/node/.agents \
    && chown -R node:node /workspace /home/node

USER node
WORKDIR /workspace
ENTRYPOINT ["/usr/local/bin/portable-agent"]
