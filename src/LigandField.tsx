import React from 'react';
import { LigandFieldProvider } from './LigandFieldContext';
import LigandFieldInput from './LigandFieldInput';
import LigandFieldVisualizer from './LigandFieldVisualizer';
import LigandFieldEnergies from './LigandFieldEnergies';
import { Grid } from '@mui/material';

export default function FixedLigandField() {
    return (
        <LigandFieldProvider>
            <Grid container spacing={2} sx={{width: "100vw", height: "100vh"}} p={1}>
                <Grid item xs={6}>
                    <LigandFieldInput sx={{width: "100%", height: "100%"}}/>
                </Grid>
                <Grid item xs={3}>
                    <LigandFieldEnergies sx={{width: "100%", height: "100%"}}/>
                </Grid>
                <Grid item xs={3}>
                    <LigandFieldVisualizer sx={{width: "100%", height: "100%"}}/>
                </Grid>
            </Grid>
        </LigandFieldProvider>
    )
}