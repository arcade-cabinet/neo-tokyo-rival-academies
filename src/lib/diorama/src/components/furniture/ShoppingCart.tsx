/**
 * ShoppingCart - Shopping carts as urban clutter
 *
 * Abandoned shopping carts in various states for post-flood environments.
 */

import {
  type AbstractMesh,
  Color3,
  type Material,
  MeshBuilder,
  PBRMaterial,
  Vector3,
} from '@babylonjs/core';
import { useEffect, useRef } from 'react';
import { useScene } from 'reactylon';
import { createSeededRandom } from '../../world/blocks/Block';

export type ShoppingCartType = 'standard' | 'small' | 'warehouse' | 'airport';
export type ShoppingCartState = 'upright' | 'tipped' | 'stacked' | 'abandoned';

export interface ShoppingCartProps {
  id: string;
  position: Vector3;
  /** Cart type */
  type?: ShoppingCartType;
  /** Cart state */
  state?: ShoppingCartState;
  /** Condition 0-1 */
  condition?: number;
  /** Rotation (radians) */
  rotation?: number;
  /** Seed for procedural variation */
  seed?: number;
}

// Dimensions for different cart types
const CART_DIMENSIONS: Record<
  ShoppingCartType,
  { width: number; height: number; depth: number; wheelSize: number }
> = {
  standard: { width: 0.55, height: 0.95, depth: 0.85, wheelSize: 0.08 },
  small: { width: 0.4, height: 0.75, depth: 0.6, wheelSize: 0.06 },
  warehouse: { width: 0.7, height: 0.5, depth: 1.2, wheelSize: 0.1 },
  airport: { width: 0.6, height: 1.0, depth: 0.7, wheelSize: 0.07 },
};

