import * as React from 'react';
import LigandField from './LigandField';
import { LigandFieldProvider } from './LigandFieldContext';

// TODO: maybe add navbar and option for problem set / tutorial

export default function App() {
  return (
    <LigandFieldProvider>
      <LigandField />
    </LigandFieldProvider>
  );
}
