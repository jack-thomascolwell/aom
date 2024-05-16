import React from 'react';
import { TextField, IconButton, Stack, Tooltip} from '@mui/material'
import { ArrowDownward, ArrowUpward, Close, SubdirectoryArrowRight }from '@mui/icons-material';
import { useLigandField, useLigandFieldDispatch, validateLigandState, ChangeValueAction, FocusAction, BlurAction, ChangeFixedAction, DeleteAction} from './LigandFieldContext';
import CartesianInput from "./CartesianInput";

export default function LigandInput(props: {sx?: any, index: number}) {
    const ligandField = useLigandField();
    const dispatch = useLigandFieldDispatch();
    
    const index = props.index;
    if (index < 0 || index >= ligandField.ligands.length) throw Error('Index out of bounds');
    const ligand = ligandField.ligands[index];

    const sanitizeValue = (value: number) => {
        if (value === Infinity || value === undefined || value === null) return '';
        if (value === -Infinity) return '-';
        return value.toString();
    }

    const handleChangeValue = (state: 'start' | 'end') => {
        return (event: React.ChangeEvent<HTMLInputElement>) => {
            const key = event.target.name;
            if (key !== 'x' && key !== 'y' && key !== 'z' && key !== 'esigma' && key !== 'epi') throw Error('Invalid key');

            const value = event.target.value;
            let numericValue: number;
            if (value === undefined || value === '') numericValue = Infinity;
            else if (value === '-') numericValue = -Infinity;
            else numericValue = parseFloat(value);

            const action: ChangeValueAction = {
                type: 'changedValue',
                index: index,
                state: state,
                key: key,
                value: numericValue,
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
        const value = !ligand.fixed;

        const action: ChangeFixedAction = {
            type: 'changedFixed',
            index: index,
            value: value,
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
                        x: sanitizeValue(ligand.start.x),
                        y: sanitizeValue(ligand.start.y),
                        z: sanitizeValue(ligand.start.z)
                    }} />
                <div css={{width: '3em'}}>
                    <TextField autoComplete='off' name='esigma' label='e&sigma;' variant='standard' fullWidth
                        onChange={ handleChangeValue('start') }
                        onFocus={ handleFocus('start') }
                        onBlur={ handleBlur }
                        value={ sanitizeValue(ligand.start.esigma) } />
                </div>
                <div css={{width: '3em'}}>
                    <TextField autoComplete='off' name='epi' label='e&pi;' variant='standard' fullWidth
                        onChange={ handleChangeValue('start') }
                        onFocus={ handleFocus('start') }
                        onBlur={ handleBlur }
                        value={  sanitizeValue(ligand.start.epi) } />
                </div>
                
                <IconButton sx={{marginLeft: 'auto'}}
                    onClick={ handleChangeFixed }
                    disabled={ ligand.fixed && !validateLigandState(ligand.start) }>
                    <Tooltip title={ ligand.fixed ? 'Vary ligand' : 'Fix ligand'} arrow>
                        { ligand.fixed ? <ArrowDownward /> : <ArrowUpward /> }
                    </Tooltip>
                </IconButton>
                <IconButton onClick={ handleDelete } >
                    <Tooltip title="Delete ligand" disableTouchListener arrow>
                        <Close />
                    </Tooltip>
                </IconButton>
            </Stack>
            { ligand.fixed ? null :
                <Stack direction='row' justifyContent='flex-start' alignItems='center' spacing={1} useFlexGap >
                    <SubdirectoryArrowRight fontSize='large'/>
                    <CartesianInput sx={{width: '36%'}}
                    onChange={ handleChangeValue('end') }
                    onFocus={ handleFocus('end') }
                    onBlur={ handleBlur }
                    value={{
                        x: sanitizeValue(ligand.end.x),
                        y: sanitizeValue(ligand.end.y),
                        z: sanitizeValue(ligand.end.z)
                    }} />
                    <TextField autoComplete='off' name='esigma' label='e&sigma;' variant='standard' sx={{width: '12%'}}
                        onChange={ handleChangeValue('end') }
                        onFocus={ handleFocus('end') }
                        onBlur={ handleBlur }
                        value={ sanitizeValue(ligand.end.esigma) } />
                    <TextField autoComplete='off' name='epi' label='e&pi;' variant='standard' sx={{width: '12%'}}
                        onChange={ handleChangeValue('end') }
                        onFocus={ handleFocus('end') }
                        onBlur={ handleBlur }
                        value={  sanitizeValue(ligand.end.epi) } />
                </Stack>
            }
        </Stack>
    )
};