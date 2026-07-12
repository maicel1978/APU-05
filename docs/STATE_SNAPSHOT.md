# 📋 STATE SNAPSHOT & MAP (v9.5.1)
**File**: `/src/core/State.js`

## 🧩 Current Properties
| Property | Type | Description |
| :--- | :--- | :--- |
| `version` | String | System version check. |
| `sessionId` | UUID/Null | Current active research session. |
| `topology` | Object | Graph structure (Node/Edges) for ENA. |
| `segments` | Array | Raw narrative fragments from DB. |
| `speakerMap` | Map | Metadata of participants (Covariates). |
| `covariateKeys` | Array | Schema of attributes (Age, Gender, etc). |
| `auditSummary`| Object | Quick metrics for the Integrity module. |

## 🚨 Missing / Inconsistent Properties
*   **ActiveStep**: No hay una propiedad central para el paso actual del workflow (ej. `step01`, `step02`). Se está manejando en el DOM, lo cual es **frágil**.
*   **AnalysisCache**: Los resultados de `Sentiment.js` y `NER.js` se pierden al recargar si no se guardan explícitamente en el estado antes de ir a la DB.
*   **ComparisonGroup**: Para el módulo **Transversal**, no hay una definición de "Grupo A" vs "Grupo B" en el estado.

## 🛠️ State Protocol
Cualquier modificación al estado debe disparar un evento global a través del Proxy. Si necesitas persistencia, el flujo **SIEMPRE** es:
`UI -> Action -> State -> (StateChange Callback) -> Database -> UI`.
