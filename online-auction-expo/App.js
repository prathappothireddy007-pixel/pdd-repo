import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0813" />
      <WebView 
        source={{ uri: 'http://10.134.102.79:3000/' }} 
        style={{ flex: 1 }}
        originWhitelist={['*']}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        injectedJavaScript={`
          const originalFetch = window.fetch;
          window.fetch = function() {
            if (typeof arguments[0] === 'string' && arguments[0].includes('localhost:8000')) {
              arguments[0] = arguments[0].replace('localhost:8000', '10.134.102.79:8000');
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
