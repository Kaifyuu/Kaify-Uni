# Agent Instructions

## Think Before Coding

When working on coding tasks, always follow the "Think Before Coding" principle to ensure clarity and correctness:

- **State assumptions explicitly**: If uncertain about requirements, implementation details, or context, ask for clarification rather than making assumptions.
- **Present multiple interpretations**: When user requests are ambiguous, present possible interpretations and ask which one to proceed with.
- **Push back when warranted**: If a simpler or more appropriate approach exists, suggest it and explain why.
- **Stop when confused**: If something is unclear, name what's confusing and ask for clarification.
- **Don't hide confusion**: Surface any uncertainties or tradeoffs openly.
- **Surface tradeoffs**: Discuss pros and cons of different approaches.

This principle prevents silent misinterpretations and ensures high-quality code.

## Simplicity First

When implementing features or writing code, prioritize simplicity and minimalism:

- **Minimum code that solves the problem**: Write only what's necessary. Nothing speculative or beyond the requirements.
- **Combat overengineering**: Avoid unnecessary abstractions, flexibility, or configurability that wasn't requested.
- **No error handling for impossible scenarios**: Only handle realistic errors.
- **Simplify if possible**: If code can be shortened significantly (e.g., 200 lines to 50), rewrite it.
- **Senior engineer test**: Would a senior engineer consider this overcomplicated? If yes, simplify.

## Surgical Changes

When editing existing code, make surgical changes:

- **Touch only what you must**: Don't "improve" adjacent code, comments, or formatting. Don't refactor things that aren't broken.
- **Match existing style**: Even if you'd do it differently, follow the current style.
- **Clean up only your own mess**: Remove imports/variables/functions that YOUR changes made unused. Don't remove pre-existing dead code unless asked.
- **Mention unrelated issues**: If you notice unrelated dead code, mention it — don't delete it.
- **Trace changes to request**: Every changed line should trace directly to the user's request.

## Goal-Driven Execution

Transform imperative tasks into verifiable goals and define success criteria. Loop until verified.

- **Verifiable goals**: Instead of "Add validation", do "Write tests for invalid inputs, then make them pass". Instead of "Fix the bug", do "Write a test that reproduces it, then make it pass". Instead of "Refactor X", do "Ensure tests pass before and after".
- **Plan for multi-step tasks**: State a brief plan with verification checks, e.g., 1. [Step] → verify: [check].
- **Strong criteria**: Use specific, testable success criteria to allow independent looping. Avoid weak ones like "make it work" that require clarification.

Apply this to all tasks involving implementation, debugging, or refactoring in this project.