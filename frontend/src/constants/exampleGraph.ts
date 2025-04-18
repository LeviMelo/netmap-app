// frontend/src/constants/exampleGraph.ts

export const diabetesExampleSyntax = `# Enhanced Diabetes Mellitus Concept Map

# Nodes with attributes
[Diabetes Mellitus](id=dm, color=#7c3aed, shape=diamond) # Violet Diamond
[Type 1 DM](id=t1dm, color=#dc2626) # Red Ellipse (Default)
[Type 2 DM](id=t2dm, color=#f59e0b) # Orange Ellipse (Default)
[Gestational DM](id=gdm, color=#16a34a) # Green Ellipse (Default)
[Pancreas](id=panc, shape=barrel)
[Insulin](id=ins, color=#0891b2) # Cyan
[Glucose](id=gluc, color=#0891b2) # Cyan
[Beta Cells](id=beta, shape=hexagon)
[Autoimmune Destruction](id=autoimm)
[Insulin Resistance](id=ir)
[Hyperglycemia](id=hyperg, color=#e11d48) # Rose 600
[Symptoms](id=symp, shape=rectangle)
[Polyuria](id=pu)
[Polydipsia](id=pd)
[Polyphagia](id=pp)
[Weight Loss](id=wl)
[Complications](id=comp, shape=star, color=#be123c) # Fuchsia 700 Star
[Microvascular](id=micro)
[Macrovascular](id=macro)
[Retinopathy](id=retino)
[Nephropathy](id=nephro)
[Neuropathy](id=neuro)
[Cardiovascular Disease](id=cvd)
[Diagnosis](id=diag, shape=rectangle)
[Blood Tests](id=blood)
[A1C Test](id=a1c)
[Fasting Plasma Glucose](id=fpg)
[Oral Glucose Tolerance Test](id=ogtt)
[Treatment](id=treat, shape=rectangle, color=#16a34a) # Green Rectangle
[Lifestyle Changes](id=life)
[Diet](id=diet)
[Exercise](id=exer)
[Medications](id=meds)
[Oral Agents](id=oral)
[Metformin](id=metf, color=#0891b2) # Cyan
[Injectable Therapies](id=inject)

# Relationships with attributes
dm -> t1dm : "is type"
dm -> t2dm : "is type"
dm -> gdm : "is type"
panc -> beta : "contains" (color=#a3a3a3) # Gray Edge
beta -> ins : "produces" (width=4) # Thicker Edge
ins -> gluc : "regulates" (width=4, color=#0891b2) # Thick Cyan Edge
t1dm -> autoimm : "caused by" (color=#dc2626) # Red Edge
autoimm -> beta : "destroys" (color=#dc2626) # Red Edge
t1dm -> ins : "results in deficiency"
t2dm -> ir : "characterized by" (color=#f59e0b) # Orange Edge
t2dm -> beta : "associated with dysfunction" (color=#f59e0b) # Orange Edge
ir -> ins : "impairs action of"
dm -> hyperg : "causes" (color=#e11d48, width=3) # Thicker Rose Edge
hyperg -> symp : "leads to"
symp -> pu : "includes"
symp -> pd : "includes"
symp -> pp : "includes"
t1dm -> wl : "can cause"
dm -> comp : "can lead to" (color=#be123c, width=3) # Thicker Fuchsia Edge
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
dm -> treat : "managed by" (color=#16a34a) # Green Edge
treat -> life : "includes"
treat -> meds : "includes"
life -> diet : "is part of"
life -> exer : "is part of"
meds -> oral : "includes"
meds -> inject : "includes"
meds -> ins : "is type"
oral -> metf : "is example"
inject -> ins : "is type"
ir -> hyperg : "contributes to"
`;