// models/team.ts

import { Team, TeamMinimal } from '@/lib/types'

export const getTeamSlug = (team: TeamMinimal): string =>
  team.name.toLowerCase().replace(/\s+/g, '').slice(0, 6)

export const isTeamInMatch = (teamId: number, match: { team_1: number; team_2: number }): boolean =>
  match.team_1 === teamId || match.team_2 === teamId
