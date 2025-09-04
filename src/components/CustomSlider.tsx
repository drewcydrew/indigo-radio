import React, { useRef, useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  PanResponder,
  Animated,
  StyleSheet,
} from "react-native";

interface CustomSliderProps {
  value: number;
  maximumValue: number;
  onSlidingComplete: (value: number) => void;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbColor?: string;
  style?: any;
}

export default function CustomSlider({
  value,
  maximumValue,
  onSlidingComplete,
  minimumTrackTintColor = "#007AFF",
  maximumTrackTintColor = "#e0e0e0",
  thumbColor = "#007AFF",
  style,
}: CustomSliderProps) {
  const [containerWidth, setContainerWidth] = useState(300);
  const [isDragging, setIsDragging] = useState(false);
  const [dragValue, setDragValue] = useState(value);
  const [containerX, setContainerX] = useState(0);

  // Update dragValue when value prop changes and we're not dragging
  useEffect(() => {
    if (!isDragging) {
      setDragValue(value);
    }
  }, [value, isDragging]);

  const progressPercentage =
    maximumValue > 0 ? (dragValue / maximumValue) * 100 : 0;

  const calculateValueFromPosition = (positionX: number) => {
    const progressRatio = Math.max(0, Math.min(1, positionX / containerWidth));
    return maximumValue * progressRatio;
  };

  const handleTouch = (event: any) => {
    if (isDragging) return; // Don't handle tap while dragging

    const { locationX } = event.nativeEvent;
    const seekPosition = calculateValueFromPosition(locationX);
    setDragValue(seekPosition); // Update immediately for visual feedback
    onSlidingComplete(seekPosition);
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (event) => {
      setIsDragging(true);
      setDragValue(value);
    },
    onPanResponderMove: (event) => {
      const { pageX } = event.nativeEvent;
      const relativeX = pageX - containerX;
      const newValue = calculateValueFromPosition(relativeX);
      setDragValue(newValue);
    },
    onPanResponderRelease: () => {
      onSlidingComplete(dragValue); // Call this first
      setIsDragging(false); // Then set dragging to false
    },
    onPanResponderTerminate: () => {
      setIsDragging(false);
      setDragValue(value); // Reset on termination
    },
  });

  const handleLayout = (event: any) => {
    const { width, x } = event.nativeEvent.layout;
    setContainerWidth(width);

    // Measure the container's absolute position
    event.target.measure(
      (
        x: number,
        y: number,
        width: number,
        height: number,
        pageX: number,
        pageY: number
      ) => {
        setContainerX(pageX);
      }
    );
  };

  return (
    <View onLayout={handleLayout} style={[styles.container, style]}>
      <TouchableOpacity
        onPress={handleTouch}
        style={styles.touchableArea}
        activeOpacity={1}
      >
        <View
          style={[styles.track, { backgroundColor: maximumTrackTintColor }]}
        >
          <View
            style={[
              styles.progressTrack,
              {
                backgroundColor: minimumTrackTintColor,
                width: `${progressPercentage}%`,
              },
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Draggable Thumb */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.thumb,
          {
            backgroundColor: thumbColor,
            left: `${progressPercentage}%`,
            elevation: isDragging ? 8 : 2,
            shadowOpacity: isDragging ? 0.3 : 0.2,
            shadowRadius: isDragging ? 4 : 2,
            shadowOffset: {
              width: 0,
              height: isDragging ? 4 : 1,
            },
            transform: [{ scale: isDragging ? 1.2 : 1 }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    justifyContent: "center",
  },
  touchableArea: {
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    position: "absolute",
    marginLeft: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    top: 10,
    shadowColor: "#000",
  },
});
