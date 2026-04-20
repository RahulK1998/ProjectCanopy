import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteCard from './RouteCard';
import { Route } from '../constants/types';
import { COLORS } from '../constants/colors';

const ROUTE_ICONS: Record<string, string> = {
  fastest: '⚡',
  shade: '🌳',
  scenic: '🏞',
};

const OFFSCREEN = 320;
const MINI_HEIGHT = 68; // handle strip + compact row

interface Props {
  routes: Route[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onClose: () => void;
  onExpand: () => void;
  destination: string;
  collapsed: boolean;
}

export default function RouteResultsOverlay({
  routes,
  selectedRouteId,
  onSelectRoute,
  onClose,
  onExpand,
  destination,
  collapsed,
}: Props) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(OFFSCREEN)).current;
  const [containerHeight, setContainerHeight] = useState(0);

  // Initial slide-in
  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 72,
      friction: 14,
    }).start();
  }, []);

  // Collapse / expand
  useEffect(() => {
    if (containerHeight === 0) return;
    Animated.spring(translateY, {
      toValue: collapsed ? containerHeight - MINI_HEIGHT : 0,
      useNativeDriver: true,
      tension: 72,
      friction: 14,
    }).start();
  }, [collapsed, containerHeight]);

  const handleClose = () => {
    Animated.timing(translateY, {
      toValue: OFFSCREEN,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  };

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  return (
    <Animated.View
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 20 },
        { transform: [{ translateY }] },
      ]}
    >
      {/* Tappable handle strip — expands when collapsed */}
      <TouchableOpacity
        onPress={collapsed ? onExpand : undefined}
        activeOpacity={collapsed ? 0.7 : 1}
        style={styles.handleStrip}
      >
        <View style={styles.handle} />
      </TouchableOpacity>

      {/* Mini bar — shown when collapsed */}
      {collapsed ? (
        <TouchableOpacity style={styles.miniBar} onPress={onExpand} activeOpacity={0.8}>
          <Text style={styles.miniIcon}>{selectedRoute ? ROUTE_ICONS[selectedRoute.type] : '📍'}</Text>
          <Text style={styles.miniDestination} numberOfLines={1}>{destination}</Text>
          <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.miniClose}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.toLabel}>Routes to</Text>
              <Text style={styles.destination} numberOfLines={1}>{destination}</Text>
            </View>
            <TouchableOpacity
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.closeBtn}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cards}
          >
            {routes.map((route) => (
              <RouteCard
                key={route.id}
                route={route}
                selected={selectedRouteId === route.id}
                onSelect={() => onSelectRoute(route.id)}
              />
            ))}
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.cardBg,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingTop: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  handleStrip: {
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
  },
  // Mini bar (collapsed state)
  miniBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  miniIcon: { fontSize: 20 },
  miniDestination: { flex: 1, fontSize: 16, fontWeight: '700', color: COLORS.text },
  miniClose: { fontSize: 16, color: COLORS.subtext },
  // Expanded state
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLeft: { flex: 1, marginRight: 16 },
  toLabel: { fontSize: 12, color: COLORS.subtext, marginBottom: 2 },
  destination: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  closeBtn: { fontSize: 18, color: COLORS.subtext },
  cards: { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
});
