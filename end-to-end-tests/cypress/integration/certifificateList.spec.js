import { randomString } from "../util/random";

const accountName = randomString();

describe("Goto certificate list, and select new certificate creation", () => {
  it("Create account", () => {
    cy.visit("http://localhost:28080", {
      onBeforeLoad: (window) => {
        window.sessionStorage.clear();
      },
    });

    cy.get("h1").contains("webca.io");

    cy.get("[placeholder='Account name']").type(accountName);
    cy.get("[placeholder='Email']").type("user@test.com");
    cy.get("[placeholder='Password']").type("8b2f8313d79903b39e8b");

    cy.get("button").contains("Sign Up").click();

    // Check that the home page was loaded.
    cy.contains("Web based certificate authority");
    cy.get("h1:first").contains("webca.io");
    cy.get("h1:last").contains("webca.io");
  });

  it("Goto certificate list", () => {
    cy.contains("Certificates").click();

    cy.url().should("eq", "http://localhost:28080/certificates");
    cy.get("h1:last").contains("Certificates");
    cy.contains("Name");
    cy.contains("Certificate type");
    cy.contains("Created at");
    cy.contains("Expires at");
  });

  it("Choose create certificate", () => {
    cy.contains("New certificate").click();
    cy.url().should("eq", "http://localhost:28080/certificates/add");

    cy.contains("Create new certificate");
    cy.contains("Create certificate");
  });
});
