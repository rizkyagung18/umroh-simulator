import { RigidBody } from '@react-three/rapier';
import Player from '@/game/Player';

const FLOOR_SIZE = 50;

export default function Playground() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[12, 18, 8]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />

      <RigidBody type="fixed" colliders="cuboid" friction={1}>
        <mesh receiveShadow position={[0, -0.05, 0]}>
          <boxGeometry args={[FLOOR_SIZE, 0.1, FLOOR_SIZE]} />
          <meshStandardMaterial color="#2b2b2b" />
        </mesh>
      </RigidBody>

      <ReferenceMarker position={[5, 0.5, 0]} color="#c44" />
      <ReferenceMarker position={[-5, 0.5, 0]} color="#4c4" />
      <ReferenceMarker position={[0, 0.5, 5]} color="#44c" />
      <ReferenceMarker position={[0, 0.5, -5]} color="#cc4" />

      <Player />
    </>
  );
}

function ReferenceMarker({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid" position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}
