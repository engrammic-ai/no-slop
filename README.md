# no-slop

Quality enforcement for AI coding agents. Prevents shortcuts and slop.

## The Problem

AI coding agents take the path of least resistance:
- Workaround fixes instead of root cause fixes
- Lazy implementations (hardcoded values, skipped edge cases)
- Feature downgrades to "fix" bugs
- Copy-paste without adaptation

## The Solution

no-slop provides multi-stage quality gates:

1. **Intent Lock** - Capture task intent and acceptance criteria before execution
2. **State Monitor** - Detect pathological states (loops, regressions) during execution
3. **Diff Analysis** - AST analysis for obvious downgrades before applying changes
4. **Verifier** - Optional adversarial LLM review for high-stakes changes

## Installation

```bash
npm install @engrammic/no-slop
```

## Usage

```typescript
import { withNoSlop } from '@engrammic/no-slop'

const guardedLoop = withNoSlop(agentLoop, {
  rules: 'default',
  verifier: 'on-risky',
  onBlock: 'retry',
})
```

## License

Elastic License 2.0
