import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { KeyboardControls } from '@react-three/drei';
import { Physics } from '@react-three/rapier';
import { Joystick } from 'ecctrl/input';
import Playground from './scenes/Playground';
import ControlsHint from './ui/ControlsHint';

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'run', keys: ['ShiftLeft', 'ShiftRight'] },
];

export default function App() {
  return (
    <KeyboardControls map={keyboardMap}>
      <div className="fixed inset-0">
        <Canvas shadows camera={{ position: [0, 4, 8], fov: 55 }}>
          <Suspense fallback={null}>
            <Physics>
              <Playground />
            </Physics>
          </Suspense>
        </Canvas>
        <Joystick />
        <ControlsHint />
      </div>
    </KeyboardControls>
  );
}
