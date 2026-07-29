import React, { useState } from 'react';
import { SafeAreaView, StatusBar, TextInput, Button, View, Text, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export default function App() {
  const [ipAddress, setIpAddress] = useState('');
  const [connected, setConnected] = useState(false);

  // We inject JavaScript to intercept fetch requests and rewrite 'localhost' to the entered IP address.
  // This allows the web app (which hardcodes localhost:8000) to connect to the laptop's backend
  // without modifying the web app's source code!
  const injectedJavaScript = `
    (function() {
      const originalFetch = window.fetch;
      window.fetch = function() {
        let args = Array.prototype.slice.call(arguments);
        if (typeof args[0] === 'string' && args[0].includes('localhost:8000')) {
          args[0] = args[0].replace('localhost', '${ipAddress}');
        }
        return originalFetch.apply(this, args);
      };
    })();
    true;
  `;

  if (!connected) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
        <View style={styles.form}>
          <Text style={styles.title}>BidSphere Mobile</Text>
          <Text style={styles.subtitle}>Enter your computer's Local IP Address to connect to the Web App (e.g. 192.168.1.5)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 192.168.1.5"
            placeholderTextColor="#888"
            value={ipAddress}
            onChangeText={setIpAddress}
            keyboardType="numeric"
          />
          <Button title="Connect" onPress={() => setConnected(true)} color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0f172a' }}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      <WebView 
        source={{ uri: `http://${ipAddress}:3000` }}
        style={{ flex: 1 }}
        injectedJavaScriptBeforeContentLoaded={injectedJavaScript}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    padding: 20
  },
  form: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 10
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  subtitle: {
    color: '#aaa',
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center'
  },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#334155'
  }
});
