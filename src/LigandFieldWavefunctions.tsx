import React from 'react';
import { useTheme, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';


/*
Component to display the AOM wavefunctions as a table. Coefficients are normalized
*/
export default function LigandFieldWavefunctions(props: { sx?: any, eigenvectors: Array<number>, palette: string[]}) {
    const theme = useTheme();
    const round = (x: number) => (x < 0 ? '' : '\u00A0') + x.toFixed(2);

    return (
        <TableContainer component={Paper} sx= {{ ...props.sx, overflow: 'auto', scrollbarWidth: "none", '&::-webkit-scrollbar': { display: 'none' }, '&-ms-overflow-style:': { display: 'none' } }}>
            <Table size='small'>
                <TableHead>
                    <TableRow>
                    <TableCell align="right">dz2</TableCell>
                    <TableCell align="right">dyz</TableCell>
                    <TableCell align="right">dxz</TableCell>
                    <TableCell align="right">dxy</TableCell>
                    <TableCell align="right">dx2-y2</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {['z2','yz','xz','xy','x2-y2'].map((orbital, i) => (
                        <TableRow key={orbital} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                            {[0,1,2,3,4].map(j => 
                                <TableCell sx={{ color: props.palette[i] }} key={i*5+j} align="right">{round(props.eigenvectors[i*5+j])}</TableCell>
                            )}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </TableContainer>
        // <Paper >
        //     <div css={{position: 'sticky', top: 0, backgroundColor: theme.palette.background.paper, zIndex: 1}}>
        //         <Stack direction='row' justifyContent='flex-end' alignItems='flex-end' useFlexGap p={1} spacing={1}>
        //             <Typography variant='h6' sx={{marginRight: 'auto'}} >Eigenfunctions</Typography>
        //         </Stack>
        //         <Divider orientation='horizontal' />
        //     </div>
        //     { ['z2','yz','xz','xy','x2-y2'].map((name, i) =>
        //         <div key={name}>
        //             {[0,1,2,3,4].map(j => 
        //                 <span css={{color: props.palette[i]}}>{round(props.eigenvectors[i*5+j])} </span>
        //             )}
        //         </div>
        //     )}
        // </Paper>
    );
}