import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar from '../src/components/SearchBar';
import RouteResultsOverlay from '../src/components/RouteResultsOverlay';
import ReportModal, { REPORT_MARKER_ICONS } from '../src/components/ReportModal';
import { fetchRoutes } from '../src/services/routing';
import { Route, Report, SearchResult } from '../src/constants/types';
import { COLORS, ROUTE_COLORS } from '../src/constants/colors';
import useLocation from '../src/hooks/useLocation';

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function MapScreen() {
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const insets = useSafeAreaInsets();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [destination, setDestination] = useState('');
  const [routesLoading, setRoutesLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const handleSelectResult = useCallback(
    async (result: SearchResult) => {
      const origin = location
        ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
        : { latitude: DEFAULT_REGION.latitude, longitude: DEFAULT_REGION.longitude };

      setDestination(result.name.split(',')[0].trim());
      setRoutesLoading(true);
      setShowRoutes(false);

      try {
        const fetched = await fetchRoutes(origin, result.coordinate);
        setRoutes(fetched);
        setSelectedRouteId('fastest');
        setShowRoutes(true);

        // Fit map to show the full route
        const coords = fetched.flatMap((r) => r.polyline);
        mapRef.current?.fitToCoordinates(coords, {
          edgePadding: { top: 120, right: 40, bottom: 320, left: 40 },
          animated: true,
        });
      } catch {
        // Silently fall back — user can try again
      } finally {
        setRoutesLoading(false);
      }
    },
    [location]
  );

  const handleClear = useCallback(() => {
    setShowRoutes(false);
    setRoutes([]);
    setDestination('');
    setSelectedRouteId(null);
  }, []);

  const handleReport = useCallback((report: Report) => {
    setReports((prev) => [...prev, report]);
  }, []);

  const selectedRoute = routes.find((r) => r.id === selectedRouteId);

  const initialRegion = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.025,
        longitudeDelta: 0.025,
      }
    : DEFAULT_REGION;

  const userLocation = location
    ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
    : null;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        provider={PROVIDER_DEFAULT}
        showsUserLocation
        showsMyLocationButton={false}
        initialRegion={initialRegion}
      >
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.polyline}
            strokeColor={ROUTE_COLORS[route.type]}
            strokeWidth={selectedRouteId === route.id ? 6 : 3}
            lineDashPattern={selectedRouteId === route.id ? undefined : [8, 5]}
          />
        ))}

        {selectedRoute && (
          <Marker
            coordinate={selectedRoute.polyline[selectedRoute.polyline.length - 1]}
            title={destination}
            pinColor={ROUTE_COLORS[selectedRoute.type]}
          />
        )}

        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={report.location}
            title={report.type.replace('_', ' ')}
          >
            <View style={styles.reportPin}>
              <Text style={styles.reportPinIcon}>{REPORT_MARKER_ICONS[report.type]}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating search bar */}
      <View style={[styles.searchWrapper, { top: insets.top + 12 }]}>
        <SearchBar onSelectResult={handleSelectResult} onClear={handleClear} />
      </View>

      {/* Route loading spinner */}
      {routesLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding routes…</Text>
        </View>
      )}

      {/* Report FAB — hidden when route overlay is open */}
      {!showRoutes && !routesLoading && (
        <TouchableOpacity
          style={[styles.reportFab, { bottom: insets.bottom + 32 }]}
          onPress={() => setShowReport(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.reportFabText}>⚑  Report</Text>
        </TouchableOpacity>
      )}

      {showRoutes && (
        <RouteResultsOverlay
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          onClose={handleClear}
          destination={destination}
        />
      )}

      <ReportModal
        visible={showReport}
        location={userLocation}
        onClose={() => setShowReport(false)}
        onReport={handleReport}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  searchWrapper: { position: 'absolute', left: 16, right: 16 },
  loadingOverlay: {
    position: 'absolute',
    alignSelf: 'center',
    top: '45%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    paddingHorizontal: 28,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  loadingText: { fontSize: 15, color: COLORS.subtext, fontWeight: '500' },
  reportFab: {
    position: 'absolute',
    right: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  reportFabText: { color: COLORS.text, fontSize: 14, fontWeight: '600' },
  reportPin: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  reportPinIcon: { fontSize: 20 },
});
