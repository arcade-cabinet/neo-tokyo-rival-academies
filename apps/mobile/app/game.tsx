/**
 * Game screen - loads the Babylon.js game via WebView.
 *
 * Architecture Note:
 * This uses a WebView approach for the initial release. This allows us to:
 * 1. Ship quickly with the existing web-based game
 * 2. Maintain a single rendering codebase
 * 3. Preserve the option to migrate to Babylon Native later
 *
 * For production, consider:
 * - Bundling the web build as local assets
 * - Using react-native-webview's file:// protocol
 * - Implementing bridge for game state sync with native
 *
 * @see docs/ARCHITECTURE_PIVOT_NATIVE.md
 */

import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

// In development, load from Vite dev server
// In production, this would be a bundled local file
const GAME_URL = __DEV__
  ? 'http://localhost:5173' // Vite dev server
  : 'file:///android_asset/game/index.html'; // Bundled assets

export default function GameScreen() {
  const router = useRouter();
  const webViewRef = useRef<WebView>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const handleRetry = () => {
    setHasError(false);
    setIsLoading(true);
    webViewRef.current?.reload();
  };

  if (hasError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Connection Error</Text>
        <Text style={styles.errorText}>
          {__DEV__
            ? 'Make sure the Vite dev server is running:\npnpm --filter @neo-tokyo/game dev'
            : 'Failed to load game assets'}
        </Text>
        <View style={styles.errorButtons}>
          <Pressable style={styles.errorButton} onPress={handleRetry}>
            <Text style={styles.errorButtonText}>RETRY</Text>
          </Pressable>
          <Pressable style={[styles.errorButton, styles.errorButtonSecondary]} onPress={handleBack}>
            <Text style={styles.errorButtonText}>BACK TO MENU</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#ff4444" />
          <Text style={styles.loadingText}>Loading Neo-Tokyo...</Text>
        </View>
      )}

      <WebView
        ref={webViewRef}
        source={{ uri: GAME_URL }}
        style={styles.webView}
        onLoadStart={() => setIsLoading(true)}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
        // Performance optimizations
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        // Allow WebGL
        allowsFullscreenVideo
        mixedContentMode="compatibility"
        // Handle gestures
        scrollEnabled={false}
        bounces={false}
        // Inject bridge for game <-> native communication
        injectedJavaScript={`
          window.NeoTokyoBridge = {
            isNative: true,
            platform: '${Platform.OS}',
            postMessage: (type, data) => {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
            }
          };
          true;
        `}
        onMessage={(event) => {
          try {
            const message = JSON.parse(event.nativeEvent.data);
            handleBridgeMessage(message);
          } catch {
            console.warn('Invalid bridge message:', event.nativeEvent.data);
          }
        }}
      />
    </View>
  );
}

// Handle messages from the game WebView
function handleBridgeMessage(message: { type: string; data: unknown }) {
  switch (message.type) {
    case 'game:exit':
      // Handle exit request from game
      break;
    case 'game:save':
      // Handle save request - could sync to native storage
      break;
    default:
      console.log('Bridge message:', message);
  }
}

// Import Platform for bridge injection
import { Platform } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: '#ffffff',
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    color: '#ff4444',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  errorText: {
    color: '#888888',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  errorButton: {
    backgroundColor: '#ff4444',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  errorButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#4488ff',
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
