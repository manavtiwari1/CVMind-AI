import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <WebView
      source={{ uri: 'https://cv-mind-ai.vercel.app' }}
      style={{ flex: 1 }}
    />
  );
}
