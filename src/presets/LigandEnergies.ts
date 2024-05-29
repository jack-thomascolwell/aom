const presetLigandEnergies: Array<'divider' | {name: string, esigma?: string, epi?: string}> = [
    {
        name: '\u03C3-only',
        esigma: '1',
        epi: '0'
    },
    {
        name: '\u03C0-donor',
        esigma: '1',
        epi: '1'
    },
    {
        name: '\u03C0-acceptor',
        esigma: '1',
        epi: '-1'
    },
    'divider',
    {
        name: 'water (placeholder)',
        esigma: '1',
        epi: '0'
    }
]
export default presetLigandEnergies;