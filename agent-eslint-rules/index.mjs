import { noComments } from "./rules/no-comments.mjs";

/**
 * Local ESLint plugin holding agent-only rules.
 *
 * Add future agent-specific rules here as they are implemented.
 */
export default {
  meta: {
    name: "agent",
  },
  rules: {
    "no-comments": noComments,
  },
};
