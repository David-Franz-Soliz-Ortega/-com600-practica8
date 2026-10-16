const { estadoDeTarea } = require("../src/tarea"); 

describe("estadoDeTarea", () => { 
  test("devuelve COMPLETADA cuando la tarea está terminada", () => { 
    const tarea = { titulo: "Entregar informe", completada: true }; 
    const estado = estadoDeTarea(tarea); 
    expect(estado).toBe("COMPLETADA"); 
  }); 

  test("devuelve ATRASADA cuando venció y no está completada", () => { 
    const tarea = { titulo: "Pagar servidor", vence: "2026-01-10" }; 
    expect(estadoDeTarea(tarea, new Date("2026-01-11"))).toBe("ATRASADA"); 
  }); 

  test("una tarea completada nunca figura como atrasada", () => { 
    const tarea = { titulo: "Pagar servidor", vence: "2026-01-10", completada: true }; 
    expect(estadoDeTarea(tarea, new Date("2026-06-01"))).toBe("COMPLETADA"); 
  }); 

  test("lanza un error si la tarea no tiene título", () => { 
    expect(() => estadoDeTarea({})).toThrow("La tarea necesita un título"); 
  }); 

  test("devuelve PENDIENTE cuando la tarea no está vencida ni completada", () => { 
    const tarea = { titulo: "Planificar sprint", vence: "2026-12-31" }; 
    expect(estadoDeTarea(tarea, new Date("2026-01-01"))).toBe("PENDIENTE"); 
  }); 
});
