import type { Source } from '../schema/types'

export type ParseSourceUrlResult = Source | 'invalid'

function tryParseUrl(raw: string): URL | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  try {
    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed)
    if (hasScheme && !/^https?:\/\//i.test(trimmed)) return null
    const withProtocol = hasScheme ? trimmed : `https://${trimmed}`
    const url = new URL(withProtocol)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    return url
  } catch {
    return null
  }
}

/**
 * Parse a tracker URL into a Source object. Empty/whitespace-only input is invalid
 * (use null source on save when clearing the link field).
 */
export function parseSourceUrl(raw: string): ParseSourceUrlResult {
  const url = tryParseUrl(raw)
  if (!url) return 'invalid'

  const href = url.href
  const host = url.hostname.toLowerCase()
  const path = url.pathname

  const jiraMatch =
    host.endsWith('.atlassian.net') && path.match(/^\/browse\/([A-Z][A-Z0-9]+-\d+)/i)
  if (jiraMatch) {
    return { url: href, system: 'jira', id: jiraMatch[1].toUpperCase() }
  }

  if (host === 'linear.app' || host.endsWith('.linear.app')) {
    const linearMatch = path.match(/\/issue\/([^/]+)/)
    if (linearMatch) {
      return { url: href, system: 'linear', id: linearMatch[1] }
    }
  }

  if (host === 'github.com') {
    const ghMatch = path.match(/^\/([^/]+)\/([^/]+)\/issues\/(\d+)/)
    if (ghMatch) {
      return { url: href, system: 'github', id: `${ghMatch[1]}/${ghMatch[2]}#${ghMatch[3]}` }
    }
  }

  const gitlabMatch = path.match(/\/-\/issues\/(\d+)/)
  if (gitlabMatch) {
    return { url: href, system: 'gitlab', id: gitlabMatch[1] }
  }

  if (host === 'app.asana.com') {
    const segments = path.split('/').filter(Boolean)
    const id = segments[segments.length - 1] ?? path
    return { url: href, system: 'asana', id }
  }

  if (host === 'app.clickup.com') {
    const segments = path.split('/').filter(Boolean)
    const id = segments[segments.length - 1] ?? path
    return { url: href, system: 'clickup', id }
  }

  if (host.endsWith('.monday.com')) {
    return { url: href, system: 'monday', id: path }
  }

  const trelloMatch = host === 'trello.com' && path.match(/^\/c\/([a-zA-Z0-9]+)/)
  if (trelloMatch) {
    return { url: href, system: 'trello', id: trelloMatch[1] }
  }

  return { url: href }
}

export function sourceOpenLabel(system?: string): string {
  switch (system) {
    case 'jira':
      return 'Open in Jira'
    case 'linear':
      return 'Open in Linear'
    case 'github':
      return 'Open in GitHub'
    case 'gitlab':
      return 'Open in GitLab'
    case 'asana':
      return 'Open in Asana'
    case 'clickup':
      return 'Open in ClickUp'
    case 'monday':
      return 'Open in Monday'
    case 'trello':
      return 'Open in Trello'
    default:
      return 'Open external link'
  }
}
