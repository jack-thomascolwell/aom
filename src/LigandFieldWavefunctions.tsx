import React from 'react';
import { useTheme, Paper } from '@mui/material';
import { ChartsColorPalette } from '@mui/x-charts';

export default function LigandFieldWavefunctions(props: { sx?: any, eigenvectors: Array<number>, palette: string[]}) {
    const round = (x: number) => Math.round(x * 100) / 100;
    console.log(props.palette);
    return (
        <Paper sx= {{ ...props.sx }}>
            { ['z2','yz','xz','xy','x2-y2'].map((name, i) =>
                <div key={name}>
                    {[0,1,2,3,4].map(j => 
                        <span css={{color: props.palette[i]}}>{round(props.eigenvectors[i*5+j])} </span>
                    )}
                </div>
            )}
        </Paper>
    );
}