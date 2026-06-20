import { StyleSheet, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <iframe
        src="https://cv-mind-ai.vercel.app"
        style={{ width: '100%', height: '100%', border: 'none' }}
        title="CV Mind AI"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
