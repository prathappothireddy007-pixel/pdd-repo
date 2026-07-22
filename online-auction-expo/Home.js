import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function Home({ onEnterApp }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.heroContainer}>
        <View style={styles.iconPlaceholder}>
          <Text style={styles.iconText}>BidSphere</Text>
        </View>
        
        <Text style={styles.heroTitle}>Welcome to BidSphere</Text>
        <Text style={styles.heroSubtitle}>
          The next-generation marketplace for premium digital assets, electronics, and exclusive collectibles. Bid in real-time with zero latency.
        </Text>

        <View style={styles.featureGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>Real-Time Bidding</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🛡️</Text>
            <Text style={styles.featureTitle}>Secure Checkouts</Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>✨</Text>
            <Text style={styles.featureTitle}>Premium Design</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.enterBtn} onPress={onEnterApp}>
          <Text style={styles.enterBtnText}>Enter BidSphere Marketplace →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0813',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroContainer: {
    width: '90%',
    padding: 30,
    backgroundColor: 'rgba(30, 25, 53, 0.5)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  iconPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00f0ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconText: {
    color: '#00f0ff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 15,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#9f9aa9',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 40,
  },
  featureCard: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: 'rgba(30, 25, 53, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  featureTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#f5f4f8',
    textAlign: 'center',
  },
  enterBtn: {
    backgroundColor: '#8a2be2',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
  },
  enterBtnText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});
