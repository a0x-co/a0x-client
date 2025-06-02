const host = "http://localhost:3000";
describe("Agent Dashboard Page", () => {
  beforeEach(() => {
    // Visitar la página principal antes de cada prueba
    cy.visit(host);
  });
  const testAgentHandle = "matias";
  it("debería cargar correctamente la página de dashboard del agente", () => {
    // Navegar directamente a la página de dashboard del agente
    cy.visit(`${host}/agent/${testAgentHandle}/dashboard`);

    // Verificar que los elementos principales del dashboard estén presentes
    cy.contains("Dashboard").should("be.visible");
    cy.get("#chat-with-agent-button").should("be.visible");
    cy.get("#chat-with-agent-button").click();
  });

  it("debería mostrar la información de personalidad del agente", () => {
    cy.visit(`${host}/agent/${testAgentHandle}/dashboard`);

    // Verificar que la información de personalidad se cargue correctamente
    cy.contains("Personality").should("be.visible");

    // Esperar a que los datos de personalidad se carguen
    cy.wait(1000);

    // Verificar que hay contenido en la sección de personalidad
    cy.get('[data-testid="personality-section"]').should("not.be.empty");
  });

  it("debería requerir conexión de wallet para ciertas acciones", () => {
    cy.visit(`${host}/agent/${testAgentHandle}/dashboard`);

    // Intentar realizar una acción que requiere wallet conectada
    cy.contains("Edit Personality").click();

    // Verificar que aparece el mensaje de conexión de wallet
    cy.contains("connect your wallet").should("be.visible");
  });

  it("debería permitir chatear con el agente y recibir respuestas", () => {
    cy.visit(`${host}/agent/${testAgentHandle}/dashboard`);

    // Abrir el chat
    cy.get("#chat-with-agent-button").click();

    // Verificar que el mensaje inicial del agente está visible
    cy.contains("GM, how can I help you today?").should("be.visible");

    // Escribir y enviar un mensaje
    cy.get("textarea[placeholder='Type a message...']").type(
      "Cuéntame sobre ti"
    );
    cy.get("button").find("svg").parent().eq(1).click(); // Selecciona el botón de enviar

    // Verificar que el mensaje del usuario aparece
    cy.contains("Cuéntame sobre ti").should("be.visible");

    // Esperar y verificar la respuesta
    cy.wait(5000); // Ajusta según el tiempo de respuesta típico

    // Verificar que hay al menos dos mensajes del agente (el inicial y la respuesta)
    cy.get(".bg-black\\/20").should("have.length.at.least", 2);

    // Probar el botón de reinicio del chat
    cy.get("button").find("svg[viewBox='0 0 24 24']").click();

    // Confirmar el diálogo de alerta (si existe)
    cy.on("window:confirm", () => true);

    // Verificar que el chat se ha reiniciado (solo debe quedar el mensaje inicial)
    cy.get(".bg-black\\/20").should("have.length", 1);
    cy.contains("GM, how can I help you today?").should("be.visible");
  });
});
