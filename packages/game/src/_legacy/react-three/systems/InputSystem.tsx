import { musicSynth } from "@neo-tokyo/content-gen";
import { useFrame } from "@react-three/fiber";
import type { InputState } from "@/types/game";
import { ECS } from "../state/ecs";
import { CONFIG } from "../utils/gameConfig";

interface InputSystemProps {
	inputState: InputState;
}

const playersQuery = ECS.world.with(
	"isPlayer",
	"velocity",
	"characterState",
	"position",
);
let prevJump = false;

export const InputSystem = ({ inputState }: InputSystemProps) => {
	useFrame((_state, delta) => {
		const dt = Math.min(delta, 0.1);

		for (const player of playersQuery) {
			if (player.characterState === "stun") {
				// Recovery handled in logic system or simple timer
				continue;
			}

			// Directional Input Logic
			let targetVelocityX = 0;

			if (inputState.right) {
				targetVelocityX = inputState.run
					? CONFIG.sprintSpeed
					: CONFIG.baseSpeed;
			} else if (inputState.left) {
				targetVelocityX = -(inputState.run
					? CONFIG.sprintSpeed
					: CONFIG.baseSpeed);
			} else {
				targetVelocityX = 0;
			}

			// X Acceleration
			// Smooth damp
			player.velocity.x += (targetVelocityX - player.velocity.x) * 10 * dt;

			// Face Direction (Rotate mesh if needed, but for now we just move)
			// Ideally we'd rotate the model 180 deg if moving left.
			// We can use ECS rotation or just scale.x = -1 via a component?
			// Let's assume Character component handles visuals based on velocity sign if we want.

			// State Logic (Simplified)
			// Check if grounded (velocity y is 0 is our simple check from PhysicsSystem)
			const isGrounded = Math.abs(player.velocity.y) < 0.01;

			if (isGrounded) {
				if (inputState.jump && !prevJump) {
					player.velocity.y = CONFIG.jumpForce;
					player.characterState = "jump";
					musicSynth.playJump();
				} else if (inputState.attack) {
					player.characterState = "attack";
					// Slow down slightly while attacking
					player.velocity.x *= 0.95;
				} else if (inputState.slide) {
					if (player.characterState !== "slide") musicSynth.playSlide();
					player.characterState = "slide";
				} else if (Math.abs(player.velocity.x) > 1) {
					player.characterState = inputState.run ? "sprint" : "run";
				} else {
					player.characterState = "stand";
				}
			} else {
				player.characterState = "jump";
			}
		}
		prevJump = inputState.jump;
	});

	return null;
};
