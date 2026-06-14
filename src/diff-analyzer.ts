/**
 * Diff Analyzer - AST/diff analysis for obvious quality issues
 *
 * Detects:
 * - Removed error handling without replacement
 * - Complexity reduction without test changes
 * - Hardcoded values replacing dynamic ones
 * - Deleted functionality not replaced
 */

export type Severity = 'block' | 'warn' | 'info'

export interface DiffVerdict {
  severity: Severity
  issues: DiffIssue[]
}

export interface DiffIssue {
  severity: Severity
  type: 'removed-error-handling' | 'complexity-reduction' | 'hardcoded-value' | 'deleted-functionality' | 'other'
  file: string
  line?: number
  description: string
}

export interface DiffAnalyzerConfig {
  /** Patterns that indicate error handling (regex strings) */
  errorHandlingPatterns: string[]
  /** Patterns that indicate hardcoded values */
  hardcodedPatterns: string[]
}

const DEFAULT_CONFIG: DiffAnalyzerConfig = {
  errorHandlingPatterns: [
    'try\\s*{',
    'catch\\s*\\(',
    '\\.catch\\(',
    'if\\s*\\([^)]*(?:err|error|null|undefined)',
    'throw\\s+',
  ],
  hardcodedPatterns: [
    '(?:localhost|127\\.0\\.0\\.1|0\\.0\\.0\\.0)',
    '(?:password|secret|key)\\s*[=:]\\s*["\'][^"\']+["\']',
  ],
}

export class DiffAnalyzer {
  private config: DiffAnalyzerConfig

  constructor(config: Partial<DiffAnalyzerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Analyze a diff and return verdict
   */
  analyze(diff: string): DiffVerdict {
    const issues: DiffIssue[] = []

    // Parse diff into hunks
    const hunks = this.parseDiff(diff)

    for (const hunk of hunks) {
      // Check for removed error handling
      issues.push(...this.checkRemovedErrorHandling(hunk))

      // Check for hardcoded values
      issues.push(...this.checkHardcodedValues(hunk))
    }

    const severity = this.worstSeverity(issues)

    return { severity, issues }
  }

  private parseDiff(_diff: string): Array<{ file: string; removed: string[]; added: string[] }> {
    // TODO: Implement proper diff parsing
    return []
  }

  private checkRemovedErrorHandling(hunk: { file: string; removed: string[]; added: string[] }): DiffIssue[] {
    const issues: DiffIssue[] = []

    for (const pattern of this.config.errorHandlingPatterns) {
      const regex = new RegExp(pattern)
      const removedCount = hunk.removed.filter(line => regex.test(line)).length
      const addedCount = hunk.added.filter(line => regex.test(line)).length

      if (removedCount > addedCount) {
        issues.push({
          severity: 'warn',
          type: 'removed-error-handling',
          file: hunk.file,
          description: `Removed error handling (${pattern}) without replacement`,
        })
      }
    }

    return issues
  }

  private checkHardcodedValues(hunk: { file: string; removed: string[]; added: string[] }): DiffIssue[] {
    const issues: DiffIssue[] = []

    for (const pattern of this.config.hardcodedPatterns) {
      const regex = new RegExp(pattern, 'i')
      for (const line of hunk.added) {
        if (regex.test(line)) {
          issues.push({
            severity: 'warn',
            type: 'hardcoded-value',
            file: hunk.file,
            description: `Potential hardcoded value: ${pattern}`,
          })
        }
      }
    }

    return issues
  }

  private worstSeverity(issues: DiffIssue[]): Severity {
    if (issues.some(i => i.severity === 'block')) return 'block'
    if (issues.some(i => i.severity === 'warn')) return 'warn'
    if (issues.length > 0) return 'info'
    return 'info'
  }
}
