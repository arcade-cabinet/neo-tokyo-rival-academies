/**
 * Background Panels Component
 *
 * Creates parallax background panels at diorama edges.
 */

import { Color3, MeshBuilder, StandardMaterial, Vector3 } from '@babylonjs/core';
import { useEffect } from 'react';
import { useScene } from 'reactylon';

export interface BackgroundPanelsProps {
  minX: number;
  maxX: number;
  height?: number;
  theme?: 'neon' | 'dark' | 'sunset';
}

export function BackgroundPanels({
  minX,
  maxX,
  height = 30,
  theme = 'neon',
}: BackgroundPanelsProps) {
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;

    // Theme colors
    const themeColors = {
      neon: new Color3(0.1, 0.05, 0.2), // Purple-blue
      dark: new Color3(0.05, 0.05, 0.1), // Very dark blue
      sunset: new Color3(0.3, 0.15, 0.1), // Orange-red
    };

    const color = themeColors[theme];

    // Left panel
    const leftPanel = MeshBuilder.CreatePlane('leftPanel', { width: height, height }, scene);
    leftPanel.position = new Vector3(minX - 1, height / 2, 0);
    leftPanel.rotation.y = Math.PI / 2; // Face right
    leftPanel.rotation.z = -Math.PI / 32; // Slight tilt inward

    const leftMaterial = new StandardMaterial('leftPanelMaterial', scene);
    leftMaterial.diffuseColor = color;
    leftMaterial.specularColor = new Color3(0, 0, 0);
    leftMaterial.emissiveColor = color.scale(0.1); // Slight glow
    leftPanel.material = leftMaterial;

    // Right panel
    const rightPanel = MeshBuilder.CreatePlane('rightPanel', { width: height, height }, scene);
    rightPanel.position = new Vector3(maxX + 1, height / 2, 0);
    rightPanel.rotation.y = -Math.PI / 2; // Face left
    rightPanel.rotation.z = Math.PI / 32; // Slight tilt inward

    const rightMaterial = new StandardMaterial('rightPanelMaterial', scene);
    rightMaterial.diffuseColor = color;
    rightMaterial.specularColor = new Color3(0, 0, 0);
    rightMaterial.emissiveColor = color.scale(0.1); // Slight glow
    rightPanel.material = rightMaterial;

    return () => {
      leftPanel.dispose();
      rightPanel.dispose();
      leftMaterial.dispose();
      rightMaterial.dispose();
    };
  }, [scene, minX, maxX, height, theme]);

  return null;
}
