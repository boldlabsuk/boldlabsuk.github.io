import { siteMeta } from './site.ts'
import type { Opportunity, OpportunityRoute, OpportunityType } from './types.ts'

export const opportunityRoutes: OpportunityRoute[] = [
  {
    slug: 'phd-students',
    title: 'PhD research',
    description:
      'For prospective PhD researchers whose interests connect with BOLD’s research.',
    prefillValue: 'phd-students',
  },
  {
    slug: 'visiting-students',
    title: 'a student visit',
    description: 'For students interested in a research visit with BOLD.',
    prefillValue: 'visiting-students',
  },
  {
    slug: 'masters-students',
    title: 'Master’s research',
    description:
      'For Master’s students interested in research connected to BOLD.',
    prefillValue: 'masters-students',
  },
  {
    slug: 'research-engineers',
    title: 'research engineering',
    description:
      'For engineers interested in building systems and tools that support BOLD’s research.',
    prefillValue: 'research-engineers',
  },
  {
    slug: 'collaborators',
    title: 'collaboration or affiliation',
    description:
      'For individuals, groups, companies, and institutions interested in research collaboration, including experienced researchers seeking visits or longer-term affiliations.',
    prefillValue: 'collaborators',
  },
]

export const opportunities: Opportunity[] = [
  {
    id: 'research-engineer-expressions',
    title: 'Research Engineer Expressions of Interest',
    type: 'engineer',
    status: 'rolling',
    location: 'UK / hybrid',
    summary:
      'Rolling expressions of interest for engineers with experience in ML systems, research infrastructure, evaluation tooling, and data platforms.',
    contactEmail: siteMeta.contactEmail,
  },
  {
    id: 'visiting-student-2026',
    title: 'Visiting Student Placements',
    type: 'visiting-student',
    status: 'open',
    location: 'BOLD Lab',
    deadline: '2026-09-30',
    summary:
      'A small number of visiting student placements will be considered for projects aligned with evaluation, agents, robotics, and AI for discovery.',
    contactEmail: siteMeta.contactEmail,
  },
]

export const opportunityTypeLabels: Record<OpportunityType, string> = {
  phd: 'PhD',
  'visiting-student': 'Visiting Student',
  masters: "Master's",
  engineer: 'Engineer',
  fellow: 'Fellow',
  collaboration: 'Collaboration',
  staff: 'Staff',
  other: 'Other',
}
