import * as React from 'react';
import LigandField from './LigandField';
import { LigandFieldProvider } from './LigandFieldContext';

/*
Main app component
*/

export default function App() {
  return (
    <LigandFieldProvider>
      <LigandField />
    </LigandFieldProvider>
  );
}
