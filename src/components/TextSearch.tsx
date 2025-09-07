import React, { useRef, memo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

interface TextSearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  placeholder?: string;
}

const TextSearch = memo(function TextSearch({
  searchQuery,
  onSearchChange,
  onClearSearch,
  placeholder = "Search episodes...",
}: TextSearchProps) {
  const textInputRef = useRef<TextInput>(null);
  const [inputValue, setInputValue] = useState(searchQuery);

  const handleSubmit = () => {
    onSearchChange(inputValue);
  };

  const handleClear = () => {
    setInputValue("");
    onClearSearch();
    textInputRef.current?.focus();
  };

  return (
    <View style={styles.searchContainer}>
      <View style={styles.searchHeader}>
        <Text style={styles.searchLabel}>Search Episodes:</Text>
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>CLEAR</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          ref={textInputRef}
          style={styles.searchInput}
          value={inputValue}
          onChangeText={setInputValue}
          onSubmitEditing={handleSubmit}
          placeholder={placeholder}
          placeholderTextColor="#999"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity onPress={handleSubmit} style={styles.searchButton}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {searchQuery.length > 0 && (
        <Text style={styles.activeSearchText}>
          Searching for: "{searchQuery}"
        </Text>
      )}
    </View>
  );
});

export default TextSearch;

const styles = StyleSheet.create({
  searchContainer: {
    marginBottom: 16,
    paddingHorizontal: Platform.OS === "web" ? 0 : 16,
    width: "100%",
    maxWidth: "100%",
  },
  searchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  searchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    letterSpacing: 0.3,
  },
  clearButton: {
    backgroundColor: "#ff0000",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    width: "100%",
    maxWidth: "100%",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#333",
    minHeight: 50,
    maxWidth: "100%",
  },
  searchButton: {
    backgroundColor: "#000",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    minWidth: Platform.OS === "web" ? 100 : 80,
  },
  searchButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  activeSearchText: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 8,
  },
});
