export type NavigationItem = {
  label: string
  href: string
}

export type PersonLinkSet = {
  website?: string
  googleScholar?: string
  linkedin?: string
  github?: string
  twitter?: string
  bluesky?: string
  email?: string
}

export type Person = {
  slug: string
  name: string
  role: string
  group: string
  affiliation?: string
  bio: string
  image?: string
  researchAreas: string[]
  links?: PersonLinkSet
  featured?: boolean
  alumni?: boolean
}

export type NewsPostType =
  | 'blog'
  | 'news'
  | 'article'
  | 'announcement'
  | 'research-update'
  | 'social-post'

export type NewsPost = {
  slug: string
  title: string
  type: NewsPostType
  date: string
  excerpt: string
  authorIds?: string[]
  tags: string[]
  image?: string
  featured?: boolean
  externalUrl?: string
  content?: string
  socialEmbedUrl?: string
}

export type PaperType =
  | 'conference'
  | 'journal'
  | 'preprint'
  | 'workshop'
  | 'technical-report'
  | 'dataset'
  | 'benchmark'
  | 'software'
  | 'thesis'
  | 'other'

export type Paper = {
  id: string
  title: string
  authors: string[]
  authorIds?: string[]
  venue?: string
  year: number
  date?: string
  abstract?: string
  summary?: string
  researchAreas: string[]
  paperType: PaperType
  featured?: boolean
  links: {
    paper?: string
    pdf?: string
    code?: string
    project?: string
    bibtex?: string
  }
}

export type OpportunityType =
  | 'phd'
  | 'visiting-student'
  | 'masters'
  | 'engineer'
  | 'fellow'
  | 'collaboration'
  | 'staff'
  | 'other'

export type Opportunity = {
  id: string
  title: string
  type: OpportunityType
  status: 'open' | 'closed' | 'rolling'
  location?: string
  deadline?: string
  summary: string
  link?: string
  contactEmail?: string
}

export type OpportunityRoute = {
  slug: string
  title: string
  shortTitle: string
  shortSummary: string
  positioning: string
  status: string
  location?: string
  timing?: string
  formalApplicationPath: string
  prefillValue: string
  primaryActionLabel: 'Express interest'
  whoThisIsFor: string[]
  whatWeLookFor: string[]
  howThisWorks: string
  formComingSoon: string
  metadata: {
    title: string
    description: string
  }
}

export type ExpressionOfInterestFormConfig = {
  formUrl?: string
  formId?: string
  routeParameterName: string
}

export type InvolvementRoute = {
  id: string
  title: string
  shortTitle: string
  href: string
  summary: string
  guidance: string[]
}
