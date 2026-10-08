import { run } from "./shell.ts";
import { type NpmClient } from "./npm.ts";
import { AuthorError } from "./problems.ts";
import { RegistryValidationError, validateRegistry } from "./validate-registry.ts";

/** Check artifacts before opening a bot PR; submission overviews can be completed in review. */
export async function validateForReview(options: { client?: NpmClient; submissionId?: string } = {}): Promise<string> {
  console.log(run("npm", ["test"]));
  try {
    await validateRegistry({
      online: true, changedOnly: true, client: options.client,
      overviewPendingFor: options.submissionId,
    });
  } catch (error) {
    // Only the submitted artifact's known author actions belong on its issue.
    // Failures in other records, tests, transport, or tooling belong to maintainers.
    if (error instanceof RegistryValidationError && error.problems.every(
      (problem) => problem.id === options.submissionId && problem.error instanceof AuthorError,
    )) throw new AuthorError(error.message);
    throw error instanceof AuthorError ? new Error(error.message, { cause: error }) : error;
  }
  const overviewNote = options.submissionId
    ? " A missing overview can be completed during review; publication requires an author or registry overview."
    : "";
  return `Inline validation passed: tests and artifact checks.${overviewNote} Run \`node scripts/validate.ts --online --changed\` on the completed listing before merging. The default GITHUB_TOKEN does not trigger the PR validation workflow.`;
}
