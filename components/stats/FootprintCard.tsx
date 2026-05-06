import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { StatsData, Period, ImpactStatus } from './types';

interface FootprintCardProps {
  selectedPeriod: Period;
  statsData: StatsData | null;
  loading: boolean;
  error: string | null;
  impact: ImpactStatus;
}

export const FootprintCard: React.FC<FootprintCardProps> = ({ selectedPeriod, statsData, loading, error, impact }) => {
  return (
    <View style={styles.cardShadow}>
      <View style={[styles.mainCard, { backgroundColor: impact.color }]}>
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        <View style={{ zIndex: 1 }}>
          <Text style={styles.cardLabel}>Total {selectedPeriod} Footprint</Text>
          {loading ? (
            <Text style={styles.cardValue}>Loading...</Text>
          ) : error ? (
            <Text style={styles.cardValue}>Error</Text>
          ) : (
            <Text style={styles.cardValue}>
              {statsData?.total.carbon_kg.toFixed(2) || '0'} <Text style={styles.unitText}>kg CO₂</Text>
            </Text>
          )}
          {statsData && !loading && !error && (
            <View style={styles.actionBadge}>
              <Feather name={impact.icon as any} size={14} color="#FFF" />
              <Text style={styles.actionText}>{impact.message}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardShadow: {
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  mainCard: { 
    borderRadius: 24, 
    padding: 25, 
    height: 190, 
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative'
  },
  decorCircle1: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.15)',
    top: -40,
    right: -30,
  },
  decorCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.1)',
    bottom: -20,
    right: 60,
  },
  cardLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '500', marginBottom: 2 },
  cardValue: { color: '#FFF', fontSize: 48, fontWeight: '800', marginVertical: 2, letterSpacing: -1 },
  unitText: { fontSize: 20, fontWeight: '600', color: 'rgba(255,255,255,0.8)' },
  actionBadge: { 
    backgroundColor: 'rgba(255, 255, 255, 0.2)', 
    alignSelf: 'flex-start', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 20, 
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  actionText: { fontWeight: '700', fontSize: 13, color: '#FFF', marginLeft: 6 },
});
