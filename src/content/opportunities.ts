import { siteMeta } from './site.ts'
import type {
  InvolvementRoute,
  Opportunity,
  OpportunityRoute,
  OpportunityType,
} from './types.ts'

export const opportunityRoutes: OpportunityRoute[] = [
  {
    slug: 'phd-students',
    title: 'PhD Students',
    shortTitle: 'PhD Students',
    shortSummary:
      'Connect your doctoral research interests with BOLD before or during formal university application routes.',
    positioning:
      'For prospective doctoral researchers who want to explore whether their research direction fits BOLD.',
    status: 'Rolling interest',
    location: 'Oxford, UCL, Imperial, or affiliated BOLD groups',
    timing: 'Formal programme timelines vary by university and department',
    formalApplicationPath:
      'Expressing interest in BOLD is not a PhD application; formal admission remains through the relevant university or department.',
    prefillValue: 'phd-students',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      'Prospective doctoral students developing a focused AI research agenda.',
      'Applicants considering possible supervisors or groups connected to BOLD without needing to choose from a fixed list.',
      'Candidates preparing for or already navigating formal university processes.',
    ],
    whatWeLookFor: [
      'Clear research motivation connected to BOLD Research Directions.',
      'Evidence of technical depth, research potential, and independent thinking.',
      'Realistic timing and awareness of the relevant Formal Application Path.',
    ],
    howThisWorks:
      'Share an Expression of Interest so BOLD can review research fit and possible supervision alignment. You may still need to complete university, departmental, or funding applications separately.',
    formPrompt:
      'Useful responses mention research interests, current or proposed programme timing, possible supervisors or groups, and why BOLD is the right fit.',
    formComingSoon:
      'The embedded Expression of Interest form for PhD Students is being prepared. Check back soon to share your fit statement, timing, links, and CV.',
    metadata: {
      title: 'PhD Students Expression of Interest | BOLD Lab',
      description:
        'Express interest in doctoral research connected to BOLD while distinguishing the intake from formal university PhD applications.',
    },
  },
  {
    slug: 'visiting-students',
    title: 'Visiting Students',
    shortTitle: 'Visiting Students',
    shortSummary:
      'Explore a focused research visit with a BOLD host, shaped around supervision fit and timing.',
    positioning:
      'For students at another institution who want a time-bound research visit with a clear project shape.',
    status: 'Rolling interest',
    location: 'In-person visit with a BOLD host where capacity allows',
    timing: 'Proposed visit dates and duration should be included',
    formalApplicationPath:
      'Expressing interest helps BOLD assess host fit; any institutional visiting process, funding approval, or placement paperwork remains separate.',
    prefillValue: 'visiting-students',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      'Students enrolled at another institution seeking a defined BOLD visit.',
      'Candidates with a focused project idea and proposed timing.',
      'Visitors who can identify relevant BOLD research groups or host fit.',
    ],
    whatWeLookFor: [
      'A practical project scope for the proposed visit window.',
      'Evidence of preparation, research fit, and relevant prior work.',
      'Realistic funding, timing, and host-capacity expectations.',
    ],
    howThisWorks:
      'Use the Expression of Interest to outline the visit, project, timing, and possible host fit. Formal visiting arrangements may still need to be handled through institutional processes.',
    formPrompt:
      'Useful responses include your current institution and programme, proposed visit dates and duration, a focused project idea, and any possible BOLD host or group.',
    formComingSoon:
      'The embedded Expression of Interest form for Visiting Students is being prepared. Check back soon to share proposed dates, project shape, host fit, links, and CV.',
    metadata: {
      title: 'Visiting Students Expression of Interest | BOLD Lab',
      description:
        'Express interest in a focused student research visit with BOLD and understand how it relates to formal visiting arrangements.',
    },
  },
  {
    slug: 'masters-students',
    title: "Master's Students",
    shortTitle: "Master's",
    shortSummary:
      'Share interest in supervised projects where programme timing, capacity, and research fit align.',
    positioning:
      "For Master's students looking for BOLD-aligned project supervision or research project fit.",
    status: 'Rolling interest',
    location: 'BOLD groups where supervision capacity is available',
    timing: 'Project windows depend on programme requirements and supervisor capacity',
    formalApplicationPath:
      'Expressing interest in BOLD does not replace your university programme, module, or project allocation process.',
    prefillValue: 'masters-students',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      "Master's students seeking a research or technical project connected to BOLD.",
      'Students with a known project window and programme constraints.',
      'Candidates who can share relevant coursework, code, writing, or prior projects.',
    ],
    whatWeLookFor: [
      'Strong fit with current BOLD research priorities.',
      'Evidence of technical preparation for the proposed project shape.',
      'A realistic view of supervision capacity and programme timelines.',
    ],
    howThisWorks:
      'Submit an Expression of Interest so BOLD can understand your programme, project window, and fit. Formal project allocation or academic approval remains with the relevant programme.',
    formPrompt:
      "Useful responses include your current Master's programme, project window, relevant coursework or prior projects, and the project shape you are seeking.",
    formComingSoon:
      "The embedded Expression of Interest form for Master's Students is being prepared. Check back soon to share your programme, project window, technical interests, links, and CV.",
    metadata: {
      title: "Master's Students Expression of Interest | BOLD Lab",
      description:
        "Express interest in BOLD-aligned Master's projects while keeping formal project allocation separate.",
    },
  },
  {
    slug: 'research-engineers',
    title: 'Research Engineers',
    shortTitle: 'Research Engineers',
    shortSummary:
      'Build ML systems, research infrastructure, evaluation tooling, data platforms, and web or platform systems for frontier research.',
    positioning:
      'For engineers who want technical systems work to sit close to ambitious AI research.',
    status: 'Rolling interest',
    location: 'Hybrid or in-person depending on role shape and team needs',
    timing: 'Rolling interest, with specific advertised roles listed separately when open',
    formalApplicationPath:
      'This intake is not a job application; any formal hiring process for an advertised role will be separate.',
    prefillValue: 'research-engineers',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      'Engineers with experience in ML systems, research infrastructure, evaluation, data tooling, or platform work.',
      'Builders who can work with researchers on fast-moving technical problems.',
      'Candidates interested in future roles even when no formal vacancy is open.',
    ],
    whatWeLookFor: [
      'Evidence of reliable systems, infrastructure, or research tooling shipped in practice.',
      'Strong code or project examples and clear technical judgement.',
      'Interest in enabling research rather than only maintaining generic software.',
    ],
    howThisWorks:
      'Use the Expression of Interest to share the technical areas, projects, links, and working-mode constraints that would help BOLD assess fit. Formal employment steps happen only through a separate hiring process.',
    formComingSoon:
      'The embedded Expression of Interest form for Research Engineers is being prepared. Check back soon to share systems interests, project links, availability, working mode, and CV.',
    metadata: {
      title: 'Research Engineers Expression of Interest | BOLD Lab',
      description:
        'Express interest in research engineering at BOLD across ML systems, infrastructure, evaluation tooling, data platforms, and platform work.',
    },
  },
  {
    slug: 'fellows',
    title: 'Fellows and Experienced Researchers',
    shortTitle: 'Fellows',
    shortSummary:
      'Explore visiting, collaboration, fellowship, or longer-term research relationships with BOLD.',
    positioning:
      "For researchers with an established agenda who see a serious fit with BOLD's scientific programme.",
    status: 'Rolling interest',
    location: 'Flexible by route shape, host fit, and institutional arrangement',
    timing: 'Timing depends on role shape, funding route, and host capacity',
    formalApplicationPath:
      'An Expression of Interest starts a fit conversation; fellowship, visiting, employment, or institutional routes may require separate formal processes.',
    prefillValue: 'fellows',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      'Researchers with a mature agenda connected to BOLD Research Directions.',
      'Fellows, visitors, or experienced researchers considering a BOLD relationship.',
      'People exploring collaboration, contribution, or longer-term affiliation.',
    ],
    whatWeLookFor: [
      'A distinctive research agenda and clear proposed contribution to BOLD.',
      'Representative outputs such as papers, software, datasets, projects, or talks.',
      'A practical view of timing, route shape, and institutional constraints.',
    ],
    howThisWorks:
      'Submit an Expression of Interest to outline your agenda, proposed contribution, timing, and route shape. Any formal fellowship, visiting, institutional, or employment path remains separate.',
    formComingSoon:
      'The embedded Expression of Interest form for Fellows and Experienced Researchers is being prepared. Check back soon to share your agenda, outputs, route shape, timing, and CV.',
    metadata: {
      title: 'Fellows and Experienced Researchers Expression of Interest | BOLD Lab',
      description:
        'Express interest in a fellowship, visiting, collaboration, or longer-term research relationship with BOLD.',
    },
  },
  {
    slug: 'collaborators',
    title: 'Collaborators',
    shortTitle: 'Collaborators',
    shortSummary:
      'Start a serious research collaboration with clear scientific motivation and mutual fit.',
    positioning:
      'For individuals, groups, companies, or institutions proposing a collaboration with BOLD.',
    status: 'Rolling interest',
    location: 'Collaboration working mode depends on the proposed relationship',
    timing: 'Include timing, expected outputs, and any funding, data, or partnership considerations',
    formalApplicationPath:
      'A Collaborator Expression of Interest is collaboration intake, not a job, student, or admissions application.',
    prefillValue: 'collaborators',
    primaryActionLabel: 'Express interest',
    whoThisIsFor: [
      'Individuals, groups, companies, or institutions with a BOLD-aligned collaboration idea.',
      'Potential collaborators with clear scientific motivation and relevant people identified.',
      'Partners who can describe expected outputs, timing, and practical constraints.',
    ],
    whatWeLookFor: [
      'A specific collaboration proposal rather than a generic partnership inquiry.',
      'Strong scientific fit with BOLD and credible relevant expertise.',
      'Clarity on people, outputs, timing, and any funding or data considerations.',
    ],
    howThisWorks:
      'Submit a Collaborator Expression of Interest so BOLD can assess collaboration fit and capacity. This route is organization-aware and does not treat a CV as the primary evidence by default.',
    formComingSoon:
      'The embedded Expression of Interest form for Collaborators is being prepared. Check back soon to share the proposed collaboration, scientific motivation, relevant people, timing, and links.',
    metadata: {
      title: 'Collaborators Expression of Interest | BOLD Lab',
      description:
        'Express collaboration interest in BOLD as an individual, group, company, or institution without treating the route as a job application.',
    },
  },
]

export const involvementRoutes: InvolvementRoute[] = opportunityRoutes.map((route) => ({
  id: route.slug,
  title: route.title,
  shortTitle: route.shortTitle,
  href: `/opportunities/${route.slug}`,
  summary: route.shortSummary,
  guidance: route.whoThisIsFor,
}))

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
