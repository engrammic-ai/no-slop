/**
 * Verifier - Optional adversarial LLM review for high-stakes changes
 *
 * Runs in a separate context with a skeptical prompt.
 * Only used for risky changes or when explicitly requested.
 */

export interface VerificationResult {
  passed: boolean
  confidence: number
  issues: VerificationIssue[]
}

export interface VerificationIssue {
  severity: 'critical' | 'major' | 'minor'
  category: 'shortcut' | 'regression' | 'incomplete' | 'risky'
  description: string
  suggestion?: string
}

export interface VerifierConfig {
  /** Model to use for verification (should be cheap/fast) */
  model?: string
  /** Custom system prompt for the verifier */
  systemPrompt?: string
}

const DEFAULT_SYSTEM_PROMPT = `You are a skeptical code reviewer. Your job is to find shortcuts, regressions, and incomplete fixes.

Look for:
1. SHORTCUTS - Is this a workaround instead of a proper fix? Does it patch symptoms instead of root cause?
2. REGRESSIONS - Does this remove functionality, error handling, or edge case coverage?
3. INCOMPLETE - Does this leave work undone? Are there TODOs or placeholders?
4. RISKY - Does this introduce security issues, performance problems, or brittleness?

Be adversarial. Assume the code is guilty until proven innocent.
Output JSON with: { passed: boolean, confidence: 0-1, issues: [...] }`

export class Verifier {
  private config: VerifierConfig

  constructor(config: VerifierConfig = {}) {
    this.config = {
      systemPrompt: DEFAULT_SYSTEM_PROMPT,
      ...config,
    }
  }

  /**
   * Verify a change against the original task
   */
  async verify(
    task: string,
    diff: string,
    _context?: string,
  ): Promise<VerificationResult> {
    // TODO: Implement LLM verification
    // 1. Build prompt with task + diff + context
    // 2. Call LLM with skeptical system prompt
    // 3. Parse structured response
    // 4. Return verification result

    console.log('Verifier called with task:', task.slice(0, 50))
    console.log('Diff length:', diff.length)

    return {
      passed: true,
      confidence: 0,
      issues: [],
    }
  }

  /**
   * Determine if a change is "risky" and needs verification
   */
  isRisky(diff: string, files: string[]): boolean {
    const riskyPatterns = [
      /auth/i,
      /password/i,
      /secret/i,
      /token/i,
      /payment/i,
      /billing/i,
      /security/i,
      /permission/i,
      /admin/i,
    ]

    const riskyFiles = files.some(f =>
      riskyPatterns.some(p => p.test(f))
    )

    const riskyContent = riskyPatterns.some(p => p.test(diff))

    return riskyFiles || riskyContent
  }
}
