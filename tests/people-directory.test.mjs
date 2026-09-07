import assert from 'node:assert/strict'
import test from 'node:test'
import { people } from '../src/content.ts'
import {
  buildPeopleDirectoryViewModel,
  getPeopleSection,
  peopleSectionOrder,
  shufflePeopleWithinSections,
} from '../src/domain/people.ts'
import {
  createDeterministicRandom,
  emptyFilters,
  phdCohortFixturePeople,
  shuffleFixturePeople,
} from './fixtures/people-directory.mjs'
import * as fixtures from './fixtures/people-directory-ordering.mjs'

test('shufflePeopleWithinSections keeps deterministic People Sections ordered', () => {
  const sourceOrder = shuffleFixturePeople.map((person) => person.slug)
  const shuffledPeople = shufflePeopleWithinSections(
    shuffleFixturePeople,
    createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
  )
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters: emptyFilters,
  })

  assert.deepEqual(
    shuffleFixturePeople.map((person) => person.slug),
    sourceOrder,
  )
  assert.deepEqual(
    directory.sections.map((section) => section.title),
    ['Principal Investigator', 'Adjunct Faculty', 'Postdoc', 'PhD Student'],
  )
  assert.deepEqual(
    directory.sections.map((section) => [section.title, section.people.length]),
    fixtures.expectedShuffledSectionCounts,
  )
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    fixtures.expectedShuffledSectionListings,
  )
  assert.equal(directory.totalPeople, 10)
  assert.equal(directory.visiblePeopleCount, 10)
})

test('People Directory orders PhD students by newest cohort and surname', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: shufflePeopleWithinSections(
      phdCohortFixturePeople,
      createDeterministicRandom([0.9, 0.1, 0.7, 0.3]),
    ),
    filters: emptyFilters,
  })
  const phdSection = directory.sections.find(
    (section) => section.title === 'PhD Student',
  )

  assert.deepEqual(
    phdSection?.people.map((listing) => listing.slug),
    fixtures.phdOrderingExpectedPhdSection,
  )
  assert.equal(Object.hasOwn(phdSection ?? {}, 'subsections'), false)
})

test('People Directory filters preserve shuffled relative order within matching People Sections', () => {
  const shuffledPeople = shufflePeopleWithinSections(
    shuffleFixturePeople,
    createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
  )
  const directory = buildPeopleDirectoryViewModel({
    people: shuffledPeople,
    filters: {
      ...emptyFilters,
      area: 'Evaluation',
    },
  })

  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    fixtures.filteredShuffleExpectedDirectory,
  )
  assert.equal(directory.totalPeople, 10)
  assert.equal(directory.visiblePeopleCount, 7)
})

test('shufflePeopleWithinSections applies static public PI and Adjunct Faculty roster ordering', () => {
  const directory = buildPeopleDirectoryViewModel({
    people: shufflePeopleWithinSections(
      people,
      createDeterministicRandom([0.6, 0.2, 0.8, 0.1]),
    ),
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Principal Investigator')
      ?.people.map((listing) => listing.slug),
    fixtures.staticOrderingExpectedDirectory,
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Adjunct Faculty')
      ?.people.map((listing) => listing.slug),
    ['roberta-raileanu', 'ed-grefenstette', 'jack-parker-holder'],
  )
})

test('People Directory renders non-empty People Sections in canonical order', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.map((section) => section.title),
    peopleSectionOrder,
  )
})

test('People Directory exposes plural public People Section headings', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections.map((section) => section.label),
    fixtures.sectionHeadingsExpectedDirectory,
  )
})

test('People Directory maps every public directory Person into exactly one People Section', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const listings = directory.sections.flatMap((section) => section.people)
  const publicDirectoryPeople = people.filter((person) => !person.alumni)

  assert.equal(listings.length, publicDirectoryPeople.length)
  assert.equal(
    new Set(listings.map((listing) => listing.slug)).size,
    publicDirectoryPeople.length,
  )
  assert.deepEqual(
    Object.fromEntries(
      peopleSectionOrder.map((section) => [
        section,
        listings.filter((listing) => listing.peopleSection === section).length,
      ]),
    ),
    fixtures.expectedPublicSectionCounts,
  )
  assert.deepEqual(
    Object.fromEntries(
      fixtures.representativePublicSlugs.map((slug) => [
        slug,
        listings.find((listing) => listing.slug === slug)?.peopleSection,
      ]),
    ),
    fixtures.expectedRepresentativeSections,
  )
})

test('People Directory treats explicit alumni flags as non-directory people', () => {
  const alumniFlaggedPi = fixtures.alumniExclusionAlumniFlaggedPi
  const alumniGroupMember = fixtures.alumniExclusionAlumniGroupMember
  const directory = buildPeopleDirectoryViewModel({
    people: [alumniFlaggedPi, alumniGroupMember],
    filters: emptyFilters,
  })

  assert.equal(getPeopleSection(alumniFlaggedPi), null)
  assert.equal(getPeopleSection(alumniGroupMember), 'Associate Members')
  assert.deepEqual(
    directory.sections.map((section) => [
      section.title,
      section.people.map((listing) => listing.slug),
    ]),
    [['Associate Members', ['alumni-group-member']]],
  )
  assert.equal(directory.totalPeople, 1)
  assert.equal(directory.visiblePeopleCount, 1)
})

test('People Directory maps canonical source role values to matching People Sections', () => {
  assert.equal(
    getPeopleSection({
      group: 'PhD Student',
    }),
    'PhD Student',
  )
  assert.equal(
    getPeopleSection({
      group: 'Masters Student',
    }),
    'Masters Student',
  )
  assert.equal(
    getPeopleSection({
      group: 'Associate Members',
    }),
    'Associate Members',
  )
})

test('People Directory preserves non-cohort section ordering', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Principal Investigator')
      ?.people.map((listing) => listing.slug),
    fixtures.expectedPrincipalInvestigators,
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Adjunct Faculty')
      ?.people.map((listing) => listing.slug),
    ['ed-grefenstette', 'jack-parker-holder', 'roberta-raileanu'],
  )
  assert.equal(
    directory.sections
      .find((section) => section.title === 'PhD Student')
      ?.people.at(0)?.slug,
    'austin-andrews',
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Postdoc')
      ?.people.map((listing) => listing.slug),
    fixtures.expectedPostdocs,
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Masters Student')
      ?.people.map((listing) => listing.slug),
    fixtures.expectedMastersStudents,
  )

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Associate Faculty')
      ?.people.map((listing) => listing.slug),
    fixtures.expectedAssociateFaculty,
  )

  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Associate Members')
      ?.people.map((listing) => listing.slug),
    fixtures.expectedAssociateMembers,
  )
})

test('People Directory exposes public PhD students newest-cohort first without subsections', () => {
  const directory = buildPeopleDirectoryViewModel({
    people,
    filters: emptyFilters,
  })
  const phdSection = directory.sections.find(
    (section) => section.title === 'PhD Student',
  )

  assert.equal(Object.hasOwn(phdSection ?? {}, 'subsections'), false)
  assert.deepEqual(
    phdSection?.people.map((listing) => listing.slug),
    fixtures.phdCohortsExpectedPhdSection,
  )
  assert.deepEqual(
    directory.sections
      .find((section) => section.title === 'Incoming PhD Students')
      ?.people.map((listing) => listing.slug),
    ['antoine-gorceix', 'george-mavroghenis', 'bassel-al-omari'],
  )
})
