import { useFrame } from '@react-three/fiber';
import type { InputState } from '@/types/game';
import { ECS } from '../state/ecs';
import { musicSynth } from '../utils/audio/MusicSynth';
import { CONFIG } from '../utils/gameConfig';

interface InputSystemProps {
  inputState: InputState;
}

const playersQuery = ECS.world.with('isPlayer', 'velocity', 'characterState', 'position');
let prevJump = false;

export const InputSystem = ({ inputState }: InputSystemProps) => {
  useFrame((_state, delta) => {
    const dt = Math.min(delta, 0.1);

    for (const player of playersQuery) {
      if (player.characterState === 'stun') {
        // Recovery handled in logic system or simple timer
        continue;
      }

      // Ramping difficulty
      const distBonus = Math.min(player.position.x * 0.002, 5);
      const targetSpeed = (inputState.run ? CONFIG.sprintSpeed : CONFIG.baseSpeed) + distBonus;

      // X Acceleration
      player.velocity.x += (targetSpeed - player.velocity.x) * 5 * dt;

      // State Logic (Simplified)
      // Check if grounded (velocity y is 0 is our simple check from PhysicsSystem)
      const isGrounded = Math.abs(player.velocity.y) < 0.01;

      if (isGrounded) {
        if (inputState.jump && !prevJump) {
          player.velocity.y = CONFIG.jumpForce;
          player.characterState = 'jump';
          musicSynth.playJump();
        } else if (inputState.attack) {
          player.characterState = 'attack';
          // Slow down slightly while attacking
          player.velocity.x *= 0.95;
        } else if (inputState.slide) {
          if (player.characterState !== 'slide') musicSynth.playSlide();
          player.characterState = 'slide';
        } else if (inputState.run) {
          player.characterState = 'sprint';
        } else {
          player.characterState = 'run';
        }
      } else {
        player.characterState = 'jump';
      }
    }
    prevJump = inputState.jump;
  });

  return null;
};
