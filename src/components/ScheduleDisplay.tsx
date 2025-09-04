import React, { useState } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Modal,
  Platform,
  TouchableOpacity,
} from "react-native";
import { RadioProgram } from "../types/types";

interface ScheduleDisplayProps {
  programs: RadioProgram[];
}

export default function ScheduleDisplay({ programs }: ScheduleDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);

  const showSchedule = () => setIsVisible(true);
  const hideSchedule = () => setIsVisible(false);

  // Group programs by day
  const programsByDay = programs.reduce((acc, program) => {
    if (!acc[program.day]) {
      acc[program.day] = [];
    }
    acc[program.day].push(program);
    return acc;
  }, {} as { [key: string]: RadioProgram[] });

  // Sort programs by start time within each day
  Object.keys(programsByDay).forEach((day) => {
    programsByDay[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const dayOrder = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
  ];
  const dayNames = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  // Web implementation
  if (Platform.OS === "web") {
    return (
      <>
        <button
          onClick={showSchedule}
          style={{
            padding: "8px 16px",
            backgroundColor: "#007AFF",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
            marginTop: "16px",
          }}
        >
          Show Schedule
        </button>

        {isVisible && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 1000,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
            }}
            onClick={hideSchedule}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                maxWidth: "800px",
                maxHeight: "80vh",
                width: "100%",
                overflow: "hidden",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>
                  Program Schedule
                </h2>
                <button
                  onClick={hideSchedule}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{ overflow: "auto", maxHeight: "calc(80vh - 100px)" }}
              >
                {dayOrder.map(
                  (day) =>
                    programsByDay[day] && (
                      <div key={day} style={{ marginBottom: "24px" }}>
                        <h3
                          style={{
                            fontSize: "18px",
                            fontWeight: "600",
                            marginBottom: "12px",
                            color: "#007AFF",
                          }}
                        >
                          {dayNames[day as keyof typeof dayNames]}
                        </h3>
                        {programsByDay[day].map((program) => (
                          <div
                            key={program.id}
                            style={{
                              padding: "12px",
                              marginBottom: "8px",
                              backgroundColor: "#f5f5f5",
                              borderRadius: "8px",
                              borderLeft: "4px solid #007AFF",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "flex-start",
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <h4
                                  style={{
                                    fontSize: "16px",
                                    fontWeight: "600",
                                    margin: "0 0 4px 0",
                                  }}
                                >
                                  {program.name}
                                </h4>
                                {program.host && (
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      margin: "0 0 4px 0",
                                      opacity: 0.8,
                                    }}
                                  >
                                    with {program.host}
                                  </p>
                                )}
                                <p
                                  style={{
                                    fontSize: "14px",
                                    margin: "0 0 8px 0",
                                    opacity: 0.6,
                                    fontStyle: "italic",
                                  }}
                                >
                                  {program.description}
                                </p>
                              </div>
                              <div
                                style={{
                                  fontSize: "14px",
                                  fontWeight: "600",
                                  color: "#007AFF",
                                }}
                              >
                                {program.startTime} - {program.endTime}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Mobile implementation
  return (
    <>
      <View style={{ marginTop: 16 }}>
        <Button title="Show Schedule" onPress={showSchedule} />
      </View>

      <Modal
        visible={isVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={hideSchedule}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 20,
              paddingTop: 60,
              borderBottomWidth: 1,
              borderBottomColor: "#e0e0e0",
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "600" }}>
              Program Schedule
            </Text>
            <TouchableOpacity onPress={hideSchedule}>
              <Text style={{ fontSize: 18, color: "#007AFF" }}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Schedule Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {dayOrder.map(
              (day) =>
                programsByDay[day] && (
                  <View key={day} style={{ marginBottom: 24 }}>
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "600",
                        marginBottom: 12,
                        color: "#007AFF",
                      }}
                    >
                      {dayNames[day as keyof typeof dayNames]}
                    </Text>
                    {programsByDay[day].map((program) => (
                      <View
                        key={program.id}
                        style={{
                          padding: 12,
                          marginBottom: 8,
                          backgroundColor: "#f5f5f5",
                          borderRadius: 8,
                          borderLeftWidth: 4,
                          borderLeftColor: "#007AFF",
                        }}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <View style={{ flex: 1, marginRight: 12 }}>
                            <Text
                              style={{
                                fontSize: 16,
                                fontWeight: "600",
                                marginBottom: 4,
                              }}
                            >
                              {program.name}
                            </Text>
                            {program.host && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  marginBottom: 4,
                                  opacity: 0.8,
                                }}
                              >
                                with {program.host}
                              </Text>
                            )}
                            <Text
                              style={{
                                fontSize: 14,
                                marginBottom: 8,
                                opacity: 0.6,
                                fontStyle: "italic",
                              }}
                            >
                              {program.description}
                            </Text>
                          </View>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#007AFF",
                            }}
                          >
                            {program.startTime} - {program.endTime}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )
            )}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}
