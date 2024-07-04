import React from 'react';
import { Paper } from '@mui/material';
import { useLigandFieldDispatch, HoverAction, useLigandField } from './LigandFieldContext';
import { ChartsAxisHighlight, ChartsClipPath, ChartsColorPalette, ChartsTooltip, ChartsXAxis, ChartsYAxis, LinePlot, ResponsiveChartContainer, useDrawingArea, useXScale } from '@mui/x-charts';
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

export default function LigandFieldEnergies(props: { sx?: any, steps: number, dataset: Array<{rxnCoordinate: number, 'psi0': number, 'psi1': number, 'psi2': number, 'psi3': number, 'psi4': number}>, palette: ChartsColorPalette}) {
    const ligandField = useLigandField();
    const clipPathId = `${useId()}-clip-path`;
    const dispatch = useLigandFieldDispatch();

    /* Handle mouse events to get hovered x value */
    const svgRef = React.useRef<SVGElement>(null);
    const handleHover = (x: number | null) => {
        if (x === null) return;//x = Math.floor(ligandField.selectedState + 0.5);
        const action: HoverAction = {
            type: 'hovered',
            selectedState: Math.floor(x * props.steps + 0.5) / props.steps,
        }
        dispatch(action);
    }

    return (
        <Paper sx= {{ ...props.sx }}>
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
                    label: `\u03C8${i}`,
                    showMark: false,
                }))}
                dataset={props.dataset}>
                <g clipPath={`url(#${clipPathId})`}>
                    <LinePlot colors={props.palette} />
                </g>
                <ChartsClipPath id={clipPathId} />
                <ChartsTooltip />
                <ChartsAxisHighlight />
                <ChartsXAxis label={`reaction coordinate = ${`${(Math.max(0,Math.min(1,ligandField.selectedState)) * 100).toFixed(0)}%`}`}/>
                <ChartsYAxis />
                <XValue svgRef={svgRef} onChange={handleHover} selectedState={ligandField.selectedState}/>
            </ResponsiveChartContainer>
        </Paper>
    );
}