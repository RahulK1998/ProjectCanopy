import React, { useEffect, useRef } from 'react';
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

interface Props {
  routes: Route[];
  selectedRouteId: string | null;
  onSelectRoute: (id: string) => void;
  onClose: () => void;
  destination: string;
}

export default function RouteResultsOverlay({
  routes,
  selectedRouteId,
  onSelectRoute,
  onClose,
  destination,
}: Props) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(280)).current;

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 72,
      friction: 14,
    }).start();
  }, []);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 320,
      duration: 220,
      useNativeDriver: true,
    }).start(onClose);
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 20 },
        { transform: [{ translateY: slideAnim }] },
      ]}
    >
      <View style={styles.handle} />

      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.toLabel}>Routes to</Text>
          <Text style={styles.destination} numberOfLines={1}>
            {destination}
          </Text>
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
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 24,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
    marginRight: 16,
  },
  toLabel: {
    fontSize: 12,
    color: COLORS.subtext,
    marginBottom: 2,
  },
  destination: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  closeBtn: {
    fontSize: 18,
    color: COLORS.subtext,
  },
  cards: {
    paddingHorizontal: 16,
    paddingBottom: 4,
    gap: 12,
  },
});
