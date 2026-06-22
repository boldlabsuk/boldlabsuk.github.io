import { siteMeta } from './site.ts'
import type { InvolvementRoute, Opportunity, OpportunityType } from './types.ts'

export const involvementRoutes: InvolvementRoute[] = [
  {
    id: 'phd-students',
    title: 'Prospective PhD Students',
    shortTitle: 'PhD Students',
    href: '/opportunities#phd-students',
    summary:
      'Join through university and department processes while connecting your interests to institute research themes.',
    guidance: [
      'Review the research areas and supervisors whose work matches your interests.',
      'Follow the relevant university or department application process where applicable.',
      'Use the intake email if you want to share a short research fit statement before or during application.',
    ],
  },
  {
    id: 'visiting-students',
    title: 'Visiting Students',
    shortTitle: 'Visitors',
    href: '/opportunities#visiting-students',
    summary:
      'Spend a defined period in the institute to work on a focused research question with a BOLD host.',
    guidance: [
      'Include your current institution, proposed dates, and the research group you hope to work with.',
      'Share a concise project idea and relevant prior work.',
      'Duration, funding, and supervision fit can be discussed after initial contact.',
    ],
  },
  {
    id: 'masters-students',
    title: "Master's Students",
    shortTitle: "Master's",
    href: '/opportunities#masters-students',
    summary:
      'Work on supervised projects where capacity and research fit align with current institute priorities.',
    guidance: [
      'Describe the programme you are enrolled in and the project window you are seeking.',
      'Share technical interests, relevant coursework, and links to any code or writing.',
      'Project availability depends on supervision capacity.',
    ],
  },
  {
    id: 'engineers',
    title: 'Software Engineers / Research Engineers',
    shortTitle: 'Engineers',
    href: '/opportunities#engineers',
    summary:
      'Build the systems, infrastructure, evaluation tooling, and platforms that make institute-scale research possible.',
    guidance: [
      'Relevant experience includes ML systems, distributed training, data tooling, evaluation, web platforms, and research infrastructure.',
      'Current open roles are listed separately where available.',
      'General expressions of interest should include a CV, project links, and preferred work areas.',
    ],
  },
  {
    id: 'fellows',
    title: 'Fellows and Experienced Researchers',
    shortTitle: 'Fellows',
    href: '/opportunities#fellows',
    summary:
      'Collaborate, visit, lead ambitious research projects, or explore longer-term institute roles.',
    guidance: [
      'Include a short research statement and the institute themes you would contribute to.',
      'Share representative papers, projects, datasets, or research software.',
      'Use the intake email for visiting, collaboration, and longer-term interest.',
    ],
  },
  {
    id: 'collaborators',
    title: 'Collaborators',
    shortTitle: 'Collaborators',
    href: '/opportunities#collaborators',
    summary:
      'Start serious research collaborations with clear scientific motivation and mutual institutional fit.',
    guidance: [
      'Send a short description of the proposed collaboration and why BOLD is the right partner.',
      'Include relevant people, timing, expected outputs, and any funding or data considerations.',
      'Collaborations are reviewed for research fit, capacity, and responsible practice.',
    ],
  },
]

export const opportunities: Opportunity[] = [
  {
    id: 'research-engineer-expressions',
    title: 'Research Engineer Expressions of Interest',
    type: 'engineer',
    status: 'rolling',
    location: 'England / hybrid',
    summary:
      'Rolling expressions of interest for engineers with experience in ML systems, research infrastructure, evaluation tooling, and data platforms.',
    contactEmail: siteMeta.contactEmail,
  },
  {
    id: 'visiting-student-2026',
    title: 'Visiting Student Placements',
    type: 'visiting-student',
    status: 'open',
    location: 'BOLD Institute',
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
