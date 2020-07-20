import { randomString } from "../util/random";

const accountName = randomString();
const rootCAPassword = `password-${randomString()}`;
const intermediateCAPassword = `password-${randomString()}`;
const certificatePassword = `password-${randomString()}`;

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

  it("Create root certificate", () => {
    cy.contains("New certificate").click();
    cy.url().should("eq", "http://localhost:28080/certificates/add");

    cy.contains("Create new certificate");
    cy.contains("Create certificate");

    cy.get("[placeholder='Name']").type("root-ca");
    cy.get(".ant-select-selection-search-input").eq(0).click();
    cy.contains("Root CA").click();

    cy.contains("RSA options");
    cy.get("[type='number']").first().clear().type(10);
    cy.get(".ant-select-selection-search-input").eq(2).click();
    cy.contains("2048 bits").click();

    cy.contains("Subject");
    cy.get("[placeholder='Common name']").type("test root-ca");
    cy.get("[placeholder='Private key password']").type(rootCAPassword);

    cy.contains("Create certificate").click();
    cy.url().should(
      "match",
      /http:\/\/localhost:28080\/certificates\/[0-9a-f\\-]{36}/
    );

    cy.contains("root-ca");
    cy.contains("Basic details");
    cy.contains("Serial number");
    cy.contains("Type");
    cy.contains("Root CA");
    cy.contains("Created at");
    cy.contains("Expires at");
    cy.contains("Body").click();
    cy.contains("-----BEGIN CERTIFICATE-----");
    cy.contains("-----END CERTIFICATE-----");
    cy.contains(/Download certificate/i);
    cy.contains(/Download private key/i).click();
    cy.contains("Please provide private key password");
    cy.contains("Cancel").click();
  });

  it("Create intermediate certificate", () => {
    cy.contains("Certificates").click();
    cy.contains("New certificate").click();
    cy.url().should("eq", "http://localhost:28080/certificates/add");

    cy.contains("Create new certificate");
    cy.contains("Create certificate");

    cy.get("[placeholder='Name']").type("intermediate-ca");
    cy.get(".ant-select-selection-search-input").eq(0).click();
    cy.contains("Intermediate CA").click();

    cy.contains("Certificate authority");
    cy.get("[placeholder='Search CA']")
      .type("root")
      .type("{downarrow}")
      .type("{enter}");

    cy.get("[placeholder='CA private key password']").type(rootCAPassword);

    cy.get(".ant-select-selection-search-input").eq(3).click();
    cy.contains("1024 bits").click();

    cy.get("[type='number']").first().clear().type(5);

    cy.contains("Subject");
    cy.get("[placeholder='Common name']").type("test intermediate-ca");
    cy.get("[placeholder='Private key password']").type(intermediateCAPassword);

    cy.contains("Create certificate").click();
    cy.url().should(
      "match",
      /http:\/\/localhost:28080\/certificates\/[0-9a-f\\-]{36}/
    );

    cy.contains("intermediate-ca");
    cy.contains("Basic details");
    cy.contains("Serial number");
    cy.contains("Type");
    cy.contains("Intermediate CA");
    cy.contains("Created at");
    cy.contains("Expires at");
    cy.contains("Body");
    cy.contains(/Download certificate/i);
    cy.contains(/Download private key/i);

    cy.contains("Certificate authority");
    cy.contains("root-ca").click();
    cy.contains("Root CA");
  });

  it("Create server certificate", () => {
    cy.contains("Certificates").click();
    cy.contains("New certificate").click();
    cy.url().should("eq", "http://localhost:28080/certificates/add");

    cy.contains("Create new certificate");
    cy.contains("Create certificate");

    cy.get("[placeholder='Name']").type("website.com");
    cy.get(".ant-select-selection-search-input").eq(0).click();
    cy.contains(/^Certificate$/).click();

    cy.contains("Certificate authority");
    cy.get("[placeholder='Search CA']")
      .type("inter")
      .type("{downarrow}")
      .type("{enter}");

    cy.get("[placeholder='CA private key password']").type(
      intermediateCAPassword
    );

    cy.get(".ant-select-selection-search-input").eq(3).click();
    cy.contains("1024 bits").click();

    cy.get("[type='number']").first().clear().type(1);

    cy.contains("Subject");
    cy.get("[placeholder='Common name']").type("website.com");
    cy.get("[placeholder='Private key password']").type(certificatePassword);

    cy.contains("Create certificate").click();
    cy.url().should(
      "match",
      /http:\/\/localhost:28080\/certificates\/[0-9a-f\\-]{36}/
    );

    cy.contains("website.com");
    cy.contains("Basic details");
    cy.contains("Serial number");
    cy.contains("Type");
    cy.contains("Certificate");
    cy.contains("Created at");
    cy.contains("Expires at");
    cy.contains("Body");
    cy.contains(/Download certificate chain/i);
    cy.contains(/Download private key/i);

    cy.contains("Certificate authority");
    cy.contains("intermediate-ca").click();
    cy.contains("Intermediate CA");
  });

  it("Check certificate list", () => {
    cy.contains("Certificates").click();
    cy.contains("root-ca");
    cy.contains("intermediate-ca");
    cy.contains("website.com");
  });
});
