import React from 'react';
import { TextField, IconButton, Stack, Tooltip} from '@mui/material'
import { ArrowDownward, ArrowUpward, Close, SubdirectoryArrowRight }from '@mui/icons-material';
import { useLigandField, useLigandFieldDispatch, validateLigandStateInput, ChangeValueAction, FocusAction, BlurAction, ChangeFixedAction, DeleteAction} from './LigandFieldContext';
import CartesianInput from "./CartesianInput";

export default function LigandInputComponent(props: {sx?: any, index: number}) {
    const ligandField = useLigandField();
    const dispatch = useLigandFieldDispatch();
    
    const index = props.index;
    if (index < 0 || index >= ligandField.ligands.length) throw Error('Index out of bounds');
    const ligandInput = ligandField.ligands[index];

    const sanitizeValue = (value: number) => {
        if (value === Infinity || value === undefined || value === null) return '';
        if (value === -Infinity) return '-';
        return value.toString();
    }

    const handleChangeValue = (state: 'start' | 'end') => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const key = event.target.name;
            if (key !== 'x' && key !== 'y' && key !== 'z' && key !== 'esigma' && key !== 'epi') throw Error('Invalid key');

            const action: ChangeValueAction = {
                type: 'changedValue',
                index: index,
                state: state,
                key: key,
                value: event.target.value,
            }
            dispatch(action);
        };
    };

    const handleFocus = (state: 'start' | 'end') => {
        return (event: React.FocusEvent<HTMLInputElement>) => {
            const action: FocusAction = {
                type: 'focused',
                index: index,
                state: state,
            }
            dispatch(action);
        };
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        const action: BlurAction = {
            type: 'blurred',
        }
        dispatch(action);
    };

    const handleChangeFixed = (event: React.MouseEvent<HTMLButtonElement>) => {
        const action: ChangeFixedAction = {
            type: 'changedFixed',
            index: index,
            value: !ligandInput.fixed,
        }
        dispatch(action);
    };

    const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
        const action: DeleteAction = {
            type: 'deleted',
            index: index,
        }
        dispatch(action);
    };
    
    return (
        <Stack direction='column' justifyContent='flex-start' alignItems='stretch' spacing={0} sx={props.sx} useFlexGap p={1}>
            <Stack direction='row' justifyContent='flex-start' alignItems='center' spacing={1} useFlexGap>
                <CartesianInput sxInput={{width: '3em'}}
                    onChange={ handleChangeValue('start') }
                    onFocus={ handleFocus('start') }
                    onBlur={ handleBlur }
                    value={{
                        x: ligandInput.start.x,
                        y: ligandInput.start.y,
                        z: ligandInput.start.z
                    }} />
                <div css={{width: '3em'}}>
                    <TextField autoComplete='off' name='esigma' label='e&sigma;' variant='standard' fullWidth
                        onChange={ handleChangeValue('start') }
                        onFocus={ handleFocus('start') }
                        onBlur={ handleBlur }
                        value={ ligandInput.start.esigma } />
                </div>
                <div css={{width: '3em'}}>
                    <TextField autoComplete='off' name='epi' label='e&pi;' variant='standard' fullWidth
                        onChange={ handleChangeValue('start') }
                        onFocus={ handleFocus('start') }
                        onBlur={ handleBlur }
                        value={  ligandInput.start.epi } />
                </div>
                
                <IconButton sx={{marginLeft: 'auto'}}
                    onClick={ handleChangeFixed }
                    disabled={ ligandInput.fixed && validateLigandStateInput(ligandInput.start)===null }>
                    <Tooltip title={ ligandInput.fixed ? 'Vary ligand' : 'Fix ligand'} arrow>
                        { ligandInput.fixed ? <ArrowDownward /> : <ArrowUpward /> }
                    </Tooltip>
                </IconButton>
                <IconButton onClick={ handleDelete } >
                    <Tooltip title="Delete ligand" disableTouchListener arrow>
                        <Close />
                    </Tooltip>
                </IconButton>
            </Stack>
            { ligandInput.fixed ? null :
                <Stack direction='row' justifyContent='flex-start' alignItems='center' spacing={1} useFlexGap >
                    <SubdirectoryArrowRight fontSize='large'/>
                    <CartesianInput sx={{width: '36%'}}
                    onChange={ handleChangeValue('end') }
                    onFocus={ handleFocus('end') }
                    onBlur={ handleBlur }
                    value={{
                        x: ligandInput.end.x,
                        y: ligandInput.end.y,
                        z: ligandInput.end.z
                    }} />
                    <TextField autoComplete='off' name='esigma' label='e&sigma;' variant='standard' sx={{width: '12%'}}
                        onChange={ handleChangeValue('end') }
                        onFocus={ handleFocus('end') }
                        onBlur={ handleBlur }
                        value={ ligandInput.end.esigma } />
                    <TextField autoComplete='off' name='epi' label='e&pi;' variant='standard' sx={{width: '12%'}}
                        onChange={ handleChangeValue('end') }
                        onFocus={ handleFocus('end') }
                        onBlur={ handleBlur }
                        value={ ligandInput.end.epi } />
                </Stack>
            }
        </Stack>
    )
};