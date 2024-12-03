import { LigandInput } from "../LigandFieldContext";
/*
Preset list of ligand fields that can be selected via dropdown. values of 'divider' indicate a horizontal line in the list
*/
const presetLigandFields: Array<'divider' | {name: string, ligands: Array<LigandInput>}> = [
    {
        name: 'Oh',
        ligands: [{
            start: { x: '0', y: '0', z: '1', esigma: '1', epi: '0' },
            end: { x: '0', y: '0', z: '1', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '1', y: '0', z: '0', esigma: '1', epi: '0' },
            end: { x: '1', y: '0', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '1', z: '0', esigma: '1', epi: '0' },
            end: { x: '0', y: '1', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '-1', y: '0', z: '0', esigma: '1', epi: '0' },
            end: { x: '-1', y: '0', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '-1', z: '0', esigma: '1', epi: '0' },
            end: { x: '0', y: '-1', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '0', z: '-1', esigma: '1', epi: '0' },
            end: { x: '0', y: '0', z: '-1', esigma: '1', epi: '0' },
            fixed: true
        }]
    },
    {
        name: 'D4h',
        ligands: [{
            start: { x: '1', y: '0', z: '0', esigma: '1', epi: '0' },
            end: { x: '1', y: '0', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '1', z: '0', esigma: '1', epi: '0' },
            end: { x: '0', y: '1', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '-1', y: '0', z: '0', esigma: '1', epi: '0' },
            end: { x: '-1', y: '0', z: '0', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '-1', z: '0', esigma: '1', epi: '0' },
            end: { x: '0', y: '-1', z: '0', esigma: '1', epi: '0' },
            fixed: true
        }]
    },
    {
        name: 'Td (C2 centered)',
        ligands: [{
            start: { x: '1', y: '1', z: '1', esigma: '1', epi: '0' },
            end: { x: '1', y: '1', z: '1', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '-1', y: '-1', z: '1', esigma: '1', epi: '0' },
            end: { x: '-1', y: '-1', z: '1', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '1', y: '-1', z: '-1', esigma: '1', epi: '0' },
            end: { x: '1', y: '-1', z: '-1', esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '-1', y: '1', z: '-1', esigma: '1', epi: '0' },
            end: { x: '-1', y: '1', z: '-1', esigma: '1', epi: '0' },
            fixed: true
        }]
    },
    {
        name: 'Td (C3 centered)',
        ligands: [{
            start: { x: '1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            end: { x: '1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '-1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            end: { x: '-1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: (2/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            end: { x: '0', y: (2/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: true
        },
        {
            start: { x: '0', y: '0', z: (3/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            end: { x: '0', y: '0', z: (3/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: true
        }]
    },
    'divider',
    {
        name: 'D4h \u2192 Td',
        ligands: [
            {
                start: { x: '1', y: '1', z: '0', esigma: '1', epi: '0' },
                end: { x: '1', y: '1', z: '1', esigma: '1', epi: '0' },
                fixed: false
            },
            {
                start: { x: '-1', y: '-1', z: '0', esigma: '1', epi: '0' },
                end: { x: '-1', y: '-1', z: '1', esigma: '1', epi: '0' },
                fixed: false
            },
            {
                start: { x: '1', y: '-1', z: '0', esigma: '1', epi: '0' },
                end: { x: '1', y: '-1', z: '-1', esigma: '1', epi: '0' },
                fixed: false
            },
            {
                start: { x: '-1', y: '1', z: '0', esigma: '1', epi: '0' },
                end: { x: '-1', y: '1', z: '-1', esigma: '1', epi: '0' },
                fixed: false
            }
        ]
    },
    {
        name: 'D3h \u2192 C3v',
        ligands: [{
            start: { x: '1', y: (-1/Math.sqrt(3)).toString(), z: '0', esigma: '1', epi: '0' },
            end: { x: '1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: false
        },
        {
            start: { x: '-1', y: (-1/Math.sqrt(3)).toString(), z: '0', esigma: '1', epi: '0' },
            end: { x: '-1', y: (-1/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: false
        },
        {
            start: { x: '0', y: (2/Math.sqrt(3)).toString(), z: '0', esigma: '1', epi: '0' },
            end: { x: '0', y: (2/Math.sqrt(3)).toString(), z: (-1/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: false
        },
        {
            start: { x: '0', y: '0', z: (3/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            end: { x: '0', y: '0', z: (3/Math.sqrt(6)).toString(), esigma: '1', epi: '0' },
            fixed: false
        }]
    }
]
export default presetLigandFields;