export function ShoppingCart({
  id,
  position,
  type = 'standard',
  state = 'upright',
  condition = 0.7,
  rotation = 0,
  seed,
}: ShoppingCartProps) {
  const scene = useScene();
  const meshRef = useRef<AbstractMesh[]>([]);

  const posX = position.x;
  const posY = position.y;
  const posZ = position.z;

  useEffect(() => {
    if (!scene) return;

    const meshes: AbstractMesh[] = [];
    const materials: Material[] = [];
    const rng = seed !== undefined ? createSeededRandom(seed) : null;

    const dims = CART_DIMENSIONS[type];
    const { width, height, depth, wheelSize } = dims;

    // Materials
    const wireMat = new PBRMaterial(`cart_wire_${id}`, scene);
    wireMat.albedoColor = new Color3(0.65, 0.67, 0.7).scale(condition);
    wireMat.metallic = 0.9;
    wireMat.roughness = 0.35;
    materials.push(wireMat);

    const frameMat = new PBRMaterial(`cart_frame_${id}`, scene);
    frameMat.albedoColor = new Color3(0.55, 0.57, 0.6).scale(condition);
    frameMat.metallic = 0.85;
    frameMat.roughness = 0.4;
    materials.push(frameMat);

    const plasticMat = new PBRMaterial(`cart_plastic_${id}`, scene);
    if (type === 'airport') {
      plasticMat.albedoColor = new Color3(0.15, 0.15, 0.18).scale(condition);
    } else {
      plasticMat.albedoColor = new Color3(0.7, 0.1, 0.1).scale(condition); // Red handle
    }
    plasticMat.metallic = 0.1;
    plasticMat.roughness = 0.6;
    materials.push(plasticMat);

    const wheelMat = new PBRMaterial(`cart_wheel_${id}`, scene);
    wheelMat.albedoColor = new Color3(0.15, 0.15, 0.15);
    wheelMat.metallic = 0.2;
    wheelMat.roughness = 0.7;
    materials.push(wheelMat);

    // Calculate transform based on state
    let tiltX = 0;
    let tiltZ = 0;
    let baseY = posY;
    let stackOffset = 0;

    if (state === 'tipped') {
      tiltZ = (rng ? (rng.next() > 0.5 ? 1 : -1) : 1) * (Math.PI / 2 - 0.2);
      baseY = posY + width / 2 - 0.1;
    } else if (state === 'abandoned') {
      tiltX = (rng ? rng.next() - 0.5 : 0) * 0.15;
      tiltZ = (rng ? rng.next() - 0.5 : 0) * 0.1;
    } else if (state === 'stacked') {
      stackOffset = rng ? rng.next() * 0.1 : 0.05;
    }

    // Helper to transform positions
    const transformPos = (localX: number, localY: number, localZ: number): Vector3 => {
      // Apply tilt rotations
      let x = localX;
      let y = localY;
      let z = localZ;

      // Tilt around X axis
      const cosX = Math.cos(tiltX);
      const sinX = Math.sin(tiltX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      y = y1;
      z = z1;

      // Tilt around Z axis
      const cosZ = Math.cos(tiltZ);
      const sinZ = Math.sin(tiltZ);
      const x1 = x * cosZ - y * sinZ;
      const y2 = x * sinZ + y * cosZ;
      x = x1;
      y = y2;

      // Apply main rotation
      const cosR = Math.cos(rotation);
      const sinR = Math.sin(rotation);
      const finalX = x * cosR - z * sinR;
      const finalZ = x * sinR + z * cosR;

      return new Vector3(posX + finalX, baseY + y, posZ + finalZ);
    };

    // Build cart based on type
    if (type === 'standard' || type === 'small') {
      const basketHeight = height * 0.45;
      const basketBottom = wheelSize * 2 + 0.05;

      // Basket frame - bottom
      const bottom = MeshBuilder.CreateBox(
        `${id}_bottom`,
        { width: width - 0.04, height: 0.02, depth: depth - 0.1 },
        scene
      );
      bottom.position = transformPos(0, basketBottom, -0.05);
      bottom.rotation.x = tiltX;
      bottom.rotation.z = tiltZ;
      bottom.rotation.y = rotation;
      bottom.material = wireMat;
      meshes.push(bottom);

      // Basket sides (wire mesh represented as thin boxes)
      // Front
      const front = MeshBuilder.CreateBox(
        `${id}_front`,
        { width: width - 0.04, height: basketHeight, depth: 0.02 },
        scene
      );
      front.position = transformPos(0, basketBottom + basketHeight / 2, depth / 2 - 0.1);
      front.rotation.x = tiltX + 0.15; // Slight angle outward
      front.rotation.z = tiltZ;
      front.rotation.y = rotation;
      front.material = wireMat;
      meshes.push(front);

      // Back
      const back = MeshBuilder.CreateBox(
        `${id}_back`,
        { width: width - 0.04, height: basketHeight * 0.7, depth: 0.02 },
        scene
      );
      back.position = transformPos(0, basketBottom + basketHeight * 0.35, -depth / 2);
      back.rotation.x = tiltX;
      back.rotation.z = tiltZ;
      back.rotation.y = rotation;
      back.material = wireMat;
      meshes.push(back);

      // Left and right sides
      for (const side of [-1, 1]) {
        const sidePanel = MeshBuilder.CreateBox(
          `${id}_side_${side}`,
          { width: 0.02, height: basketHeight, depth: depth - 0.1 },
          scene
        );
        sidePanel.position = transformPos(
          side * (width / 2 - 0.03),
          basketBottom + basketHeight / 2,
          -0.05
        );
        sidePanel.rotation.x = tiltX;
        sidePanel.rotation.z = tiltZ;
        sidePanel.rotation.y = rotation;
        sidePanel.material = wireMat;
        meshes.push(sidePanel);
      }

      // Child seat area (folding)
      const childSeat = MeshBuilder.CreateBox(
        `${id}_childSeat`,
        { width: width * 0.6, height: 0.02, depth: depth * 0.3 },
        scene
      );
      childSeat.position = transformPos(0, basketBottom + basketHeight - 0.1, -depth / 2 + 0.15);
      childSeat.rotation.x = tiltX;
      childSeat.rotation.z = tiltZ;
      childSeat.rotation.y = rotation;
      childSeat.material = wireMat;
      meshes.push(childSeat);

      // Handle frame
      const handleHeight = height - basketBottom - basketHeight;
      const handlePush = depth * 0.1;

      for (const side of [-1, 1]) {
        // Vertical handle post
        const handlePost = MeshBuilder.CreateCylinder(
          `${id}_handlePost_${side}`,
          { height: handleHeight, diameter: 0.025 },
          scene
        );
        handlePost.position = transformPos(
          side * (width / 2 - 0.06),
          basketBottom + basketHeight + handleHeight / 2,
          -depth / 2 - handlePush
        );
        handlePost.rotation.x = tiltX - 0.1;
        handlePost.rotation.z = tiltZ;
        handlePost.material = frameMat;
        meshes.push(handlePost);
      }

      // Handle bar
      const handleBar = MeshBuilder.CreateCylinder(
        `${id}_handleBar`,
        { height: width - 0.08, diameter: 0.03 },
        scene
      );
      handleBar.position = transformPos(0, height - 0.05, -depth / 2 - handlePush);
      handleBar.rotation.z = Math.PI / 2 + tiltZ;
      handleBar.rotation.y = rotation;
      handleBar.material = plasticMat;
      meshes.push(handleBar);

      // Wheels
      const wheelPositions = [
        [width / 2 - 0.08, -depth / 2 + 0.1],
        [-width / 2 + 0.08, -depth / 2 + 0.1],
        [width / 2 - 0.08, depth / 2 - 0.15],
        [-width / 2 + 0.08, depth / 2 - 0.15],
      ];

      for (let i = 0; i < wheelPositions.length; i++) {
        const [wx, wz] = wheelPositions[i];

        // Wheel housing
        const housing = MeshBuilder.CreateCylinder(
          `${id}_wheelHousing_${i}`,
          { height: 0.04, diameter: wheelSize + 0.02 },
          scene
        );
        housing.position = transformPos(wx, wheelSize + 0.02, wz);
        housing.material = frameMat;
        meshes.push(housing);

        // Wheel
        const wheel = MeshBuilder.CreateTorus(
          `${id}_wheel_${i}`,
          { diameter: wheelSize, thickness: 0.015, tessellation: 16 },
          scene
        );
        wheel.position = transformPos(wx, wheelSize, wz);
        wheel.rotation.x = Math.PI / 2 + tiltX;
        wheel.rotation.z = tiltZ;
        wheel.material = wheelMat;
        meshes.push(wheel);
      }
    } else if (type === 'warehouse') {
      // Flatbed warehouse cart
      const platformHeight = wheelSize * 2;

      // Main platform
      const platform = MeshBuilder.CreateBox(
        `${id}_platform`,
        { width, height: 0.05, depth },
        scene
      );
      platform.position = transformPos(0, platformHeight, 0);
      platform.rotation.x = tiltX;
      platform.rotation.z = tiltZ;
      platform.rotation.y = rotation;
      platform.material = frameMat;
      meshes.push(platform);

      // Low side rails
      for (const side of [-1, 1]) {
        const rail = MeshBuilder.CreateBox(
          `${id}_rail_${side}`,
          { width: 0.03, height: 0.15, depth: depth - 0.1 },
          scene
        );
        rail.position = transformPos(side * (width / 2 - 0.02), platformHeight + 0.1, 0);
        rail.rotation.x = tiltX;
        rail.rotation.z = tiltZ;
        rail.rotation.y = rotation;
        rail.material = frameMat;
        meshes.push(rail);
      }

      // Push handle
      const handle = MeshBuilder.CreateBox(
        `${id}_handle`,
        { width, height: 0.03, depth: 0.03 },
        scene
      );
      handle.position = transformPos(0, platformHeight + height, -depth / 2 - 0.1);
      handle.rotation.x = tiltX;
      handle.rotation.z = tiltZ;
      handle.rotation.y = rotation;
      handle.material = plasticMat;
      meshes.push(handle);

      // Handle supports
      for (const side of [-1, 1]) {
        const support = MeshBuilder.CreateCylinder(
          `${id}_handleSupport_${side}`,
          { height: height, diameter: 0.025 },
          scene
        );
        support.position = transformPos(
          side * (width / 2 - 0.1),
          platformHeight + height / 2,
          -depth / 2 - 0.05
        );
        support.rotation.x = tiltX - 0.15;
        support.rotation.z = tiltZ;
        support.material = frameMat;
        meshes.push(support);
      }

      // Large caster wheels
      const wheelPositions = [
        [width / 2 - 0.1, -depth / 2 + 0.15],
        [-width / 2 + 0.1, -depth / 2 + 0.15],
        [width / 2 - 0.1, depth / 2 - 0.15],
        [-width / 2 + 0.1, depth / 2 - 0.15],
      ];

      for (let i = 0; i < wheelPositions.length; i++) {
        const [wx, wz] = wheelPositions[i];
        const wheel = MeshBuilder.CreateCylinder(
          `${id}_wheel_${i}`,
          { height: 0.04, diameter: wheelSize },
          scene
        );
        wheel.position = transformPos(wx, wheelSize / 2, wz);
        wheel.rotation.z = Math.PI / 2;
        wheel.material = wheelMat;
        meshes.push(wheel);
      }
    } else if (type === 'airport') {
      // Airport luggage cart
      const platformHeight = wheelSize * 2;

      // Main platform with ridges
      const platform = MeshBuilder.CreateBox(
        `${id}_platform`,
        { width, height: 0.04, depth },
        scene
      );
      platform.position = transformPos(0, platformHeight, 0);
      platform.rotation.x = tiltX;
      platform.rotation.z = tiltZ;
      platform.rotation.y = rotation;
      platform.material = plasticMat;
      meshes.push(platform);

      // Front bumper
      const bumper = MeshBuilder.CreateBox(
        `${id}_bumper`,
        { width: width + 0.1, height: 0.1, depth: 0.05 },
        scene
      );
      bumper.position = transformPos(0, platformHeight + 0.05, depth / 2 + 0.02);
      bumper.rotation.x = tiltX;
      bumper.rotation.z = tiltZ;
      bumper.rotation.y = rotation;
      const bumperMat = new PBRMaterial(`cart_bumper_${id}`, scene);
      bumperMat.albedoColor = new Color3(0.7, 0.5, 0.1).scale(condition);
      bumperMat.metallic = 0.1;
      bumperMat.roughness = 0.7;
      materials.push(bumperMat);
      bumper.material = bumperMat;
      meshes.push(bumper);

      // Tall handle frame
      const handleFrameHeight = height - platformHeight;

      // Vertical posts
      for (const side of [-1, 1]) {
        const post = MeshBuilder.CreateCylinder(
          `${id}_handlePost_${side}`,
          { height: handleFrameHeight, diameter: 0.03 },
          scene
        );
        post.position = transformPos(
          side * (width / 2 - 0.08),
          platformHeight + handleFrameHeight / 2,
          -depth / 2
        );
        post.rotation.x = tiltX;
        post.rotation.z = tiltZ;
        post.material = frameMat;
        meshes.push(post);
      }

      // Top handle bar
      const handleBar = MeshBuilder.CreateCylinder(
        `${id}_handleBar`,
        { height: width - 0.1, diameter: 0.035 },
        scene
      );
      handleBar.position = transformPos(0, height, -depth / 2);
      handleBar.rotation.z = Math.PI / 2 + tiltZ;
      handleBar.rotation.y = rotation;
      handleBar.material = frameMat;
      meshes.push(handleBar);

      // Handle grip
      const handleGrip = MeshBuilder.CreateCylinder(
        `${id}_handleGrip`,
        { height: width * 0.4, diameter: 0.04 },
        scene
      );
      handleGrip.position = transformPos(0, height, -depth / 2 - 0.05);
      handleGrip.rotation.z = Math.PI / 2 + tiltZ;
      handleGrip.rotation.y = rotation;
      const gripMat = new PBRMaterial(`cart_grip_${id}`, scene);
      gripMat.albedoColor = new Color3(0.2, 0.2, 0.22);
      gripMat.metallic = 0;
      gripMat.roughness = 0.8;
      materials.push(gripMat);
      handleGrip.material = gripMat;
      meshes.push(handleGrip);

      // Wheels
      const wheelPositions = [
        [width / 2 - 0.1, -depth / 2 + 0.1],
        [-width / 2 + 0.1, -depth / 2 + 0.1],
        [width / 2 - 0.1, depth / 2 - 0.1],
        [-width / 2 + 0.1, depth / 2 - 0.1],
      ];

      for (let i = 0; i < wheelPositions.length; i++) {
        const [wx, wz] = wheelPositions[i];
        const wheel = MeshBuilder.CreateCylinder(
          `${id}_wheel_${i}`,
          { height: 0.03, diameter: wheelSize },
          scene
        );
        wheel.position = transformPos(wx, wheelSize / 2, wz);
        wheel.rotation.z = Math.PI / 2;
        wheel.material = wheelMat;
        meshes.push(wheel);
      }
    }

    // Add rust/damage for poor condition or abandoned state
    if ((condition < 0.5 || state === 'abandoned') && rng) {
      const rustMat = new PBRMaterial(`cart_rust_${id}`, scene);
      rustMat.albedoColor = new Color3(0.5, 0.3, 0.15);
      rustMat.metallic = 0.3;
      rustMat.roughness = 0.9;
      materials.push(rustMat);

      const rustCount = 3 + Math.floor(rng.next() * 5);
      for (let i = 0; i < rustCount; i++) {
        const rustX = (rng.next() - 0.5) * width * 0.8;
        const rustY = rng.next() * height * 0.6 + 0.1;
        const rustZ = (rng.next() - 0.5) * depth * 0.8;
        const rustSize = 0.02 + rng.next() * 0.04;

        const rust = MeshBuilder.CreateSphere(
          `${id}_rust_${i}`,
          { diameter: rustSize, segments: 6 },
          scene
        );
        rust.position = transformPos(rustX, rustY, rustZ);
        rust.material = rustMat;
        meshes.push(rust);
      }
    }

    // Add debris inside for abandoned state
    if (state === 'abandoned' && rng) {
      const debrisMat = new PBRMaterial(`cart_debris_${id}`, scene);
      debrisMat.albedoColor = new Color3(0.3, 0.28, 0.25);
      debrisMat.metallic = 0;
      debrisMat.roughness = 0.9;
      materials.push(debrisMat);

      const debrisCount = 2 + Math.floor(rng.next() * 4);
      const basketBottom =
        type === 'warehouse' || type === 'airport'
          ? CART_DIMENSIONS[type].wheelSize * 2 + 0.05
          : CART_DIMENSIONS[type].wheelSize * 2 + 0.1;

      for (let i = 0; i < debrisCount; i++) {
        const debrisX = (rng.next() - 0.5) * width * 0.6;
        const debrisZ = (rng.next() - 0.5) * depth * 0.5;
        const debrisSize = 0.05 + rng.next() * 0.1;

        const debris = MeshBuilder.CreateBox(
          `${id}_debris_${i}`,
          {
            width: debrisSize,
            height: debrisSize * 0.5,
            depth: debrisSize * 1.2,
          },
          scene
        );
        debris.position = transformPos(debrisX, basketBottom + debrisSize / 2, debrisZ);
        debris.rotation.y = rng.next() * Math.PI * 2;
        debris.material = debrisMat;
        meshes.push(debris);
      }
    }

    // Stacked cart (add another cart on top)
    if (state === 'stacked') {
      // Create a simplified nested cart representation
      const nestedMat = new PBRMaterial(`cart_nested_${id}`, scene);
      nestedMat.albedoColor = new Color3(0.6, 0.62, 0.65).scale(condition * 0.9);
      nestedMat.metallic = 0.85;
      nestedMat.roughness = 0.4;
      materials.push(nestedMat);

      const nestedOffset = type === 'standard' ? 0.25 : type === 'small' ? 0.2 : 0.15;
      const basketBottom = CART_DIMENSIONS[type].wheelSize * 2 + 0.1 + nestedOffset;

      const nestedBasket = MeshBuilder.CreateBox(
        `${id}_nestedBasket`,
        { width: width - 0.08, height: height * 0.35, depth: depth - 0.15 },
        scene
      );
      nestedBasket.position = transformPos(stackOffset, basketBottom + height * 0.175, 0);
      nestedBasket.rotation.x = tiltX;
      nestedBasket.rotation.z = tiltZ;
      nestedBasket.rotation.y = rotation;
      nestedBasket.material = nestedMat;
      meshes.push(nestedBasket);
    }

    meshRef.current = meshes;

    return () => {
      for (const mesh of meshes) {
        mesh.dispose();
      }
      for (const mat of materials) {
        mat.dispose();
      }
    };
  }, [scene, id, posX, posY, posZ, type, state, condition, rotation, seed]);

  return null;
}
