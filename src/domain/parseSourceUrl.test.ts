import { describe, it, expect } from 'vitest'
import { parseSourceUrl } from './parseSourceUrl'

describe('parseSourceUrl', () => {
  it('returns invalid for empty or malformed input', () => {
    expect(parseSourceUrl('')).toBe('invalid')
    expect(parseSourceUrl('   ')).toBe('invalid')
    expect(parseSourceUrl('not a url')).toBe('invalid')
    expect(parseSourceUrl('ftp://example.com/foo')).toBe('invalid')
  })

  it('parses Jira browse URLs', () => {
    const result = parseSourceUrl('https://acme.atlassian.net/browse/MOB-101')
    expect(result).toEqual({
      url: 'https://acme.atlassian.net/browse/MOB-101',
      system: 'jira',
      id: 'MOB-101',
    })
  })

  it('parses Linear issue URLs', () => {
    const result = parseSourceUrl('https://linear.app/acme/issue/ENG-42')
    expect(result).toEqual({
      url: 'https://linear.app/acme/issue/ENG-42',
      system: 'linear',
      id: 'ENG-42',
    })
  })

  it('parses GitHub issue URLs', () => {
    const result = parseSourceUrl('https://github.com/org/repo/issues/12')
    expect(result).toEqual({
      url: 'https://github.com/org/repo/issues/12',
      system: 'github',
      id: 'org/repo#12',
    })
  })

  it('parses GitLab issue URLs', () => {
    const result = parseSourceUrl('https://gitlab.com/group/project/-/issues/7')
    expect(result).toEqual({
      url: 'https://gitlab.com/group/project/-/issues/7',
      system: 'gitlab',
      id: '7',
    })
  })

  it('parses self-hosted GitLab issue URLs', () => {
    const result = parseSourceUrl('https://git.company.com/team/app/-/issues/3')
    expect(result).toEqual({
      url: 'https://git.company.com/team/app/-/issues/3',
      system: 'gitlab',
      id: '3',
    })
  })

  it('parses Asana task URLs', () => {
    const result = parseSourceUrl('https://app.asana.com/0/123/4567890123456')
    expect(result).toMatchObject({ system: 'asana', url: expect.stringContaining('asana.com') })
  })

  it('parses ClickUp task URLs', () => {
    const result = parseSourceUrl('https://app.clickup.com/t/abc123')
    expect(result).toMatchObject({ system: 'clickup' })
  })

  it('parses Monday URLs', () => {
    const result = parseSourceUrl('https://acme.monday.com/boards/1/pulses/2')
    expect(result).toMatchObject({ system: 'monday', url: expect.stringContaining('monday.com') })
  })

  it('parses Trello card URLs', () => {
    const result = parseSourceUrl('https://trello.com/c/Ab12CdEf')
    expect(result).toEqual({
      url: 'https://trello.com/c/Ab12CdEf',
      system: 'trello',
      id: 'Ab12CdEf',
    })
  })

  it('returns url-only for unknown hosts', () => {
    expect(parseSourceUrl('https://example.com/work/99')).toEqual({
      url: 'https://example.com/work/99',
    })
  })

  it('adds https when protocol is omitted', () => {
    const result = parseSourceUrl('github.com/org/repo/issues/1')
    expect(result).toMatchObject({ system: 'github', id: 'org/repo#1' })
  })
})
