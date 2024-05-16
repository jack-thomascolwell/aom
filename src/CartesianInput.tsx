import React from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';

export default function CartesianInput(props: {sx?: any, sxInput?: any, onChange?: React.ChangeEventHandler, onFocus?: React.FocusEventHandler, onBlur?: React.FocusEventHandler, value: { x: string, y: string, z: string}}): JSX.Element {
    return (<>
        <Stack direction='row' alignItems='stretch' justifyContent='flex-start' useFlexGap spacing={0.5} sx={[props.sx, {
            marginTop: 0.5,
            marginBottom: 0.5,
        }]}>
            <Box component='span' sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'nowrap',
                '&::after': {
                    transform: 'scaleY(2.75)',
                    fontWeight: 'bold',
                    content: '"("',
                }
            }}/>
            <div css={{
                marginTop: '0.25em',
                marginBottom: '0.25em',
                ...props.sxInput
            }}>
                <TextField fullWidth autoComplete='off' name='x' label='x' variant='standard' onChange={props.onChange} onFocus={props.onFocus} onBlur={props.onBlur} value={ props.value.x } />
            </div>
            <Box component='span' sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexWrap: 'nowrap',
                '&::after': {
                    transform: 'translate(-0.125em,0.125em)',
                    fontWeight: 'bold',
                    content: '","',
                }
            }}/>
            <div css={{
                marginTop: '0.25em',
                marginBottom: '0.25em',
                ...props.sxInput
            }}>
                <TextField fullWidth autoComplete='off' name='y' label='y' variant='standard' onChange={props.onChange} onFocus={props.onFocus} onBlur={props.onBlur} value={ props.value.y } />
            </div>
            <Box component='span' sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                alignItems: 'center',
                flexWrap: 'nowrap',
                '&::after': {
                    transform: 'translate(-0.125em,0.125em)',
                    fontWeight: 'bold',
                    content: '","',
                }
            }}/>
            <div css={{
                marginTop: '0.25em',
                marginBottom: '0.25em',
                ...props.sxInput
            }}>
                <TextField fullWidth autoComplete='off' name='z' label='z' variant='standard' onChange={props.onChange} onFocus={props.onFocus} onBlur={props.onBlur} value={ props.value.z } />
            </div>
            <Box component='span' sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                flexWrap: 'nowrap',
                '&::after': {
                    transform: 'scaleY(2.75)',
                    fontWeight: 'bold',
                    content: '")"',
                }
            }}/>
        </Stack>
    </>);
}