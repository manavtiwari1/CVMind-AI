import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, SafeAreaView } from 'react-native';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';

// ⚠️ CHANGE THIS TO YOUR ACTUAL DEPLOYED WEBSITE URL
const WEB_URL = "https://cvmind-ai.vercel.app"; 

export default function App() {
  const [loading, setLoading] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#0a0e17" />
      <View style={styles.webViewContainer}>
        <WebView
          source={{ uri: WEB_URL }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          domStorageEnabled={true}
          javaScriptEnabled={true}
          allowsBackForwardNavigationGestures={true}
        />
        {loading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#4f46e5" />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e17', // Match the CV Mind Dark Theme
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
  },
  loaderContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0e17',
  },
});
