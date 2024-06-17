import React from 'react';
import { Paper, Stack } from '@mui/material';
import { useLigandField, validateLigandInput, useLigandFieldDispatch, HoverAction, interpolate, toSpherical } from './LigandFieldContext';
import { ChartsAxisHighlight, ChartsClipPath, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot, ResponsiveChartContainer, useDrawingArea, useXScale } from '@mui/x-charts';
import useId from '@mui/utils/useId';
import { ScaleLinear } from 'd3-scale';
import * as math from 'mathjs';

function XValue(props: { svgRef: React.RefObject<SVGElement>, selectedState: number, onChange?: (x: number | null)=>void }) {
    const { svgRef } = props;

    const { left, top, width, height } = useDrawingArea();

    const axisScale = useXScale() as ScaleLinear<any, any>;

    const [mouseX, setMouseX] = React.useState<null | number>(null);

    React.useEffect(() => {
        const el = svgRef.current;
        if (el === null) return () => {};

        const handleMouseOut = () => setMouseX(null);
        const handleMouseMove = (event: MouseEvent) => {
            const x = event.offsetX;
            const y = event.offsetY;
            if (x < left || x > left + width || y < top || y > top + height) setMouseX(null);
            else setMouseX(Math.max(Math.min(left + width, x), left));
        };

        el.addEventListener('mouseout', handleMouseOut);
        el.addEventListener('mousemove', handleMouseMove);
        return () => {
            el.removeEventListener('mouseout', handleMouseOut);
            el.removeEventListener('mousemove', handleMouseMove);
        };
    }, [left, top, width, height, svgRef]);

    React.useEffect(() => {
        if (props.onChange) props.onChange((mouseX === null ? null : axisScale.invert(mouseX)))
    }, [mouseX]);

    return (<line strokeWidth={0.25} strokeDasharray={2} stroke='black' x1={axisScale(props.selectedState)} x2={axisScale(props.selectedState)} y1={top} y2={top + height}></line>);
}

export default function FixedLigandFieldEnergies(props: { sx?: any }) {
    const ligandField = useLigandField();
    const dispatch = useLigandFieldDispatch();
    const [steps, setSteps] = React.useState<number>(50);

    const dataset = Array<{rxnCoordinate: number, 'psi0': number, 'psi1': number, 'psi2': number, 'psi3': number, 'psi4': number}>();
    const matrices = Array<Array<number>>(steps+1);
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

        console.log([matrix.slice(0,5), matrix.slice(5,10), matrix.slice(10,15), matrix.slice(15,20), matrix.slice(20,25)])
        const mat = math.matrix([matrix.slice(0,5), matrix.slice(5,10), matrix.slice(10,15), matrix.slice(15,20), matrix.slice(20,25)]);
        const eig = math.eigs(mat, {eigenvectors: true, precision: 1e-6});
        const energies = (eig.values as math.Matrix).toArray() as Array<number>;
        const wavefunctions = eig.eigenvectors;
        console.log(energies);
        console.log(wavefunctions);

        const floor = (x:number) => (Math.abs(x) < 1e-8 ? 0 : x);
        
        matrices[step] = matrix;
        dataset.push({
            rxnCoordinate,
            'psi0': floor(energies[0]),
            'psi1': floor(energies[1]),
            'psi2': floor(energies[2]),
            'psi3': floor(energies[3]),
            'psi4': floor(energies[4]),
        });
    };

    const clipPathId = `${useId()}-clip-path`;

    /* Handle mouse events to get hovered x value */
    const svgRef = React.useRef<SVGElement>(null);
    const handleHover = (x: number | null) => {
        if (x === null) return;//x = Math.floor(ligandField.selectedState + 0.5);
        const action: HoverAction = {
            type: 'hovered',
            selectedState: Math.floor(x * steps + 0.5) / steps,
        }
        dispatch(action);
    }

    console.log(dataset);

    return (
        <Paper sx= { props.sx }>
            <div css={{ width: "100%", height: "100%" }}>
                <ResponsiveChartContainer
                    ref={svgRef}
                    xAxis={[{
                        dataKey: 'rxnCoordinate',
                        valueFormatter: value => `${(Math.max(0,Math.min(1,value)) * 100).toFixed(0)}%`,
                        min: 0,
                        max: 1,
                    }]}
                    series={[0,1,2,3,4].map((i) => ({
                        type: 'line',
                        dataKey: `psi${i}`,
                        label: `\u03A8${i}`,
                        showMark: false,
                    }))}
                    dataset={dataset}>
                    <g clipPath={`url(#${clipPathId})`}>
                        <LinePlot/>
                    </g>
                    <ChartsClipPath id={clipPathId} />
                    <ChartsTooltip />
                    <ChartsAxisHighlight />
                    <ChartsXAxis label={`reaction coordinate = ${`${(Math.max(0,Math.min(1,ligandField.selectedState)) * 100).toFixed(0)}%`}`}/>
                    <ChartsYAxis label='one-electron energy'/>
                    <XValue svgRef={svgRef} onChange={handleHover} selectedState={ligandField.selectedState}/>
                </ResponsiveChartContainer>
            </div>
        </Paper>
    );
}