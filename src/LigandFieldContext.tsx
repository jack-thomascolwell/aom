import React, { Key } from 'react';
import { useImmerReducer } from "use-immer";

export type LigandField = {
  ligands: Array<LigandInput>,
  selected: number,
  selectedState: number,
}

export type LigandInput = {
  start: LigandStateInput,
  end: LigandStateInput,
  fixed: boolean,
};

export type LigandStateInput = {
  x: string,
  y: string,
  z: string,
  esigma: string,
  epi: string,
};

export type Ligand = {
  start: LigandState,
  end: LigandState,
  fixed: boolean,
};

export type LigandState = {
  x: number,
  y: number,
  z: number,
  esigma: number,
  epi: number,
};

export function toSpherical(x: number, y: number, z: number): {theta: number, phi: number} | null {
  const r = Math.sqrt(x*x + y*y + z*z);
  if (r === 0) return null;
  return {
    theta: Math.acos(z / r),
    phi: Math.atan2(x,y),
  }
}

export function toCartesian(theta: number, phi: number): {x: number, y: number, z: number} {
  return {
    x: Math.cos(phi) * Math.sin(theta),
    y: Math.sin(phi) * Math.sin(theta),
    z: Math.cos(theta),
  }
}

export function interpolate(ligand: Ligand, selectedState: number): LigandState | null {
  const start = ligand.start;
  if (ligand.fixed) return start;
  const end = ligand.end;

  const cosTheta = Math.cos(selectedState * Math.PI * 0.5);
  const sinTheta = Math.sin(selectedState * Math.PI * 0.5);
  console.log(`t=${selectedState} cosTheta: ${cosTheta} sinTheta: ${sinTheta}`)

  const rStart = Math.sqrt(start.x * start.x + start.y * start.y + start.z * start.z);
  const rEnd = Math.sqrt(end.x * end.x + end.y * end.y + end.z * end.z);
  if (rStart === 0 || rEnd === 0) return null;

  // compute current x,y,z as a point on the parametric arc from the start to end with radius 1
  const x = (cosTheta * start.x / rStart)+ (sinTheta * end.x / rEnd);
  const y = (cosTheta * start.y / rStart)+ (sinTheta * end.y / rEnd);
  const z = (cosTheta * start.z / rStart)+ (sinTheta * end.z / rEnd);

  const esigma = (1 - selectedState) * start.esigma + selectedState * end.esigma;
  const epi = (1 - selectedState) * start.epi + selectedState * end.epi;

  console.log(`x: (${start.x}, ${end.x}) -> ${x}, y: (${start.y}, ${end.y}) -> ${y}, z: (${start.z}, ${end.z}) -> ${z}, esigma: ${esigma}, epi: ${epi}`)

  return { x, y, z, esigma, epi };
}


export function validateLigandInput(ligandInput: LigandInput): Ligand | null {
  const start = validateLigandStateInput(ligandInput.start);
  const end = (ligandInput.fixed) ? start : validateLigandStateInput(ligandInput.end);

  if (start === null || end === null) return null;

  return { start, end, fixed: ligandInput.fixed };
}

export function validateLigandStateInput(ligandStateInput: LigandStateInput): LigandState | null {
  const ligandState = {
    x: parseFloat(ligandStateInput.x),
    y: parseFloat(ligandStateInput.y),
    z: parseFloat(ligandStateInput.z),
    esigma: parseFloat(ligandStateInput.esigma),
    epi: parseFloat(ligandStateInput.epi),
  }

  if (typeof(ligandState.x) !== 'number' || isNaN(ligandState.x) || !isFinite(ligandState.x) ||
      typeof(ligandState.y) !== 'number' || isNaN(ligandState.y) || !isFinite(ligandState.y) ||
      typeof(ligandState.z) !== 'number' || isNaN(ligandState.z) || !isFinite(ligandState.z) ||
      typeof(ligandState.esigma) !== 'number' || isNaN(ligandState.esigma) || !isFinite(ligandState.esigma) ||
      typeof(ligandState.epi) !== 'number' || isNaN(ligandState.epi) || !isFinite(ligandState.epi) ||
      (ligandState.x === 0 && ligandState.y === 0 && ligandState.z === 0))
    return null;

  return ligandState;
}

export type AddAction = {
  type: 'added',
  esigma?: string,
  epi?: string,
}

export type ImportAction = {
  type: 'imported',
  ligands: Array<LigandInput>,
}

export type DeleteAction = {
  type: 'deleted',
  index: number,
}

export type ChangeValueAction = {
  type: 'changedValue',
  index: number,
  state: 'start' | 'end',
  key: 'x' | 'y' | 'z' | 'esigma' | 'epi',
  value: string,
}

export type ChangeFixedAction = {
  type: 'changedFixed',
  index: number,
  value: boolean,
}

export type FocusAction = {
  type: 'focused',
  index: number,
  state: 'start' | 'end',
}

export type BlurAction = {
  type: 'blurred'
}

export type HoverAction = {
  type: 'hovered',
  selectedState: number,
}

export type Action = AddAction | ImportAction | DeleteAction | ChangeFixedAction | ChangeValueAction | FocusAction | BlurAction | HoverAction;

const LigandFieldContext = React.createContext({} as LigandField);

const LigandFieldDispatchContext = React.createContext((() => {}) as React.Dispatch<Action>);

