import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";

interface UpdateRadioAddressModalProps {
  onClose: () => void;
  onUpdate: (newPort: string) => void;
}

export default function UpdateRadioAddressModal({
  onClose,
  onUpdate,
}: UpdateRadioAddressModalProps) {
  const [port, setPort] = useState("");

  const handleUpdate = () => {
    if (port.trim()) {
      onUpdate(port.trim());
    }
  };

  return (
    <Modal transparent={true} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Update Radio Address</Text>
          <Text style={styles.description}>
            Enter the new port number for the live radio stream:
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Enter port number"
            keyboardType="numeric"
            value={port}
            onChangeText={setPort}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={handleUpdate}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 16,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 4,
    padding: 8,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#ccc",
    borderRadius: 4,
    marginRight: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  updateButton: {
    flex: 1,
    padding: 12,
    backgroundColor: "#D5851F",
    borderRadius: 4,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
