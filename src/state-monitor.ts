/**
 * State Monitor - Detects pathological agent states during execution
 *
 * Catches:
 * - Infinite loops (same action repeated)
 * - Regression cycles (fix breaks, undo, re-break)
 * - Stuck states (no progress after N turns)
 */

export type PathologicalState =
  | { type: 'loop'; pattern: string; count: number }
  | { type: 'regression'; file: string; cycles: number }
  | { type: 'stuck'; turns: number }

export interface StateMonitorConfig {
  /** Max times same action can repeat before flagging loop */
  maxRepeat: number
  /** Max regression cycles before flagging */
  maxRegressions: number
  /** Max turns without progress before flagging stuck */
  maxStuckTurns: number
}

const DEFAULT_CONFIG: StateMonitorConfig = {
  maxRepeat: 3,
  maxRegressions: 2,
  maxStuckTurns: 5,
}

export class StateMonitor {
  private config: StateMonitorConfig
  private actionHistory: string[] = []
  private fileVersions: Map<string, string[]> = new Map()
  private turnsSinceProgress = 0

  constructor(config: Partial<StateMonitorConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  /**
   * Record an action and check for pathological states
   */
  recordAction(action: string): PathologicalState | null {
    this.actionHistory.push(action)

    // Check for loops
    const loop = this.detectLoop()
    if (loop) return loop

    return null
  }

  /**
   * Record a file change and check for regressions
   */
  recordFileChange(file: string, content: string): PathologicalState | null {
    const versions = this.fileVersions.get(file) || []

    // Check if we've seen this exact content before (regression)
    const previousIndex = versions.indexOf(content)
    if (previousIndex !== -1 && versions.length - previousIndex >= this.config.maxRegressions) {
      return { type: 'regression', file, cycles: versions.length - previousIndex }
    }

    versions.push(content)
    this.fileVersions.set(file, versions)
    this.turnsSinceProgress = 0

    return null
  }

  /**
   * Mark a turn with no progress
   */
  recordNoProgress(): PathologicalState | null {
    this.turnsSinceProgress++
    if (this.turnsSinceProgress >= this.config.maxStuckTurns) {
      return { type: 'stuck', turns: this.turnsSinceProgress }
    }
    return null
  }

  private detectLoop(): PathologicalState | null {
    const recent = this.actionHistory.slice(-this.config.maxRepeat)
    if (recent.length < this.config.maxRepeat) return null

    const allSame = recent.every(a => a === recent[0])
    if (allSame) {
      return { type: 'loop', pattern: recent[0], count: this.config.maxRepeat }
    }

    return null
  }

  /**
   * Reset monitor for new task
   */
  reset(): void {
    this.actionHistory = []
    this.fileVersions.clear()
    this.turnsSinceProgress = 0
  }
}
