import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { COLORS } from '../constants/colors';
import { Coordinate, SearchResult } from '../constants/types';
import { searchPlaces } from '../services/geocoding';

export interface SearchBarHandle {
  dismiss: () => void;
}

interface Props {
  userLocation: Coordinate | null;
  onSelectResult: (result: SearchResult) => void;
  onClear: () => void;
}

const SearchBar = forwardRef<SearchBarHandle, Props>(
  ({ userLocation, onSelectResult, onClear }, ref) => {
    const [value, setValue] = useState('');
    const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef<TextInput>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      dismiss: () => {
        setSuggestions([]);
        Keyboard.dismiss();
      },
    }));

    useEffect(() => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        setLoading(true);
        const results = await searchPlaces(value, userLocation ?? undefined);
        setSuggestions(results);
        setLoading(false);
      }, 400);
      return () => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
      };
    }, [value, userLocation]);

    const handleSelect = (result: SearchResult) => {
      setValue(result.name.split(',')[0].trim());
      setSuggestions([]);
      Keyboard.dismiss();
      onSelectResult(result);
    };

    const handleClear = () => {
      setValue('');
      setSuggestions([]);
      onClear();
      inputRef.current?.focus();
    };

    return (
      <View>
        <View style={styles.container}>
          <Text style={styles.icon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="Where are you walking to?"
            placeholderTextColor={COLORS.placeholder}
            value={value}
            onChangeText={setValue}
            returnKeyType="search"
            autoCorrect={false}
          />
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.subtext} style={styles.indicator} />
          ) : value.length > 0 ? (
            <TouchableOpacity
              onPress={handleClear}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.clear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {suggestions.length > 0 && (
          <View style={styles.dropdown}>
            {suggestions.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.suggestion, index < suggestions.length - 1 && styles.divider]}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <Text style={styles.suggestionIcon}>📍</Text>
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  }
);

export default SearchBar;

const styles = StyleSheet.create({
  container: {
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
  },
  icon: { fontSize: 16, marginRight: 10 },
  input: { flex: 1, fontSize: 16, color: COLORS.text, padding: 0 },
  indicator: { marginLeft: 8 },
  clear: { fontSize: 14, color: COLORS.subtext, marginLeft: 8 },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    marginTop: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    overflow: 'hidden',
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    gap: 10,
  },
  divider: { borderBottomWidth: 1, borderBottomColor: COLORS.border },
  suggestionIcon: { fontSize: 14 },
  suggestionText: { flex: 1, fontSize: 14, color: COLORS.text, lineHeight: 20 },
});
