import React from 'react';
import { Paper, Stack, Typography, Fab, Menu, MenuItem, Divider, Tooltip } from '@mui/material';
import {Add, Upload, Download} from '@mui/icons-material';
import LigandInput from './LigandInput';
import { useLigandField, useLigandFieldDispatch, Ligand, AddAction, ImportAction, ligandsToCSV, CSVtoLigands} from './LigandFieldContext';

export default function LigandFieldInput(props: { sx?: any }) {
    const ligandField = useLigandField();
    const dispatch = useLigandFieldDispatch();

    const [newLigandAnchorEl, setNewLigandAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleNewLigandClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setNewLigandAnchorEl(Boolean(newLigandAnchorEl) ? null : event.currentTarget);
    };
    const handleNewLigandClose = (values: {failiure?: boolean, esigma?: number, epi?:number}) => {
        return () => {
            setNewLigandAnchorEl(null);
            if (values.failiure) return;
            
            const action: AddAction = {
                type: 'added',
                esigma: values.esigma,
                epi: values.epi,
            }
            dispatch(action);
        };
    };

    const [importLigandFieldAnchorEl, setImportLigandFieldAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleImportLigandFieldClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setImportLigandFieldAnchorEl(Boolean(newLigandAnchorEl) ? null : event.currentTarget);
    };
    const handleImportLigandFieldClose = (values: {failiure?: boolean, ligands?: Array<Ligand>}) => {
        return () => {
            setImportLigandFieldAnchorEl(null);
            if (values.failiure || values.ligands === undefined) return;
            
            const action: ImportAction = {
                type: 'imported',
                ligands: values.ligands
            }
            dispatch(action);
        };
    };

    const sanitizeValue = (value: number) => {
        if (value === Infinity || value === undefined || value === null) return '';
        if (value === -Infinity) return '-';
        return value.toString();
    }

    const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.item(0);
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const ligands = CSVtoLigands(e.target?.result as string);
            if (ligands === 'error') handleImportLigandFieldClose({failiure: true})();
            else handleImportLigandFieldClose({ligands})();
        };
        reader.readAsText(file);
    };

    const handleDownload = (event: React.MouseEvent<HTMLButtonElement>) => {
        const file = new Blob([ligandsToCSV(ligandField.ligands)], { type: 'text/csv' });
        const a = document.createElement('a');
        a.setAttribute('download', 'ligand-field.csv');
        a.setAttribute('href', URL.createObjectURL(file));
        a.click();
    };

    return (
        <Paper sx= { props.sx }>
            <Stack direction='row' justifyContent='flex-end' alignItems='flex-end' useFlexGap p={1} spacing={1}>
                <Typography variant='h3' sx={{marginRight: 'auto'}} >Ligands</Typography>
                <Fab color="primary" size="small" onClick={ handleDownload }>
                    <Tooltip title="Export ligand field" arrow>
                        <Download />
                    </Tooltip>
                </Fab>
                <Fab color="primary" size="small" onClick={handleImportLigandFieldClick}>
                    <Tooltip title="Import ligand field" arrow>
                        <Upload />
                    </Tooltip>
                </Fab>
                <Fab color="primary" size="small" onClick={handleNewLigandClick}>
                    <Tooltip title="New ligand" arrow>
                        <Add />
                    </Tooltip>
                </Fab>
            </Stack>
            <input accept=".csv" style={{ display: 'none' }} id="fileUpload" type="file" onChange={handleUpload} onClick={handleImportLigandFieldClose({failiure: true})} />
            <Menu anchorEl={importLigandFieldAnchorEl} open={Boolean(importLigandFieldAnchorEl)} onClose={handleImportLigandFieldClose({failiure: true})}>
                <label htmlFor="fileUpload">
                    <MenuItem component='span'>Upload file</MenuItem>
                </label>
                <MenuItem onClick={handleImportLigandFieldClose({ligands: []})}>Delete all</MenuItem>
                <Divider />
                <MenuItem onClick={handleImportLigandFieldClose({ligands: [
                    {
                        start: { x: 0, y: 0, z: 1, esigma: 1, epi: 0 },
                        end: { x: 0, y: 0, z: 1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 1, y: 0, z: 0, esigma: 1, epi: 0 },
                        end: { x: 1, y: 0, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 0, y: 1, z: 0, esigma: 1, epi: 0 },
                        end: { x: 0, y: 1, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: -1, y: 0, z: 0, esigma: 1, epi: 0 },
                        end: { x: -1, y: 0, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 0, y: -1, z: 0, esigma: 1, epi: 0 },
                        end: { x: 0, y: -1, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 0, y: 0, z: -1, esigma: 1, epi: 0 },
                        end: { x: 0, y: 0, z: -1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                ]})}>Oh</MenuItem>
                <MenuItem onClick={handleImportLigandFieldClose({ligands: [
                    {
                        start: { x: 1, y: 0, z: 0, esigma: 1, epi: 0 },
                        end: { x: 1, y: 0, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 0, y: 1, z: 0, esigma: 1, epi: 0 },
                        end: { x: 0, y: 1, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: -1, y: 0, z: 0, esigma: 1, epi: 0 },
                        end: { x: -1, y: 0, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 0, y: -1, z: 0, esigma: 1, epi: 0 },
                        end: { x: 0, y: -1, z: 0, esigma: 1, epi: 0 },
                        fixed: true
                    },
                ]})}>D4h</MenuItem>
                <MenuItem onClick={handleImportLigandFieldClose({ligands: [
                    {
                        start: { x: 1, y: 1, z: 1, esigma: 1, epi: 0 },
                        end: { x: 1, y: 1, z: 1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: -1, y: -1, z: 1, esigma: 1, epi: 0 },
                        end: { x: -1, y: -1, z: 1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: 1, y: -1, z: -1, esigma: 1, epi: 0 },
                        end: { x: 1, y: -1, z: -1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                    {
                        start: { x: -1, y: 1, z: -1, esigma: 1, epi: 0 },
                        end: { x: -1, y: 1, z: -1, esigma: 1, epi: 0 },
                        fixed: true
                    },
                ]})}>Td</MenuItem>
            </Menu>
            <Menu anchorEl={newLigandAnchorEl} open={Boolean(newLigandAnchorEl)} onClose={handleNewLigandClose({failiure: true})}>
                <MenuItem onClick={handleNewLigandClose({})}>custom</MenuItem>
                <Divider />
                <MenuItem onClick={handleNewLigandClose({esigma: 1, epi: 0})}>&sigma;-only</MenuItem>
                <MenuItem onClick={handleNewLigandClose({esigma: 1, epi: 1})}>&pi;-donor</MenuItem>
                <MenuItem onClick={handleNewLigandClose({esigma: 1, epi: -1})}>&pi;-acceptor</MenuItem>
            </Menu>
            <Divider orientation='horizontal' />
            {
                ligandField.ligands.map((ligand,i) => (
                    <LigandInput key={i} sx={{width: '100%'}} index={i} />
                ))
            }
        </Paper>
    );
}