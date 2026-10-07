import { run } from "./shell.ts";
import { type NpmClient } from "./npm.ts";
import { AuthorError } from "./problems.ts";
import { RegistryValidationError, validateRegistry } from "./validate-registry.ts";

/** Run the same checks as Validate before a default-token bot PR is opened. */
export async function validateForReview(options: { client?: NpmClient; submissionId?: string } = {}): Promise<string> {
  console.log(run("npm", ["test"]));
  try {
    await validateRegistry({ online: true, changedOnly: true, client: options.client });
  } catch (error) {
    // Only the submitted artifact's known author actions belong on its issue.
    // Failures in other records, tests, transport, or tooling belong to maintainers.
    if (error instanceof RegistryValidationError && error.problems.every(
      (problem) => problem.id === options.submissionId && problem.error instanceof AuthorError,
    )) throw new AuthorError(error.message);
    throw error instanceof AuthorError ? new Error(error.message, { cause: error }) : error;
  }
  return "Inline validation passed: `npm test` and the checks from `node scripts/validate.ts --online --changed`. The default GITHUB_TOKEN does not trigger the PR validation workflow.";
}
