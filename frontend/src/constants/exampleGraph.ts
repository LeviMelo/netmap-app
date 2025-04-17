// frontend/src/constants/exampleGraph.ts

export const diabetesExampleSyntax = `# Simplified Diabetes Mellitus Concept Map
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
ir -> hyperg : "contributes to"
`;