describe("Create account", () => {
  it("load signup page", () => {
    cy.clearLocalStorage();
    cy.visit("http://localhost:28080");

    cy.get("h1").contains("webca.io");
    cy.get("a").contains("Log in");

    cy.get("[placeholder='Account name']").type("test account");
    cy.get("[placeholder='Email']").type("admin@test.com");
    cy.get("[placeholder='Password']").type(
      "a long and difficult to guess password"
    );

    cy.get("button").contains("Sign Up");
  });
});
