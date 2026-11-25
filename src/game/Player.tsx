import { Ecctrl } from 'ecctrl';

const CAPSULE_RADIUS = 0.3;
const CAPSULE_HALF_HEIGHT = 0.35;

export default function Player() {
  return (
    <Ecctrl
      position={[0, 2, 0]}
      capsuleRadius={CAPSULE_RADIUS}
      capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
      jumpVel={0}
    >
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2]} />
        <meshStandardMaterial color="#d9d0b4" roughness={0.9} />
      </mesh>
    </Ecctrl>
  );
}
