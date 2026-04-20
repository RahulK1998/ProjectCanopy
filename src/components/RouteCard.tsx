import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Route } from '../constants/types';
import { COLORS, ROUTE_COLORS } from '../constants/colors';

const ROUTE_ICONS: Record<string, string> = {
  fastest: '⚡',
  shade: '🌳',
  scenic: '🏞',
};

interface ScoreBarProps {
  score: number;
  color: string;
}

function ScoreBar({ score, color }: ScoreBarProps) {
  return (
    <View style={styles.scoreBarTrack}>
      <View
        style={[styles.scoreBarFill, { width: `${score * 10}%` as any, backgroundColor: color }]}
      />
    </View>
  );
}

interface Props {
  route: Route;
  selected: boolean;
  onSelect: () => void;
}

export default function RouteCard({ route, selected, onSelect }: Props) {
  const color = ROUTE_COLORS[route.type];

  return (
    <TouchableOpacity
      style={[styles.card, selected && { borderColor: color, borderWidth: 2 }]}
      onPress={onSelect}
      activeOpacity={0.75}
    >
      <View style={styles.header}>
        <Text style={styles.icon}>{ROUTE_ICONS[route.type]}</Text>
        <Text style={[styles.name, { color }]}>{route.name}</Text>
      </View>

      <View style={styles.timeDist}>
        <Text style={styles.time}>{route.estimatedMinutes} min</Text>
        <Text style={styles.dist}> · {route.distanceKm.toFixed(1)} km</Text>
      </View>

      <View style={styles.scores}>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>☀ Shade</Text>
          <ScoreBar score={route.shadeScore} color={ROUTE_COLORS.shade} />
          <Text style={styles.scoreValue}>{route.shadeScore}</Text>
        </View>
        <View style={styles.scoreRow}>
          <Text style={styles.scoreLabel}>🏞 Scenic</Text>
          <ScoreBar score={route.scenicScore} color={ROUTE_COLORS.scenic} />
          <Text style={styles.scoreValue}>{route.scenicScore}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    width: 185,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 6,
  },
  icon: { fontSize: 18 },
  name: { fontSize: 15, fontWeight: '700' },
  timeDist: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 14,
  },
  time: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  dist: { fontSize: 13, color: COLORS.subtext },
  scores: { gap: 7 },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scoreLabel: { fontSize: 11, color: COLORS.subtext, width: 48 },
  scoreBarTrack: {
    flex: 1,
    height: 5,
    backgroundColor: COLORS.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  scoreValue: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.subtext,
    width: 14,
    textAlign: 'right',
  },
});
