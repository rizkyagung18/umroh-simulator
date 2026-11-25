import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useKeyboardControls } from '@react-three/drei';
import { Ecctrl, type EcctrlHandle } from 'ecctrl';
import { useJoystickStore } from 'ecctrl/input';

const CAPSULE_RADIUS = 0.3;
const CAPSULE_HALF_HEIGHT = 0.35;

type KeyState = {
  forward: boolean;
  backward: boolean;
  leftward: boolean;
  rightward: boolean;
  run: boolean;
};

export default function Player() {
  const ref = useRef<EcctrlHandle>(null);
  return (
    <Ecctrl
      ref={ref}
      position={[0, 2, 0]}
      capsuleRadius={CAPSULE_RADIUS}
      capsuleHalfHeight={CAPSULE_HALF_HEIGHT}
      jumpVel={0}
    >
      <InputBridge targetRef={ref} />
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[CAPSULE_RADIUS, CAPSULE_HALF_HEIGHT * 2]} />
        <meshStandardMaterial color="#d9d0b4" roughness={0.9} />
      </mesh>
    </Ecctrl>
  );
}

function InputBridge({ targetRef }: { targetRef: React.RefObject<EcctrlHandle | null> }) {
  const [, getKeys] = useKeyboardControls<keyof KeyState>();

  useFrame(() => {
    const api = targetRef.current;
    if (!api) return;
    const keys = getKeys();
    const js = useJoystickStore.getState().joysticks.default;
    api.setMovement({
      forward: !!keys.forward,
      backward: !!keys.backward,
      leftward: !!keys.leftward,
      rightward: !!keys.rightward,
      run: !!keys.run,
      joystick: js?.active ? { x: js.x, y: js.y } : undefined,
    });
  });

  return null;
}
