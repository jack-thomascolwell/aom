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
        name: 'H2O',
        esigma: '7490',
        epi: '1390'
    },
    {
        name: 'OH-',
        esigma: '7510',
        epi: '1400'
    },
    {
        name: 'NH3',
        esigma: '7010',
        epi: '0'
    },
    {
        name: 'CN-',
        esigma: '8310',
        epi: '-290'
    },
    {
        name: 'CO',
        esigma: '14500',
        epi: '-1750',
    },
    {
        name: 'py',
        esigma: '5800',
        epi: '-580'
    },
    {
        name: 'F-',
        esigma: '7870',
        epi: '1880'
    },
    {
        name: 'Cl-',
        esigma: '5610',
        epi: '910'
    },
    {
        name: 'Br-',
        esigma: '5050',
        epi: '690'
    },
    {
        name: 'I-',
        esigma: '4140',
        epi: '670'
    },
]
export default presetLigandEnergies;