const initialLigandField: LigandField = {
  ligands: [{
    start: {
      x: '',
      y: '', 
      z: '',
      esigma: '',
      epi: '',
    },
    end: {
      x: '',
      y: '', 
      z: '',
      esigma: '',
      epi: '',
    },
    fixed: true,
  }],
  selected: -1,
  selectedState: 0,
};

export function CSVtoLigands(csv: string): Array<LigandInput> | null {
  const lines = csv.split(/\n/);
  const ligands = new Array<LigandInput>(lines.length);
  for (let l = 0; l < lines.length; l++) {
    const cells = lines[l].split(/,/);
    if (cells.length != 11) return null;
    for (let c = 0; c < cells.length; c++) {
      const value = parseFloat(cells[c]);
      if (value === undefined || isNaN(value) || !isFinite(value)) return null;
    }
    console.log(`line ${l}`)
    console.log(cells[10])
    console.log(Boolean(cells[10]))
    ligands[l] = {
      start: {
        x: cells[0],
        y: cells[1],
        z: cells[2],
        esigma: cells[3],
        epi: cells[4],
      },
      end: {
        x: cells[5],
        y: cells[6],
        z: cells[7],
        esigma: cells[8],
        epi: cells[9],
      },
      fixed: cells[10] === '1',
    }
  }
  return ligands;
}

export function ligandsToCSV(ligands: Array<LigandInput>): string | null {
  return ligands.map(ligandInput => {
    const ligand = validateLigandInput(ligandInput);
    if (ligand === null) return null;

    const start = ligand.start;
    const end = (ligand.fixed) ? start : ligand.end;
    return [start.x, start.y, start.z, start.esigma, start.epi, end.x, end.y, end.z, end.esigma, end.epi, ligand.fixed ? 1 : 0].join(',')
  }).join('\n');
}

function ligandFieldReducer(ligandField: LigandField, action: Action) {
  switch (action.type) {
    case 'added': {
      action = action as AddAction;
      const newLigand: LigandInput = {
        start: {
          x: '',
          y: '',
          z: '',
          esigma: action.esigma !== undefined ? action.esigma : '',
          epi: action.epi !== undefined ? action.epi : '',
        },
        end: {
          x: '',
          y: '',
          z: '',
          esigma: action.esigma !== undefined ? action.esigma : '',
          epi: action.epi !== undefined ? action.epi : '',
        },
        fixed: true,
      }

      const isEmpty = (ligandStateInput: LigandStateInput) => (
        ligandStateInput.x === '' &&
        ligandStateInput.y === '' &&
        ligandStateInput.z === '' &&
        ligandStateInput.esigma === ''
        && ligandStateInput.epi === '');

      if (ligandField.ligands.length === 1 && isEmpty(ligandField.ligands[0].start) && isEmpty(ligandField.ligands[0].end) && ligandField.ligands[0].fixed && !(action.esigma === undefined || action.epi === undefined))
        ligandField.ligands[0] = newLigand;
      else
        ligandField.ligands.push(newLigand);
      break;
    }
    case 'imported': {
      action = action as ImportAction;

      ligandField.ligands = action.ligands;
      ligandField.selected = -1;
      ligandField.selectedState = 0;
      break;
    }
    case 'deleted': {
      action = action as DeleteAction;
      const index = action.index;
      if (index < 0 || index >= ligandField.ligands.length) console.error('Index out of bounds');

      ligandField.ligands.splice(index, 1);
      break;
    }
    case 'changedValue': {
      action = action as ChangeValueAction;
      const index = action.index;
      if (index < 0 || index >= ligandField.ligands.length) console.error('Index out of bounds');

      ligandField.ligands[index][action.state][action.key] = action.value;
      break;
    }
    case 'changedFixed': {
      action = action as ChangeFixedAction;
      const index = action.index;
      if (index < 0 || index >= ligandField.ligands.length) console.error('Index out of bounds');

      if (ligandField.ligands[index].fixed !== action.value) {
        ligandField.ligands[index].end = { ...ligandField.ligands[index].start };
        ligandField.ligands[index].fixed = action.value;
      }
      break;
    }
    case 'focused': {
      action = action as FocusAction;
      const index = action.index;
      if (index < 0 || index >= ligandField.ligands.length) console.error('Index out of bounds');

      ligandField.selected = index;
      ligandField.selectedState = action.state === 'start' ? 0 : 1;
      break;
    }
    case 'blurred': {
      action = action as BlurAction;
      ligandField.selected = -1;
      break;
    }
    case 'hovered': {
      action = action as HoverAction;
      ligandField.selectedState = action.selectedState;
      break;
    }
  }

  if (ligandField.ligands.length === 0) {
    ligandField.ligands = structuredClone(initialLigandField.ligands);
    ligandField.selected = initialLigandField.selected;
  }
}

export function LigandFieldProvider(props: { children: React.ReactNode }) {
  const [ligandField, dispatch] = useImmerReducer(ligandFieldReducer, initialLigandField);

  return (
    <LigandFieldContext.Provider value={ligandField}>
      <LigandFieldDispatchContext.Provider value={dispatch}>
        {props.children}
      </LigandFieldDispatchContext.Provider>
    </LigandFieldContext.Provider>
  );
}

export function useLigandField() {
  return React.useContext(LigandFieldContext);
}

export function useLigandFieldDispatch() {
  return React.useContext(LigandFieldDispatchContext);
}
