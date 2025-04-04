// frontend/src/cytoscape-cola.d.ts (Ensure this exists if no @types package)
declare module 'cytoscape-cola' {
  const cola: cytoscape.Ext; // Use cytoscape.Ext for extensions
  export = cola;
}