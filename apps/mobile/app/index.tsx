/**
 * Main menu screen for Neo-Tokyo: Rival Academies.
 */

import { CORE_VERSION } from '@neo-tokyo/core';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function MainMenu() {
  const router = useRouter();

  const handleStartGame = () => {
    router.push('/game');
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#1a1a2e', '#0a0a0a']} style={styles.container}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>NEO-TOKYO</Text>
        <Text style={styles.subtitle}>RIVAL ACADEMIES</Text>
      </View>

      <View style={styles.menuContainer}>
        <Pressable
          style={({ pressed }) => [styles.menuButton, pressed && styles.menuButtonPressed]}
          onPress={handleStartGame}
        >
          <Text style={styles.menuButtonText}>START GAME</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.menuButton,
            styles.menuButtonSecondary,
            pressed && styles.menuButtonPressed,
          ]}
          onPress={() => {
            /* TODO: Options screen */
          }}
        >
          <Text style={styles.menuButtonText}>OPTIONS</Text>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>v0.1.0 • Core {CORE_VERSION}</Text>
        <Text style={styles.footerText}>© 2026 Arcade Cabinet</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff4444',
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '300',
    color: '#4488ff',
    letterSpacing: 12,
    marginTop: 8,
  },
  menuContainer: {
    alignItems: 'center',
    gap: 16,
  },
  menuButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    minWidth: 240,
    alignItems: 'center',
  },
  menuButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4488ff',
  },
  menuButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  menuButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignItems: 'center',
  },
  footerText: {
    color: '#666666',
    fontSize: 12,
  },
});
