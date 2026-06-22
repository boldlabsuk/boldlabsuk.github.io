import { newsPosts, people, siteMeta } from '../content'

export type Route =
  | { name: 'home' }
  | { name: 'people'; slug?: string }
  | { name: 'news'; slug?: string }
  | { name: 'papers' }
  | { name: 'opportunities' }
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

  if (segments[0] === 'news') {
    return { name: 'news', slug: segments[1] }
  }

  if (segments.length === 1 && segments[0] === 'papers') {
    return { name: 'papers' }
  }

  if (segments.length === 1 && segments[0] === 'opportunities') {
    return { name: 'opportunities' }
  }

  return { name: 'not-found' }
}

export function getActiveSection(route: Route) {
  if (route.name === 'home' || route.name === 'not-found') {
    return '/'
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

  if (route.name === 'news' && route.slug) {
    const post = newsPosts.find((item) => item.slug === route.slug)

    return post
      ? {
          title: `${post.title} | ${siteMeta.name}`,
          description: post.excerpt,
        }
      : {
          title: `News Post Not Found | ${siteMeta.name}`,
          description: 'The requested news post could not be found.',
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
    news: {
      title: `News | ${siteMeta.name}`,
      description:
        'Read the latest articles, announcements, research updates, and stories from the institute.',
    },
    papers: {
      title: `Papers | ${siteMeta.name}`,
      description:
        'Explore publications and research outputs from across the institute.',
    },
    opportunities: {
      title: `Opportunities | ${siteMeta.name}`,
      description: 'Join, visit, collaborate, or work with the institute.',
    },
    'not-found': {
      title: `Page Not Found | ${siteMeta.name}`,
      description: 'The requested page could not be found.',
    },
  }

  return routeMeta[route.name]
}
