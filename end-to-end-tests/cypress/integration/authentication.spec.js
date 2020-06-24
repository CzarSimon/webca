import { randomString } from '../util/random';

const accountName = randomString();

describe('Create account and log out and log in', () => {
  it('Create account', () => {
    cy.visit('http://localhost:28080', {
      onBeforeLoad: (window) => {
        window.sessionStorage.clear();
      },
    });

    cy.get('h1').contains('webca.io');

    cy.get("[placeholder='Account name']").type(accountName);
    cy.get("[placeholder='Email']").type('admin@test.com');
    cy.get("[placeholder='Password']").type(
      'a long and difficult to guess password'
    );

    cy.get('button').contains('Sign Up').click();

    // Check that the home page was loaded.
    cy.contains('Web based certificate authority');
    cy.get('h1:first').contains('webca.io');
    cy.get('h1:last').contains('webca.io');
  });

  it('Check settings page with user details and log out', () => {
    cy.contains('Settings').click();

    // Check that the settings page is loaded
    cy.contains('User details');

    cy.contains('Email');
    cy.contains('admin@test.com');

    cy.contains('Role');
    cy.contains('ADMIN');

    cy.contains('Account name');
    cy.contains(accountName);

    // Log out
    cy.contains('Log out').click();
  });

  it('Login user', () => {
    // Goto login.
    cy.get('a').contains('Log in').click();
    cy.url().should('eq', 'http://localhost:28080/login');
    cy.get('a').contains('Sign up');

    // Log in
    cy.get("[placeholder='Account name']").type(accountName);
    cy.get("[placeholder='Email']").type('admin@test.com');
    cy.get("[placeholder='Password']").type(
      'a long and difficult to guess password'
    );
    cy.get('button').contains('Log in').click();

    // Check that the home page was loaded.
    cy.contains('Web based certificate authority');
    cy.get('h1:first').contains('webca.io');
    cy.get('h1:last').contains('webca.io');
  });
});
