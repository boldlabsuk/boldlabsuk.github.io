import { opportunityRoutes, people, siteMeta } from '../content.ts'

export type Route =
  | { name: 'home' }
  | { name: 'people'; slug?: string }
  | { name: 'opportunities' }
  | { name: 'opportunity-route'; slug: string }
  | { name: 'not-found' }

export type Meta = {
  title: string
  description: string
}

export function parseRoute(pathname: string): Route {
  const path = pathname.replace(/\/+$/, '') || '/'
  const segments = path.split('/').filter(Boolean)

  if (path === '/') {
    return { name: 'home' }
  }

  if (segments[0] === 'people') {
    return { name: 'people', slug: segments[1] }
  }

  if (segments.length === 1 && segments[0] === 'opportunities') {
    return { name: 'opportunities' }
  }

  if (segments.length === 2 && segments[0] === 'opportunities') {
    const opportunityRoute = opportunityRoutes.find(
      (route) => route.slug === segments[1],
    )

    return opportunityRoute
      ? { name: 'opportunity-route', slug: opportunityRoute.slug }
      : { name: 'not-found' }
  }

  return { name: 'not-found' }
}

export function getActiveSection(route: Route) {
  if (route.name === 'home' || route.name === 'not-found') {
    return '/'
  }

  if (route.name === 'opportunity-route') {
    return '/opportunities'
  }

  return `/${route.name}`
}

export function getRouteMeta(route: Route): Meta {
  if (route.name === 'people' && route.slug) {
    const person = people.find((item) => item.slug === route.slug)

    return person
      ? {
          title: `${person.name} | ${siteMeta.name}`,
          description: `${person.role}. ${person.bio}`,
        }
      : {
          title: `Person Not Found | ${siteMeta.name}`,
          description: 'The requested person profile could not be found.',
        }
  }

  if (route.name === 'opportunity-route') {
    const opportunityRoute = opportunityRoutes.find(
      (item) => item.slug === route.slug,
    )

    return opportunityRoute
      ? opportunityRoute.metadata
      : {
          title: `Opportunity Route Not Found | ${siteMeta.name}`,
          description: 'The requested Opportunity Route could not be found.',
        }
  }

  const routeMeta: Record<Route['name'], Meta> = {
    home: {
      title: `Home | ${siteMeta.name}`,
      description: siteMeta.description,
    },
    people: {
      title: `Our People | ${siteMeta.name}`,
      description:
        'Meet the researchers, engineers, students, fellows, and collaborators building the institute.',
    },
    opportunities: {
      title: `Opportunities | ${siteMeta.name}`,
      description: 'Join, visit, collaborate, or work with the institute.',
    },
    'opportunity-route': {
      title: `Opportunity Route | ${siteMeta.name}`,
      description: 'Express interest in joining, visiting, or collaborating with BOLD.',
    },
    'not-found': {
      title: `Page Not Found | ${siteMeta.name}`,
      description: 'The requested page could not be found.',
    },
  }

  return routeMeta[route.name]
}
