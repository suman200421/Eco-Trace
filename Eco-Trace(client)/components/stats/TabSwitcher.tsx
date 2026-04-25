import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Period, ImpactStatus } from './types';

interface TabSwitcherProps {
  periods: Period[];
  selectedPeriod: Period;
  setSelectedPeriod: (p: Period) => void;
  impact: ImpactStatus;
}

export const TabSwitcher: React.FC<TabSwitcherProps> = ({ periods, selectedPeriod, setSelectedPeriod, impact }) => {
  return (
    <View style={styles.tabWrapper}>
      <View style={styles.tabBackground}>
        {periods.map((p) => (
          <TouchableOpacity
            key={p}
            onPress={() => setSelectedPeriod(p)}
            style={[styles.tabItem, selectedPeriod === p && [styles.activeTabItem, { backgroundColor: impact.color }]]}
          >
            <Text style={[styles.tabText, selectedPeriod === p && styles.activeTabText]}>
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  tabWrapper: { paddingHorizontal: 20, marginVertical: 15 },
  tabBackground: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 6 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 12 },
  activeTabItem: { 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: { color: '#888', fontWeight: '600', fontSize: 14 },
  activeTabText: { color: '#FFF', fontWeight: '700' },
});
