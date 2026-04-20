import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import MapView, { Polyline, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import SearchBar, { SearchBarHandle } from '../src/components/SearchBar';
import RouteResultsOverlay from '../src/components/RouteResultsOverlay';
import ReportModal, { REPORT_MARKER_ICONS } from '../src/components/ReportModal';
import { fetchRoutes } from '../src/services/routing';
import { Route, Report, SearchResult } from '../src/constants/types';
import { COLORS, ROUTE_COLORS } from '../src/constants/colors';
import useLocation from '../src/hooks/useLocation';

const DEFAULT_REGION = {
  latitude: 39.9526,
  longitude: -75.1652,
  latitudeDelta: 0.025,
  longitudeDelta: 0.025,
};

export default function MapScreen() {
  const { location } = useLocation();
  const mapRef = useRef<MapView>(null);
  const searchBarRef = useRef<SearchBarHandle>(null);
  const insets = useSafeAreaInsets();

  const [routes, setRoutes] = useState<Route[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [showRoutes, setShowRoutes] = useState(false);
  const [overlayCollapsed, setOverlayCollapsed] = useState(false);
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
    setOverlayCollapsed(false);
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
        onPress={() => {
          searchBarRef.current?.dismiss();
          if (showRoutes) setOverlayCollapsed(true);
        }}
      >
        {routes.map((route) => (
          <Polyline
            key={route.id}
            coordinates={route.polyline}
            strokeColor={ROUTE_COLORS[route.type]}
            strokeWidth={selectedRouteId === route.id ? 6 : 3}
            lineDashPattern={selectedRouteId === route.id ? undefined : [8, 5]}
            tappable
            onPress={() => {
              setSelectedRouteId(route.id);
              setOverlayCollapsed(false);
            }}
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

      {/* Search bar — hidden once routes are shown */}
      {!showRoutes && !routesLoading && (
        <View style={[styles.searchWrapper, { top: insets.top + 12 }]}>
          <SearchBar
            ref={searchBarRef}
            userLocation={userLocation}
            onSelectResult={handleSelectResult}
            onClear={handleClear}
          />
        </View>
      )}

      {/* Compact destination bar shown while routes are active */}
      {(showRoutes || routesLoading) && (
        <View style={[styles.searchWrapper, { top: insets.top + 12 }]}>
          <View style={styles.destinationBar}>
            <Text style={styles.destinationBarIcon}>📍</Text>
            <Text style={styles.destinationBarText} numberOfLines={1}>{destination}</Text>
            <TouchableOpacity onPress={handleClear} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.destinationBarClear}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Route loading spinner */}
      {routesLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Finding routes…</Text>
        </View>
      )}

      {/* Locate me + Report FABs */}
      {!showRoutes && !routesLoading && (
        <View style={[styles.fabStack, { bottom: insets.bottom + 32 }]}>
          <TouchableOpacity
            style={styles.locateFab}
            onPress={() => {
              if (userLocation) {
                mapRef.current?.animateToRegion({
                  ...userLocation,
                  latitudeDelta: 0.015,
                  longitudeDelta: 0.015,
                }, 400);
              }
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.locateFabIcon}>◎</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.reportFab}
            onPress={() => setShowReport(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.reportFabText}>⚑  Report</Text>
          </TouchableOpacity>
        </View>
      )}

      {showRoutes && (
        <RouteResultsOverlay
          routes={routes}
          selectedRouteId={selectedRouteId}
          onSelectRoute={setSelectedRouteId}
          onClose={handleClear}
          onExpand={() => setOverlayCollapsed(false)}
          destination={destination}
          collapsed={overlayCollapsed}
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
  fabStack: {
    position: 'absolute',
    right: 20,
    alignItems: 'center',
    gap: 10,
  },
  locateFab: {
    backgroundColor: COLORS.white,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
  },
  locateFabIcon: { fontSize: 22, color: COLORS.primary },
  destinationBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 6,
    gap: 10,
  },
  destinationBarIcon: { fontSize: 16 },
  destinationBarText: { flex: 1, fontSize: 16, fontWeight: '600', color: COLORS.text },
  destinationBarClear: { fontSize: 14, color: COLORS.subtext },
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
