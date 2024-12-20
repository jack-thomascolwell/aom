import React from 'react';
import LigandFieldInput from './LigandFieldInput';
import LigandFieldVisualizer from './LigandFieldVisualizer';
import LigandFieldEnergies from './LigandFieldEnergies';
import LigandFieldWavefunctions from './LigandFieldWavefunctions';
import { useTheme, Typography, Link } from '@mui/material';
import { useLigandField, validateLigandInput, interpolate, toSpherical } from './LigandFieldContext';
import * as math from 'mathjs';
import { blueberryTwilightPalette, ChartsColorPalette } from '@mui/x-charts/colorPalettes';

/*
Main component for ligand field input and output. Hanldes the ligand field input and computes the AOM matrices, energies, and wavefunctions
*/

export default function LigandField() {
    // energy and eigenvector calculations
    const ligandField = useLigandField();
    const [steps, setSteps] = React.useState<number>(50);
    const theme = useTheme();
    const palette: ChartsColorPalette = blueberryTwilightPalette(theme.palette.mode);

    const dataset = Array<{rxnCoordinate: number, 'psi0': number, 'psi1': number, 'psi2': number, 'psi3': number, 'psi4': number}>();
    const matrices = Array<Array<number>>(steps+1);
    const eigenvectors = Array<Array<number>>(steps+1);
    const energies = Array<Array<number>>(steps+1);
    for (let step = 0; step <= steps; step++) {
        const rxnCoordinate = step / steps;
        let matrix = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for (const ligandInput of ligandField.ligands) {
            const ligand = validateLigandInput(ligandInput);
            if (ligand === null) continue;
            const state = interpolate(ligand, rxnCoordinate);
            if (state === null) continue;
            
            const { x, y, z, esigma, epi } = state;

            const angles = toSpherical(x,y,z);
            if (angles === null) continue;
            const {theta, phi} = angles;
            const psi = 0;

            //Figgis pg 61
            // z2, yz, xz, xy, x2-y2
            const fSigma = [
                (1 + 3*Math.cos(2*theta)) / 4,
                (Math.sqrt(3) * Math.sin(phi) * Math.sin(2*theta)) / 2,
                (Math.sqrt(3) * Math.cos(phi) * Math.sin(2*theta)) / 2,
                (Math.sqrt(3) * Math.sin(2*phi) * (1 - Math.cos(2*theta))) / 4,
                (Math.sqrt(3) * Math.cos(2*phi) * (1 - Math.cos(2*theta))) / 4  
            ];

            const fPiy = [
                (Math.sqrt(3) * Math.cos(2*phi) * Math.sin(2*theta) * Math.sin(psi)) / 2,
                Math.cos(phi) * Math.cos(theta) * Math.cos(psi) - Math.sin(phi) * Math.cos(2*theta) * Math.sin(psi),
                -Math.sin(phi) * Math.cos(theta) * Math.cos(psi) - Math.cos(phi) * Math.cos(2*theta) * Math.sin(psi),
                Math.cos(2*phi) * Math.sin(theta) * Math.cos(psi) - (Math.sin(2*phi) * Math.sin(2*theta) * Math.sin(psi) / 2),
                -Math.sin(2*phi) * Math.sin(theta) * Math.cos(psi) - (Math.cos(2*phi) * Math.sin(2*theta) * Math.sin(psi) / 2)
            ];

            const fPix = [
                (-Math.sqrt(3) * Math.cos(2*phi) * Math.sin(2*theta) * Math.cos(psi)) / 2,
                Math.cos(phi) * Math.cos(theta) * Math.sin(psi) + Math.sin(phi) * Math.cos(2*theta) * Math.cos(psi),
                -Math.sin(phi) * Math.cos(theta) * Math.sin(psi) + Math.cos(phi) * Math.cos(2*theta) * Math.cos(psi),
                Math.cos(2*phi) * Math.sin(theta) * Math.sin(psi) + (Math.sin(2*phi) * Math.sin(2*theta) * Math.cos(psi) / 2),
                -Math.sin(2*phi) * Math.sin(theta) * Math.sin(psi) + (Math.cos(2*phi) * Math.sin(2*theta) * Math.cos(psi) / 2)
            ];

            for (let i = 0; i < 5; i++)
                for (let j = 0; j < 5; j++)
                    matrix[i*5+j] += fSigma[i] * fSigma[j] * esigma + fPiy[i] * fPiy[j] * epi + fPix[i] * fPix[j] * epi;
        }

        const mat = math.matrix([matrix.slice(0,5), matrix.slice(5,10), matrix.slice(10,15), matrix.slice(15,20), matrix.slice(20,25)]);
        const eig = math.eigs(mat, {eigenvectors: true, precision: 1e-6});
        const energiesUnordered = (eig.values as math.Matrix).toArray() as Array<number>;
        const eigUnordered = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < 5; i++) {
            const psi = (eig.eigenvectors[i].vector as math.Matrix);
            for (let j = 0; j < 5; j++)
                eigUnordered[i*5+j] = (psi.get([j]) as number);
        }

        let selectedJ = [false,false,false,false,false]
        let ordering = [-1,-1,-1,-1,-1];
        for (let i = 0; i < 5; i++) { // basis function index
            let maxJ = 0;
            let max = -1;
            for (let j = 0; j < 5; j++) { // eigenvector index
                const projection = eigUnordered[j*5+i];
                if (projection * projection > max && !selectedJ[j]) {
                    max = projection * projection;
                    maxJ = j;
                }
            }
            ordering[i] = maxJ;
            selectedJ[maxJ] = true;
        }

        const floor = (x:number) => (Math.abs(x) < 1e-8 ? 0 : x);

        eigenvectors[step] = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];
        for (let i = 0; i < 5; i++)
            for (let j = 0; j < 5; j++)
                eigenvectors[step][i*5 + j] = floor(eigUnordered[ordering[i]*5 + j]);
        
        matrices[step] = matrix;
        energies[step] = [0,0,0,0,0];
        for (let i = 0; i < 5; i++)
            energies[step][i] = floor(energiesUnordered[ordering[i]]);

        dataset.push({
            rxnCoordinate,
            'psi0':    energies[step][0],
            'psi1':    energies[step][1],
            'psi2':    energies[step][2],
            'psi3':    energies[step][3],
            'psi4': energies[step][4],
        });
    };

    return (
        <div css={{display: 'grid', gridTemplateRows: '1fr auto auto', gridTemplateColumns: '45fr 30fr 25fr', width: '100vw', height: '100vh', padding: theme.spacing(1), gridRowGap: 0, gridColumnGap: theme.spacing(2) }}>
            <div css={{gridRow: '1/3', gridColumn: '1/1', width: '100%', height: '100%'}}>
                <LigandFieldInput sx={{width: "100%", height: "100%", maxHeight: '100%', maxWidth: '100%' }}/>
            </div>
            <div css={{gridRow: '1/3', gridColumn: '2/2', width: '100%', height: '100%'}}>
                <LigandFieldEnergies sx={{width: "100%", height: "100%", maxHeight: '100%', maxWidth: '100%' }} steps={steps} dataset={dataset} palette={palette}/>
            </div>
            <div css={{gridRow: '1/2', gridColumn: '3/3', width: '100%', height: '100%'}}>
                <LigandFieldVisualizer sx={{width: "100%", height: "100%", maxHeight: '100%', maxWidth: '100%' }}/>
            </div>
            <div css={{gridRow: '2/3', gridColumn: '3/3', width: '100%', height: '100%', paddingTop: theme.spacing(2)}}>
                <LigandFieldWavefunctions sx={{width: "100%", height: "100%", maxHeight: '100%', maxWidth: '100%' }} eigenvectors={eigenvectors[Math.floor(Math.max(0,Math.min(1,ligandField.selectedState)) * steps + 0.5)]}  palette={palette}/>
            </div>
            <div css={{textAlign: 'right', gridRow: '3/3', gridColumn: '1/4', width: '100%', height: '100%', paddingTop: theme.spacing(1)}}>
                <Typography variant='caption'>TODO: <Link href='#'>citation</Link></Typography>
            </div>
        </div>
    )
}