/// <reference types="cypress" />

describe("Agent Demo", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it.only("prueba el flujo de creación de agente vacío", () => {
    // Esperar que todo este montado
    cy.wait(6000).then(() => {
      console.log("Montado");
    });

    // Flujo inicial
    cy.get('input[placeholder*="Type a message"]')
      .type("Create my agent{enter}")

      .wait(1000);

    // Interceptar la respuesta
    cy.intercept("POST", "/api/talk-with-a0x-agent")
      .as("talkWithAgent")
      .wait(20000);
    // cy.wait("@talkWithAgent").then((response) => {
    //   console.log(response);
    // });

    // conectar wallet
    cy.window().then((win) => {
      win.dispatchEvent(
        new CustomEvent("wallet_connected", {
          detail: {
            address: "0x1234567890123456789012345678901234567890",
          },
        })
      );
    });
    cy.get('input[placeholder*="Type a message"]')
      .type("Was connected successfully 0x123...7890{enter}")
      .wait(1000);
    cy.intercept("POST", "/api/talk-with-a0x-agent").as("talkWithAgent");
    cy.wait("@talkWithAgent").then((response) => {
      console.log(response);
    });

    // Esperar a que se muestre el mensaje de respuesta
    cy.contains("choose name").should("be.visible");
    cy.get('input[placeholder*="Type a message"]')

      .type("Test Agent{enter}")
      .wait(1000);

    // Selección de tipo de agente
    cy.contains("Would you like to start with").should("be.visible");
    cy.get('input[placeholder*="Type a message"]').type("1{enter}").wait(1000);

    // Verificar respuesta para agente vacío
    cy.contains("Perfect, we will proceed").should("be.visible");
  });

  it("prueba el flujo de clonación de perfil X", () => {
    // Flujo inicial
    cy.get('input[placeholder*="Type a message"]')
      .type("Create my agent{enter}")
      .wait(1000);

    // Selección de tipo de agente (clon)
    cy.contains("Would you like to start with").should("be.visible");
    cy.get('input[placeholder*="Type a message"]').type("2{enter}").wait(1000);

    // Proporcionar handle de X
    cy.contains("Please provide the username").should("be.visible");
    cy.get('input[placeholder*="Type a message"]')
      .type("@testuser{enter}")
      .wait(1000);

    // Verificar mensaje de pago
    cy.contains("This will cost 5 USDC").should("be.visible");
  });

  it("prueba el flujo de 'How it works'", () => {
    cy.get('input[placeholder*="Type a message"]')
      .type("How it works{enter}")
      .wait(1000);

    // Verificar explicación
    cy.contains("a0x is a platform").should("be.visible");
    cy.contains("create your own AI agents").should("be.visible");
  });

  it("prueba la navegación a diferentes páginas", () => {
    // Supongamos que ya tenemos un agente creado llamado "TestAgent"
    cy.get('input[placeholder*="Type a message"]')
      .type("Take me to my agent's dashboard{enter}")
      .wait(1000);

    // Verificar respuesta de navegación
    cy.contains("navigate").should("be.visible");

    // Probar otros comandos de navegación
    const navigationCommands = [
      "Show me my agent's memories",
      "I want to see the personality settings",
      "Take me to workforce",
      "Open agent settings",
    ];

    navigationCommands.forEach((command) => {
      cy.get('input[placeholder*="Type a message"]')
        .type(`${command}{enter}`)
        .wait(1000);

      cy.contains(/dashboard|memories|personality|workforce|settings/i).should(
        "be.visible"
      );
    });
  });

  it("prueba el manejo de wallet no conectada", () => {
    cy.get('input[placeholder*="Type a message"]')
      .type("Create my agent{enter}")
      .wait(1000);

    // Verificar mensaje de conexión de wallet
    cy.contains("connect your wallet").should("be.visible");
    cy.contains("connect_wallet").should("be.visible");
  });
});
