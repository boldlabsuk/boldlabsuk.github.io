import { allFilterValue } from '../../src/domain/shared.ts'

export const emptyFilters = {
  query: '',
  section: allFilterValue,
  area: allFilterValue,
  affiliation: allFilterValue,
  supervisor: allFilterValue,
}

export const filterFixturePeople = [
  {
    slug: 'alex-principal',
    name: 'Alex Principal',
    role: 'BOLD PI',
    group: 'BOLD PI',
    affiliation: 'Northern Centre for AI',
    bio: 'Leads evaluation research.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'casey-postdoc',
    name: 'Casey Postdoc',
    role: 'Postdoc',
    group: 'Postdoc',
    affiliation: 'London AI Systems Lab',
    bio: 'Studies agent systems.',
    researchAreas: ['Agents'],
    supervisors: ['Alex Principal'],
  },
  {
    slug: 'devon-dphil',
    name: 'Devon DPhil',
    role: 'PhD student',
    group: 'PhD student',
    affiliation: 'BOLD Lab',
    bio: 'Builds evaluation tools.',
    researchAreas: ['Evaluation'],
    supervisors: ['Alex Principal'],
  },
  {
    slug: 'riley-associate',
    name: 'Riley Associate',
    role: 'Research Engineer',
    group: 'Research Engineers',
    affiliation: 'BOLD Lab',
    bio: 'Builds research infrastructure.',
    researchAreas: ['Infrastructure'],
    supervisors: ['Alex Principal'],
  },
  {
    slug: 'alex-alumna',
    name: 'Alex Alumna',
    role: 'Alumna',
    group: 'Alumni',
    affiliation: 'Public Interest AI Network',
    bio: 'Former lab researcher.',
    researchAreas: ['Governance'],
    alumni: true,
  },
]

export const shuffleFixturePeople = [
  {
    slug: 'pi-one',
    name: 'PI One',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads evaluation research.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'postdoc-one',
    name: 'Postdoc One',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies evaluation systems.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'pi-two',
    name: 'PI Two',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads agent research.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'adjunct-one',
    name: 'Adjunct One',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies open-ended learning.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'adjunct-two',
    name: 'Adjunct Two',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies reinforcement learning.',
    researchAreas: ['Agents'],
  },
  {
    slug: 'adjunct-three',
    name: 'Adjunct Three',
    role: 'Adjunct Faculty',
    group: 'Adjunct Faculty',
    bio: 'Studies foundation models.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'alumni-hidden',
    name: 'Alumni Hidden',
    role: 'Former PI',
    group: 'BOLD PI',
    bio: 'Former lab lead.',
    researchAreas: ['Evaluation'],
    alumni: true,
  },
  {
    slug: 'postdoc-two',
    name: 'Postdoc Two',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies evaluation agents.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'phd-one',
    name: 'PhD One',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Builds evaluation tools.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'pi-three',
    name: 'PI Three',
    role: 'BOLD PI',
    group: 'BOLD PI',
    bio: 'Leads evaluation infrastructure.',
    researchAreas: ['Evaluation'],
  },
  {
    slug: 'postdoc-three',
    name: 'Postdoc Three',
    role: 'Postdoc',
    group: 'Postdoc',
    bio: 'Studies agent systems.',
    researchAreas: ['Agents'],
  },
]

export const phdCohortFixturePeople = [
  {
    slug: 'alex-zakharov',
    name: 'Alex Zakharov',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies machine learning.',
    researchAreas: ['Machine Learning'],
    phdSortSurname: 'Zakharov',
  },
  {
    slug: 'sam-coward',
    name: 'Sam Coward',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies reinforcement learning.',
    researchAreas: ['Reinforcement Learning'],
    phdSortSurname: 'Coward',
    phdStartYear: 2023,
  },
  {
    slug: 'qizhen-zhang-irene',
    name: 'Qizhen Zhang (Irene)',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies agents.',
    researchAreas: ['AI Agents'],
    phdSortSurname: 'Zhang',
    phdStartYear: 2022,
  },
  {
    slug: 'george-mavroghenis',
    name: 'George Mavroghenis',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies robotics.',
    researchAreas: ['Robotics'],
    phdSortSurname: 'Mavroghenis',
  },
  {
    slug: 'matthew-jackson',
    name: 'Matthew Jackson',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies optimization.',
    researchAreas: ['Optimization'],
    phdSortSurname: 'Jackson',
    phdStartYear: 2022,
  },
  {
    slug: 'uljad-berdica',
    name: 'Uljad Berdica',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies autonomous systems.',
    researchAreas: ['Robotics'],
    phdSortSurname: 'Berdica',
    phdStartYear: 2023,
  },
  {
    slug: 'keyue-jiang',
    name: 'Keyue Jiang',
    role: 'PhD student',
    group: 'PhD student',
    bio: 'Studies computer vision.',
    researchAreas: ['Computer Vision'],
    phdSortSurname: 'Jiang',
    phdStartYear: 2022,
  },
]

export function createDeterministicRandom(values) {
  let index = 0

  return () => {
    const value = values[index % values.length]

    index += 1

    return value
  }
}
