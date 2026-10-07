/** Only explicit author actions are safe to publish on a submission issue.
 * Transport, tooling, registry state, and unexpected failures stay with maintainers.
 */
export class AuthorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthorError";
  }
}
