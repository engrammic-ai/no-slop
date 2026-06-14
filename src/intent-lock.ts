/**
 * Intent Lock - Captures task intent and acceptance criteria before execution
 *
 * Forces the agent to declare:
 * - The root cause of the problem
 * - The approach to fix it
 * - What it will NOT do (constraints)
 */

export interface Intent {
  /** What is the root cause of this issue? */
  rootCause: string
  /** How will this fix address the root cause? */
  approach: string
  /** Explicit constraints - things the fix will NOT do */
  constraints: string[]
  /** Acceptance criteria - how do we know it's fixed? */
  acceptanceCriteria: string[]
}

export class IntentLock {
  private intent: Intent | null = null

  /**
   * Lock in the intent before execution begins
   */
  capture(intent: Intent): void {
    this.intent = intent
  }

  /**
   * Get the captured intent
   */
  get(): Intent | null {
    return this.intent
  }

  /**
   * Verify a diff against the declared intent
   * Returns violations if the diff contradicts declared constraints
   */
  verify(diff: string): string[] {
    if (!this.intent) {
      return ['No intent captured - cannot verify']
    }

    const violations: string[] = []

    // TODO: Implement intent verification
    // - Parse diff for removed/changed code
    // - Check against declared constraints
    // - Flag contradictions

    return violations
  }

  /**
   * Clear the lock for next task
   */
  clear(): void {
    this.intent = null
  }
}
