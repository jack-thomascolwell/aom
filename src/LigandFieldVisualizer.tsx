import { Canvas, useLoader, useThree, useFrame } from '@react-three/fiber';
import React from 'react';
import { Paper, Button, Box, Menu, Divider, Fab, MenuItem, Stack, ListItemIcon, ListItemText, Typography, ToggleButton, Tooltip} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import * as Three from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader";
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { CheckBox, CheckBoxOutlineBlank, Download, ArrowDropDown, Square } from '@mui/icons-material';
import { Ligand, LigandState, interpolate, useLigandField, validateLigandInput } from './LigandFieldContext';
import orbitals from './orbitals/Orbitals';

export default function LigandVisualizerComponent(props: { sx?: any}) {
    const theme = useTheme();
    const ligandField = useLigandField();

    const canvas = React.useRef<HTMLCanvasElement>(null);
    const handleScreenshotClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (!canvas || !canvas.current) return;
        const image = canvas.current.toDataURL('image/png');
        const a = document.createElement('a');
        a.setAttribute('download', 'ligand-field.png');
        a.setAttribute('href', image);
        a.click();
    };

    const zAxisFix = new Three.Quaternion();
    zAxisFix.setFromUnitVectors(new Three.Vector3(0,0,1), new Three.Vector3(0,1,0));

    const [rotate, setRotate] = React.useState<boolean>(true);
    const handleRotateClick = () => {
        setRotate(!rotate);
    }

    const [bonds, setBonds] = React.useState<boolean>(true);
    const handleBondsClick = () => {
        setBonds(!bonds);
    }

    const [axes, setAxes] = React.useState<boolean>(true);
    const handleAxesClick = () => {
        setAxes(!axes);
    }

    const [visibleOrbitals, setVisibleOrbitals] = React.useState<Array<string>>([]);
    const [orbitalsAnchorEl, setOrbitalsAnchorEl] = React.useState<null | HTMLElement>(null);
    const handleOrbitalsClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setOrbitalsAnchorEl(Boolean(orbitalsAnchorEl) ? null : event.currentTarget);
    };
    const handleOrbitalsClose = (values: string) => {
        return (() => {
            switch (values) {
                case 'close':
                    setOrbitalsAnchorEl(null);
                    break;
                case 'none':
                    setOrbitalsAnchorEl(null);
                    setVisibleOrbitals([]);
                    break;
                case 'all':
                    setOrbitalsAnchorEl(null);
                    setVisibleOrbitals(['z2','x2-y2','xz','yz','xy']);
                    break;
                default:
                    if (visibleOrbitals.includes(values)) setVisibleOrbitals(visibleOrbitals.filter(v => v!==values));
                    else setVisibleOrbitals([...visibleOrbitals, values]);
            }
        });
    }

    const Orbital = (props: { name: string}) => {
        if (!(props.name === 'z2' || props.name === 'x2-y2' || props.name === 'xz' || props.name === 'yz' || props.name === 'xy')) return;
        const materials = [useLoader(MTLLoader, orbitals[`d${props.name}+.mtl`]), useLoader(MTLLoader, orbitals[`d${props.name}-.mtl`])];
        const objects = [useLoader(OBJLoader, orbitals[`d${props.name}+.obj`], (loader) => {
            materials[0].preload();
            loader.setMaterials(materials[0]);
        }), useLoader(OBJLoader, orbitals[`d${props.name}-.obj`], (loader) => {
            materials[1].preload();
            loader.setMaterials(materials[1]);
        })]
        const materialp = new Three.MeshLambertMaterial({color: new Three.Color(theme.palette.primary.dark), transparent: true, opacity: 0.75})
        const materialm = new Three.MeshLambertMaterial({color: new Three.Color(theme.palette.primary.light), transparent: true, opacity: 0.75});
        return (
            <group>
                <primitive object={objects[0]} scale={0.875} children-0-material={ materialp }/>
                <primitive object={objects[1]} scale={0.875} children-0-material={ materialm }/>
            </group>
        );
    };

    // Color ligands based on esigma value
    const sigmaColor = theme.palette.grey[500];
    const piDonorColor = theme.palette.primary.main;
    const piAcceptorColor = theme.palette.secondary.main;
    const isEmpty = (ligandState: LigandState) => (
        ligandState.x === Infinity &&
        ligandState.y === Infinity &&
        ligandState.z === Infinity &&
        ligandState.esigma === Infinity
        && ligandState.epi === Infinity);
    const checkInfinity = (v: number) => isFinite(v) ? v : 0;
    const epiScale = (() => {
        let max = 0;
        for (const ligandInput of ligandField.ligands) {
            const ligand = validateLigandInput(ligandInput);
            if (ligand === null) continue;
            const state = interpolate(ligand, ligandField.selectedState);
            if (state === null) continue;
            max = Math.max(max, Math.abs(state.epi));
        }
        return max;
    })();
    
    return (
    <Paper sx={props.sx}>
        <Box sx={{display: 'flex', flexDirection: 'column', flexWrap: 'nowrap', height: "100%", width: "100%"}} component='div' p={1}>
            <Stack direction="row" justifyContent='space-evenly' alignItems='stretch' flexWrap='wrap' spacing={1} useFlexGap>
                <Button variant="outlined" size="small" onClick={handleOrbitalsClick} endIcon={<ArrowDropDown />}>orbitals</Button>
                <ToggleButton color="primary" size="small" value="bonds" selected={ bonds } onChange={ handleBondsClick }>bonds</ToggleButton>
                <ToggleButton color="primary" size="small" value="axes" selected={ axes } onChange={ handleAxesClick }>axes</ToggleButton>
                <ToggleButton color="primary" size="small" value="rotate" selected={ rotate } onChange={ handleRotateClick }>rotate</ToggleButton>
            </Stack>
            <Menu anchorEl={orbitalsAnchorEl} open={Boolean(orbitalsAnchorEl)} onClose={handleOrbitalsClose('close')}>
                <MenuItem onClick={handleOrbitalsClose('all')} >show all</MenuItem>
                <MenuItem onClick={handleOrbitalsClose('none')} >hide all</MenuItem>
                <Divider />
                {(['z2','x2-y2','xz','yz','xy'].map(s => (
                    <MenuItem key={`orbitalSelection d${s}`} onClick={handleOrbitalsClose(s as '')}>
                        <ListItemIcon>
                            {visibleOrbitals.includes(s) ? <CheckBox fontSize="small" /> : <CheckBoxOutlineBlank fontSize="small" />}
                        </ListItemIcon>
                        <ListItemText>d{s}</ListItemText>
                    </MenuItem>
                )))}
            </Menu>
            <div css={{flexGrow: 1, width: "100%"}}>
                <Canvas ref={canvas} gl={{ preserveDrawingBuffer: true }}>
                    <PerspectiveCamera makeDefault position={[2,2,-2]} fov={60} zoom={0.9}/>
                    <OrbitControls makeDefault autoRotate={rotate} enablePan={false} autoRotateSpeed={0.5}/>
                    <ambientLight args={[new Three.Color(1,1,1), 1]} />
                    <scene quaternion={zAxisFix} background={new Three.Color(theme.palette.background.paper)}>
                        { axes ? <axesHelper args={[1.25]} /> : null }
                        {
                            ligandField.ligands.map((ligandInput,i) => {
                                const ligand = validateLigandInput(ligandInput);
                                if (ligand === null) return (<></>);
                                const state = interpolate(ligand, ligandField.selectedState);
                                if (state === null) return (<></>);
                                const { x, y, z, epi } = state;
                                const position = new Three.Vector3(x, y, z);
                                position.normalize();

                                const rotation = new Three.Quaternion();
                                rotation.setFromUnitVectors(new Three.Vector3(0,1,0), position);

                                let color: Three.Color;
                                if (epiScale === 0) color = new Three.Color(sigmaColor);
                                else {
                                    let c2: Three.Color;
                                    if (epi === 0) c2 = new Three.Color(sigmaColor);
                                    else if (epi > 0) c2 = new Three.Color(piDonorColor);
                                    else c2 = new Three.Color(piAcceptorColor);
                                    color = new Three.Color(sigmaColor);
                                    color.lerp(c2, Math.abs(epi) / epiScale);
                                }
                                const bondColor = new Three.Color(theme.palette.grey[300]);
                                const bondRadius = (ligandField.selected === i && bonds) ? 0.03125 : 0.015625;
                                return (
                                    <group key={`ligandVisual ${i}`} quaternion={rotation}>
                                        <mesh position={[0,1,0]}>
                                            <sphereGeometry args={[0.125, 12, 12]}/>
                                            <meshStandardMaterial color={color}/>
                                        </mesh>
                                        { bonds || ligandField.selected === i ? <mesh position={[0,0.5,0]}>
                                            <capsuleGeometry args={[bondRadius, 1, 12, 12]}/>
                                            <meshStandardMaterial color={bondColor}/>
                                        </mesh> : null }
                                    </group>
                                )
                            })
                        }
                        {
                            visibleOrbitals.map((name) => (<Orbital key={`orbitalVisual ${name}`} name={name}/>))
                        }
                    </scene>
                </Canvas>
            </div>
            <Stack direction="row" justifyContent="flex-start" alignItems='center'>
                <Stack direction="column" justifyContent='space-evenly' alignItems='flex-start' flexWrap='nowrap' spacing={0.125}>
                    <Typography variant='caption' sx={{color: piDonorColor, }} >&pi;-donor</Typography>
                    <Typography variant='caption' sx={{color: sigmaColor}} >&sigma;-only</Typography>
                    <Typography variant='caption' sx={{color: piAcceptorColor}} >&pi;-acceptor</Typography>
                </Stack>
                <Fab sx={{marginLeft: 'auto'}} color="primary" size="medium" onClick={handleScreenshotClick}>
                    <Tooltip title='Download image' arrow>
                        <Download />
                    </Tooltip>
                </Fab>
            </Stack>
        </Box>
    </Paper>
)};