import React, { useState } from 'react';
import { useGraphStore } from '../store';
import { parseGraphSyntax } from '../utils/graphParser';

const availableLayouts = ['grid', 'cose', 'circle', 'breadthfirst', 'dagre'];

const Sidebar: React.FC = () => {
  const [graphInputText, setGraphInputText] = useState<string>('');
  const setNodes = useGraphStore((state) => state.setNodes);
  const setEdges = useGraphStore((state) => state.setEdges);
  const stylesResolved = useGraphStore((state) => state.stylesResolved);
  const currentLayout = useGraphStore((state) => state.layoutName);
  const setLayoutName = useGraphStore((state) => state.setLayoutName);

  const handleLoadGraph = () => {
     console.log("Attempting to load graph from text...");
     const parsedData = parseGraphSyntax(graphInputText);
     if (parsedData) {
         console.log("Parsed data:", parsedData);
         setNodes(parsedData.nodes);
         setEdges(parsedData.edges);
     } else {
         console.error("Critical parsing error occurred.");
         alert("A critical error occurred during parsing. Check console.");
     }
  };

  const handlePasteExample = () => {
      setGraphInputText(`# Simplified Diabetes Mellitus Concept Map

[Diabetes Mellitus](id=dm)
[Type 1 DM](id=t1dm)
[Type 2 DM](id=t2dm)
[Gestational DM](id=gdm)
[Pancreas](id=panc)
[Insulin](id=ins)
[Glucose](id=gluc)
[Beta Cells](id=beta)
[Autoimmune Destruction](id=autoimm)
[Insulin Resistance](id=ir)
[Hyperglycemia](id=hyperg)
[Symptoms](id=symp)
[Polyuria](id=pu)
[Polydipsia](id=pd)
[Polyphagia](id=pp)
[Weight Loss](id=wl)
[Complications](id=comp)
[Microvascular](id=micro)
[Macrovascular](id=macro)
[Retinopathy](id=retino)
[Nephropathy](id=nephro)
[Neuropathy](id=neuro)
[Cardiovascular Disease](id=cvd)
[Diagnosis](id=diag)
[Blood Tests](id=blood)
[A1C Test](id=a1c)
[Fasting Plasma Glucose](id=fpg)
[Oral Glucose Tolerance Test](id=ogtt)
[Treatment](id=treat)
[Lifestyle Changes](id=life)
[Diet](id=diet)
[Exercise](id=exer)
[Medications](id=meds)
[Oral Agents](id=oral)
[Metformin](id=metf)
[Injectable Therapies](id=inject)

# Relationships
dm -> t1dm : "is type"
dm -> t2dm : "is type"
dm -> gdm : "is type"
panc -> beta : "contains"
beta -> ins : "produces"
ins -> gluc : "regulates"
t1dm -> autoimm : "caused by"
autoimm -> beta : "destroys"
t1dm -> ins : "results in deficiency"
t2dm -> ir : "characterized by"
t2dm -> beta : "associated with dysfunction"
ir -> ins : "impairs action of"
dm -> hyperg : "causes"
hyperg -> symp : "leads to"
symp -> pu : "includes"
symp -> pd : "includes"
symp -> pp : "includes"
t1dm -> wl : "can cause"
dm -> comp : "can lead to"
comp -> micro : "includes"
comp -> macro : "includes"
micro -> retino : "is type"
micro -> nephro : "is type"
micro -> neuro : "is type"
macro -> cvd : "is type"
dm -> diag : "requires"
diag -> blood : "uses"
blood -> a1c : "includes"
blood -> fpg : "includes"
blood -> ogtt : "includes"
dm -> treat : "managed by"
treat -> life : "includes"
treat -> meds : "includes"
life -> diet : "is part of"
life -> exer : "is part of"
meds -> oral : "includes"
meds -> inject : "includes"
meds -> ins : "is type"
oral -> metf : "is example"
inject -> ins : "is type"
ir -> hyperg : "contributes to"`);
  };

  return (
    <div className="flex flex-col h-full p-1"> {/* Added slight padding */}
      {/* Input Section */}
      <div>
        <h2 className="heading-2 !mt-0">Load Graph</h2> {/* Overrode margin top */}
        <label htmlFor="graph-input" className="label-text">
            Enter graph definition or{' '}
             <button onClick={handlePasteExample} className="text-accent-cyan hover:underline focus:outline-none text-sm">
                 paste example
             </button>:
        </label>
        <textarea
            id="graph-input"
            rows={10}
            className="input-text mt-1 mb-2 h-48 resize-none font-mono text-sm"
            placeholder={"# Example:\n[Node A]\n[Node B]\n[Node A] -> [Node B]"}
            value={graphInputText}
            onChange={(e) => setGraphInputText(e.target.value)}
            disabled={!stylesResolved}
        />
        <button
            className="btn btn-primary w-full"
            onClick={handleLoadGraph}
            disabled={!stylesResolved || !graphInputText.trim()}
        >
            Load Graph
        </button>
      </div>

      {/* Layout Controls Section */}
      <div className="mt-6">
          <h3 className="text-md font-semibold text-accent-cyan mb-2">Layout</h3>
          <div className="flex flex-wrap gap-2">
              {availableLayouts.map((layout) => (
                  <button
                      key={layout}
                      onClick={() => setLayoutName(layout)}
                      className={`btn text-sm ${
                          currentLayout === layout ? 'btn-primary' : 'btn-secondary'
                      }`}
                      disabled={!stylesResolved}
                  >
                      {layout.charAt(0).toUpperCase() + layout.slice(1)}
                  </button>
              ))}
          </div>
      </div>

       {/* Editing Placeholder */}
       <div className="mt-6">
            <h3 className="text-md font-semibold text-accent-cyan mb-2">Editing</h3>
            <p className="text-sm text-text-secondary-dark">Editing controls here later.</p>
        </div>

      {/* Spacer */}
      <div className="flex-grow"></div>

      {/* Footer / Authorship */}
      <div className="mt-4 pt-4 border-t border-border-dark text-center">
           <p className="text-sm text-text-secondary-dark">
               Netmap by Levi de Melo
           </p>
      </div>
    </div>
  );
};

export default Sidebar;