import React from "react";
import { View, TouchableOpacity } from "react-native";

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
  const progressPercentage =
    maximumValue > 0 ? (value / maximumValue) * 100 : 0;

  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    const containerWidth = 300; // You could measure this dynamically with onLayout
    const progressRatio = locationX / containerWidth;
    const seekPosition = maximumValue * progressRatio;

    if (seekPosition >= 0 && seekPosition <= maximumValue) {
      onSlidingComplete(seekPosition);
    }
  };

  return (
    <TouchableOpacity
      onPress={handleTouch}
      style={[
        {
          height: 40,
          justifyContent: "center",
        },
        style,
      ]}
    >
      <View
        style={{
          height: 4,
          backgroundColor: maximumTrackTintColor,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            height: 4,
            backgroundColor: minimumTrackTintColor,
            width: `${progressPercentage}%`,
            borderRadius: 2,
          }}
        />
      </View>
      {/* Thumb */}
      <View
        style={{
          position: "absolute",
          left: `${progressPercentage}%`,
          marginLeft: -10,
          width: 20,
          height: 20,
          backgroundColor: thumbColor,
          borderRadius: 10,
          top: 10,
        }}
      />
    </TouchableOpacity>
  );
}
