import React, { Key } from 'react';
import { useImmerReducer } from "use-immer";

export type LigandField = {
  ligands: Array<Ligand>,
  selected: number,
  selectedState: number,
}

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
  const end = (ligand.fixed ? ligand.start : ligand.end);

  const anglesStart = toSpherical(start.x, start.y, start.z);
  const anglesEnd = toSpherical(end.x, end.y, end.z);
  if (anglesStart === null || anglesEnd === null) return null;
  // edge case where phi is ambiguous
  if (anglesStart.phi === 0) anglesStart.phi = anglesEnd.phi;
  if (anglesEnd.phi === 0) anglesEnd.phi = anglesStart.phi;
  const theta = (1 - selectedState) * anglesStart.theta + selectedState * anglesEnd.theta;
  const phi = (1 - selectedState) * anglesStart.phi + selectedState * anglesEnd.phi;
  const {x, y, z} = toCartesian(theta, phi);

  const esigma = (1 - selectedState) * start.esigma + selectedState * end.esigma;
  const epi = (1 - selectedState) * start.epi + selectedState * end.epi;

  return { x, y, z, esigma, epi };
}


export function validateLigand(ligand: Ligand): boolean {
  return (ligand.fixed || validateLigandState(ligand.end)) && validateLigandState(ligand.start);
}

export function validateLigandState(ligand: LigandState): boolean {
  return (typeof(ligand.x) === 'number' && !isNaN(ligand.x) && isFinite(ligand.x) && 
          typeof(ligand.y) === 'number' && !isNaN(ligand.y) && isFinite(ligand.y) &&
          typeof(ligand.z) === 'number' && !isNaN(ligand.z) && isFinite(ligand.z) &&
          typeof(ligand.esigma) === 'number' && !isNaN(ligand.esigma) && isFinite(ligand.esigma) &&
          typeof(ligand.epi) === 'number' && !isNaN(ligand.epi) && isFinite(ligand.epi) &&
          !(ligand.x===0 && ligand.y===0 && ligand.z===0));
}

export type AddAction = {
  type: 'added',
  esigma?: number,
  epi?: number,
}

export type ImportAction = {
  type: 'imported',
  ligands: Array<Ligand>,
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
  value: number,
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
      x: Infinity,
      y: Infinity, 
      z: Infinity,
      esigma: Infinity,
      epi: Infinity,
    },
    end: {
      x: Infinity,
      y: Infinity, 
      z: Infinity,
      esigma: Infinity,
      epi: Infinity,
    },
    fixed: true,
  }],
  selected: -1,
  selectedState: 0,
};

export function CSVtoLigands(csv: string): Array<Ligand> | 'error' {
  const lines = csv.split(/\n/);
  const ligands = new Array<Ligand>(lines.length);
  for (let l = 0; l < lines.length; l++) {
    const cells = lines[l].split(/,/);
    if (cells.length != 11) return 'error';
    const numericCells = Array<number>(cells.length);
    for (let c = 0; c < cells.length; c++) {
      const value = parseFloat(cells[c]);
      if (value === undefined || isNaN(value) || !isFinite(value)) return 'error';
      numericCells[c] = value;
    }
    ligands[l] = {
      start: {
        x: numericCells[0],
        y: numericCells[1],
        z: numericCells[2],
        esigma: numericCells[3],
        epi: numericCells[4],
      },
      end: {
        x: numericCells[5],
        y: numericCells[6],
        z: numericCells[7],
        esigma: numericCells[8],
        epi: numericCells[9],
      },
      fixed: Boolean(numericCells[10])
    }
  }
  return ligands;
}

export function ligandsToCSV(ligands: Array<Ligand>): string | 'error' {
  return ligands.map(ligand => {
    if (!validateLigand(ligand)) return '';
    let {start, end} = ligand;
    if (ligand.fixed) end = start;
    return [start.x, start.y, start.z, start.esigma, start.epi, end.x, end.y, end.z, end.esigma, end.epi, ligand.fixed ? 1 : 0].join(',')
  }).join('\n');
}

function ligandFieldReducer(ligandField: LigandField, action: Action) {
  switch (action.type) {
    case 'added': {
      action = action as AddAction;
      const newLigand = {
        start: {
          x: Infinity,
          y: Infinity,
          z: Infinity,
          esigma: action.esigma !== undefined ? action.esigma : Infinity,
          epi: action.epi !== undefined ? action.epi : Infinity,
        },
        end: {
          x: Infinity,
          y: Infinity,
          z: Infinity,
          esigma: action.esigma !== undefined ? action.esigma : Infinity,
          epi: action.epi !== undefined ? action.epi : Infinity,
        },
        fixed: true,
      }

      const isEmpty = (ligandState: LigandState) => (
        ligandState.x === Infinity &&
        ligandState.y === Infinity &&
        ligandState.z === Infinity &&
        ligandState.esigma === Infinity
        && ligandState.epi === Infinity);

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
