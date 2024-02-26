import { CYPRESS } from '../../cypress';
import slides from '../../carousel.json';

const get = (selector: string) => cy.get(`[data-cy=${selector}]`)

describe('Carousel', () => {
  it('navigates carousel correctly', () => {
    cy.visit('http://localhost:3000/')

    get(CYPRESS.PRELOADER).should('not.be.visible');
    cy.url().should('eq', `http://localhost:3000/`);
    get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', '0');
    get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', slides.length - 2);
    get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', slides.length - 1);

    cy.get('body').click(100, 100);
    cy.url().should('eq', `http://localhost:3000/1`);
    get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', '1');
    get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', 0);
    get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', slides.length - 1);

    const [first, second, ...iterator] = [...new Array(slides.length)].map((_, i) => i);
    iterator.forEach((index) => {
      cy.get('body').click(100, 100);
      cy.url().should('eq', `http://localhost:3000/${index}`);
      get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', index);
      get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', index - 2);
      get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', index - 1);
    })
  })

  it('toggles about correctly', () => {
    cy.visit('http://localhost:3000/')
    get(CYPRESS.PRELOADER).should('not.be.visible');
    cy.url().should('eq', `http://localhost:3000/`);
    get(CYPRESS.PAGE_TOGGLE_LINK).click()
    get(CYPRESS.SLIDE_ACTIVE).should('not.be.visible');
    cy.url().should('eq', `http://localhost:3000/about?activeSlideIndex=0`);
    get(CYPRESS.PAGE_TOGGLE_LINK).click()
    cy.url().should('eq', `http://localhost:3000/0`);
  })


  it('recovers slide index when reloading about', () => {
    cy.visit('http://localhost:3000/about?activeSlideIndex=0')
    get(CYPRESS.PAGE_TOGGLE_LINK).click()
    get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', '0');
    get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', slides.length - 2);
    get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', slides.length - 1);

    cy.visit('http://localhost:3000/about?activeSlideIndex=1')
    get(CYPRESS.PAGE_TOGGLE_LINK).click()
    get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', '1');
    get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', 0);
    get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', slides.length - 1);

    const [first, second, ...iterator] = [...new Array(slides.length)].map((_, i) => i);
    iterator.forEach((index) => {
      cy.visit(`http://localhost:3000/about?activeSlideIndex=${index}`);
      get(CYPRESS.PAGE_TOGGLE_LINK).click()
      get(CYPRESS.SLIDE_ACTIVE).should('have.attr', 'data-cy-index', index);
      get(CYPRESS.SLIDE_PREV).first().should('have.attr', 'data-cy-index', index - 2);
      get(CYPRESS.SLIDE_PREV).last().should('have.attr', 'data-cy-index', index - 1);
    })
  })
})