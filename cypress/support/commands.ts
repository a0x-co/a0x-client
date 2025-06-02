/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

// @ts-expect-error supress error
Cypress.Commands.add("connectWallet", () => {
  cy.window().then((win) => {
    win.ethereum = {
      isMetaMask: true,
      request: () =>
        Promise.resolve(["0x1234567890123456789012345678901234567890"]),
      on: () => {},
      removeListener: () => {},
      selectedAddress: "0x1234567890123456789012345678901234567890",
      isConnected: () => true,
    };
    win.dispatchEvent(
      new CustomEvent("wallet_connected", {
        detail: {
          address: "0x1234567890123456789012345678901234567890",
        },
      })
    );
  });
});
