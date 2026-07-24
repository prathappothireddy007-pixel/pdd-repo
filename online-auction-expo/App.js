import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0813" />
      <WebView 
        source={{ uri: 'https://prathappothireddy007-pixel.github.io/pdd-repo/' }} 
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
          const originalFetch = window.fetch;
          window.fetch = function() {
            if (typeof arguments[0] === 'string' && arguments[0].includes('localhost:8000')) {
              // Try to connect to local backend if reachable, otherwise fallback to local IP
              arguments[0] = arguments[0].replace('localhost:8000', '172.23.52.64:8000');
            }
            return originalFetch.apply(this, arguments);
          };
          true;
        `}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0813',
  },
});
