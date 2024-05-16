import React from 'react';
import { Paper } from '@mui/material';
import { useLigandField, validateLigand, useLigandFieldDispatch, HoverAction, interpolate, toSpherical } from './LigandFieldContext';
import { ChartsAxisHighlight, ChartsClipPath, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot, ResponsiveChartContainer, useDrawingArea, useXScale } from '@mui/x-charts';
import useId from '@mui/utils/useId';
import { ScaleLinear } from 'd3-scale';

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

    const dataset = Array<{rxnCoordinate: number, 'z2': number, 'yz': number, 'xz': number, 'xy': number, 'x2-y2': number}>();
    const matrices = Array<Array<number>>(steps+1);
    for (let step = 0; step <= steps; step++) {
        const rxnCoordinate = step / steps;
        let matrix = new Array<number>(25);
        let energy = [0,0,0,0,0];
        ligandField.ligands.filter(validateLigand).forEach((ligand, i) => {
            const start = ligand.start;
            const end = (ligand.fixed ? start : ligand.end);
            const state = interpolate(ligand, rxnCoordinate);
            if (state === null) return;
            const { x, y, z, esigma, epi } = state;

            const angles = toSpherical(x,y,z);
            if (angles === null) return;
            const {theta, phi} = angles;
            
            const mat = [
                0.25 * (1 + 3*Math.cos(2*theta)), 0, -0.866025 * Math.sin(2*theta), 0, 0.433013 * (1 - Math.cos(2*theta)),
                0.866025 * Math.sin(phi) * Math.sin(2*theta), Math.cos(phi)*Math.cos(theta), Math.sin(phi)*Math.cos(2*theta), -1*Math.cos(phi)*Math.sin(theta), -0.5*Math.sin(phi)*Math.sin(2*theta),
                0.866025 * Math.cos(phi) * Math.sin(2*theta), -1*Math.sin(phi)*Math.cos(theta), Math.cos(phi)*Math.cos(2*theta), Math.sin(phi)*Math.sin(theta), -0.5*Math.cos(phi)*Math.sin(2*theta),
                0.433013 * Math.sin(2*phi) * (1 - Math.cos(2*theta)), Math.cos(2*phi)*Math.sin(theta), 0.5 * Math.sin(2*phi)*Math.sin(2*theta), Math.cos(2*phi)*Math.cos(theta), 0.25 * Math.sin(2*phi) * (3 + Math.cos(2*theta)),
                0.433013 * Math.cos(2*phi) * (1 - Math.cos(2*theta)), -1*Math.sin(2*phi)*Math.sin(theta), 0.5 * Math.cos(2*phi)*Math.sin(2*theta), -1*Math.sin(2*phi)*Math.cos(theta), 0.25 * Math.cos(2*phi) * (3 + Math.cos(2*theta))
            ];
            const mat2 = mat.map(x => x*x);

            matrix = matrix.map((x,j) => x + mat[j]);
            energy = energy.map((x,j) => x + esigma*mat2[j*5] + epi*(mat[j*5+1] + mat[j*5+2]));
        });

        const floor = (x:number) => (Math.abs(x) < 1e-8 ? 0 : x);
        
        matrices[step] = matrix;
        dataset.push({
            rxnCoordinate,
            'z2': floor(energy[0]),
            'yz': floor(energy[1]),
            'xz': floor(energy[2]),
            'xy': floor(energy[3]),
            'x2-y2': floor(energy[4]),
        });
    };

    const clipPathId = `${useId()}-clip-path`;

    /* Handle mouse events to get hovered x value */
    const svgRef = React.useRef<SVGElement>(null);
    const handleHover = (x: number | null) => {
        if (x === null) x = Math.floor(ligandField.selectedState + 0.5);
        const action: HoverAction = {
            type: 'hovered',
            selectedState: Math.floor(x * steps + 0.5) / steps,
        }
        dispatch(action);
    }

    return (
        <Paper sx= { props.sx }>
            <div css={{ width: "100%", height: "100%" }}>
            <ResponsiveChartContainer
                ref={svgRef}
                xAxis={[{
                    dataKey: 'rxnCoordinate',
                    valueFormatter: (value) => value.toString(),
                    min: 0,
                    max: 1,
                }]}
                series={['z2','yz','xz','xy','x2-y2'].map((name, i) => ({
                    type: 'line',
                    dataKey: name,
                    label: `d${name}`,
                    showMark: false,
                }))}
                dataset={dataset}>
                <g clipPath={`url(#${clipPathId})`}>
                    <LinePlot/>
                </g>
                <ChartsClipPath id={clipPathId} />
                <ChartsTooltip />
                <ChartsAxisHighlight />
                <ChartsXAxis />
                {/* <ChartsYAxis /> */}
                <XValue svgRef={svgRef} onChange={handleHover} selectedState={ligandField.selectedState}/>
            </ResponsiveChartContainer>
            </div>
        </Paper>
    );
}