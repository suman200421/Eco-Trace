import React, { useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { API_BASE_URL, getSession } from '../../lib/auth';
import { Period, StatsData } from '../../components/stats/types';
import { TabSwitcher } from '../../components/stats/TabSwitcher';
import { FootprintCard } from '../../components/stats/FootprintCard';
import { VehicleBreakdown } from '../../components/stats/VehicleBreakdown';

const EcoTraceStats: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<Period>('Monthly');
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const periods: Period[] = ['Daily', 'Weekly', 'Monthly', 'Yearly'];

  // Fetch stats from API
  const fetchStats = async (period: Period) => {
    try {
      setLoading(true);
      setError(null);
      
      const session = await getSession();
      
      if (!session?.accessToken) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await fetch(
        `${API_BASE_URL}/api/stats?range=${period.toLowerCase()}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Stats API error (${response.status}):`, errorText);
        throw new Error(`Failed to fetch stats: ${response.statusText} (${response.status})`);
      }
      
      const data: StatsData = await response.json();
      setStatsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchStats(selectedPeriod);
  };

  // Fetch stats when period changes
  useEffect(() => {
    fetchStats(selectedPeriod);
  }, [selectedPeriod]);

  const getImpactStatus = (carbon: number | undefined, period: Period) => {
    if (carbon === undefined) return { label: 'Calculating...', color: '#FFB800', message: '...', icon: 'clock' };
    
    let lowThreshold = 0;
    let highThreshold = 0;
    
    switch(period) {
      case 'Daily':
        lowThreshold = 5; highThreshold = 15; break;
      case 'Weekly':
        lowThreshold = 35; highThreshold = 105; break;
      case 'Monthly':
        lowThreshold = 150; highThreshold = 450; break;
      case 'Yearly':
        lowThreshold = 1800; highThreshold = 5400; break;
    }
    
    if (carbon <= lowThreshold) return { label: 'Good', color: '#6BCB77', message: 'Great Job!', icon: 'check-circle' };
    if (carbon <= highThreshold) return { label: 'Moderate', color: '#FFB800', message: 'Be Mindful', icon: 'alert-triangle' };
    return { label: 'High', color: '#FF6B6B', message: 'Action Required', icon: 'alert-circle' };
  };

  const impact = getImpactStatus(statsData?.total.carbon_kg, selectedPeriod);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={impact.color}
            title="Pull to refresh..."
          />
        }
      >
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Eco-Trace Stats</Text>
          <Text style={styles.subtitle}>
            Impact Status: <Text style={[styles.statusYellow, { color: impact.color }]}>{impact.label}</Text>
          </Text>
        </View>

        <TabSwitcher 
          periods={periods} 
          selectedPeriod={selectedPeriod} 
          setSelectedPeriod={setSelectedPeriod} 
          impact={impact} 
        />

        <FootprintCard 
          selectedPeriod={selectedPeriod} 
          statsData={statsData} 
          loading={loading} 
          error={error} 
          impact={impact} 
        />

        <VehicleBreakdown 
          statsData={statsData} 
          loading={loading} 
          error={error} 
          impact={impact} 
        />
        
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  scrollContent: { paddingTop: 22, paddingBottom: 40 },
  header: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1A1A1A' },
  subtitle: { fontSize: 15, color: '#666', marginTop: 4 },
  statusYellow: { color: '#FFB800', fontWeight: 'bold' },
});

export default EcoTraceStats;
