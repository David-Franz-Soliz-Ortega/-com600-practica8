
const { MongoDBContainer } = require("@testcontainers/mongodb");
const { crearRepositorio } = require("../src/repositorio");
describe("Pruebas de integración CRUD", () => {
  let contenedor, repo;

 beforeAll(async () => {
    // Es CRÍTICO que diga "mongo:6.0" aquí adentro
    contenedor = await new MongoDBContainer("mongo:6.0").start();
    const uri = contenedor.getConnectionString();
    if (!uri.includes("directConnection=true")) {
      uri += uri.includes("?") ? "&directConnection=true" : "?directConnection=true";
    }
    repo = await crearRepositorio(uri);
  }, 60000); // <--- LA COMA Y EL 60000 VAN DESPUÉS DE LA LLAVE, ANTES DEL PARÉNTESIS FINAL

  afterAll(async () => {
    // Esto soluciona el error de "Jest did not exit" apagando el contenedor correctamente
    if (contenedor) {
      await contenedor.stop();
    }
  }, 60000);

  // Aislamiento: Limpia la colección antes de CADA prueba
  beforeEach(async () => {
    await repo.limpiar();
  });

  test("guarda y recupera un documento", async () => {
    await repo.guardar({ titulo: "Tarea A", completada: false });
    const encontrada = await repo.buscarPorTitulo("Tarea A");
    expect(encontrada.titulo).toBe("Tarea A");
  });

  test("devuelve null cuando el documento no existe", async () => {
    const encontrada = await repo.buscarPorTitulo("No existo");
    expect(encontrada).toBeNull();
  });

  test("actualiza el estado de una tarea existente", async () => {
    await repo.guardar({ titulo: "Tarea B", completada: false });
    await repo.actualizar("Tarea B", true);
    
    const encontrada = await repo.buscarPorTitulo("Tarea B");
    expect(encontrada.completada).toBe(true);
  });

  test("elimina un documento existente", async () => {
    await repo.guardar({ titulo: "Tarea C", completada: false });
    await repo.eliminar("Tarea C");
    
    const encontrada = await repo.buscarPorTitulo("Tarea C");
    expect(encontrada).toBeNull();
  });
});