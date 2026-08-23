/**
 * Local ESLint rule: report every comment found in a source file.
 *
 * This rule is intended for the agent-only ESLint configuration. It flags all
 * comment styles (`//`, `/* *\/`, and `/** *\/`) so that AI-generated source
 * files are kept comment-free.
 */
export const noComments = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Disallow all comments in source files.",
    },
    schema: [],
    messages: {
      unexpected: "Agent-authored code must be self-documenting. Replace comments with clearer names, smaller functions, or extracted helpers.",
    },
  },
  create(context) {
    const sourceCode = context.sourceCode ?? context.getSourceCode();

    return {
      Program() {
        for (const comment of sourceCode.getAllComments()) {
          context.report({ node: comment, messageId: "unexpected" });
        }
      },
    };
  },
};
