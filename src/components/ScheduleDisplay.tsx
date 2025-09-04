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
import { RadioProgram, ShowDefinition } from "../types/types";
import showDefinitions from "../data/showDefinitions.json";

// Cast the imported JSON to the proper type
const SHOW_DEFINITIONS = showDefinitions as ShowDefinition[];

interface ScheduleDisplayProps {
  programs: RadioProgram[];
}

export default function ScheduleDisplay({ programs }: ScheduleDisplayProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedShow, setSelectedShow] = useState<ShowDefinition | null>(null);

  const showSchedule = () => setIsVisible(true);
  const hideSchedule = () => setIsVisible(false);
  const showDetails = (show: ShowDefinition) => setSelectedShow(show);
  const hideDetails = () => setSelectedShow(null);

  // Function to find show definition by program name
  const findShowDefinition = (programName: string): ShowDefinition | null => {
    return (
      SHOW_DEFINITIONS.find(
        (show) =>
          show.name.toLowerCase().includes(programName.toLowerCase()) ||
          programName.toLowerCase().includes(show.name.toLowerCase()) ||
          show.showId
            .toLowerCase()
            .includes(programName.toLowerCase().replace(/\s+/g, "-"))
      ) || null
    );
  };

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

  // Show details modal component
  const ShowDetailsModal = ({ show }: { show: ShowDefinition }) => {
    const hostDisplay = show.hosts ? show.hosts.join(", ") : show.host;

    if (Platform.OS === "web") {
      return (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 2000,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            padding: "20px",
          }}
          onClick={hideDetails}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "24px",
              maxWidth: "600px",
              maxHeight: "80vh",
              width: "100%",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "20px",
              }}
            >
              <h2
                style={{
                  fontSize: "24px",
                  fontWeight: "600",
                  margin: 0,
                  flex: 1,
                }}
              >
                {show.name}
              </h2>
              <button
                onClick={hideDetails}
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

            {hostDisplay && (
              <p
                style={{
                  fontSize: "16px",
                  fontWeight: "500",
                  marginBottom: "8px",
                  color: "#007AFF",
                }}
              >
                Hosted by: {hostDisplay}
              </p>
            )}

            <p
              style={{
                fontSize: "14px",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              {show.description}
            </p>

            {show.tagline && (
              <div
                style={{
                  backgroundColor: "#f0f8ff",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                }}
              >
                <p
                  style={{
                    fontSize: "14px",
                    fontStyle: "italic",
                    margin: 0,
                    color: "#007AFF",
                  }}
                >
                  "{show.tagline}"
                </p>
              </div>
            )}

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
              }}
            >
              <div>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  Frequency
                </h4>
                <p style={{ fontSize: "14px", margin: 0 }}>{show.frequency}</p>
              </div>

              {show.duration && (
                <div>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#666",
                    }}
                  >
                    Duration
                  </h4>
                  <p style={{ fontSize: "14px", margin: 0 }}>{show.duration}</p>
                </div>
              )}

              {show.genres && show.genres.length > 0 && (
                <div>
                  <h4
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      color: "#666",
                    }}
                  >
                    Genres
                  </h4>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}
                  >
                    {show.genres.map((genre, index) => (
                      <span
                        key={index}
                        style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "12px",
                        }}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {show.specialSegments && show.specialSegments.length > 0 && (
              <div style={{ marginTop: "16px" }}>
                <h4
                  style={{
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "8px",
                    color: "#666",
                  }}
                >
                  Special Segments
                </h4>
                {show.specialSegments.map((segment, index) => (
                  <div key={index} style={{ marginBottom: "8px" }}>
                    <p
                      style={{ fontSize: "14px", fontWeight: "500", margin: 0 }}
                    >
                      {segment.name}
                    </p>
                    <p style={{ fontSize: "13px", opacity: 0.7, margin: 0 }}>
                      {segment.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={hideDetails}
      >
        <View style={{ flex: 1, backgroundColor: "white" }}>
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
            <Text style={{ fontSize: 20, fontWeight: "600", flex: 1 }}>
              {show.name}
            </Text>
            <TouchableOpacity onPress={hideDetails}>
              <Text style={{ fontSize: 18, color: "#007AFF" }}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20 }}
          >
            {hostDisplay && (
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  marginBottom: 8,
                  color: "#007AFF",
                }}
              >
                Hosted by: {hostDisplay}
              </Text>
            )}

            <Text style={{ fontSize: 14, marginBottom: 16, lineHeight: 20 }}>
              {show.description}
            </Text>

            {show.tagline && (
              <View
                style={{
                  backgroundColor: "#f0f8ff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontStyle: "italic",
                    color: "#007AFF",
                  }}
                >
                  "{show.tagline}"
                </Text>
              </View>
            )}

            <View style={{ marginBottom: 16 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  marginBottom: 8,
                  color: "#666",
                }}
              >
                Frequency
              </Text>
              <Text style={{ fontSize: 14 }}>{show.frequency}</Text>
            </View>

            {show.duration && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    color: "#666",
                  }}
                >
                  Duration
                </Text>
                <Text style={{ fontSize: 14 }}>{show.duration}</Text>
              </View>
            )}

            {show.genres && show.genres.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    color: "#666",
                  }}
                >
                  Genres
                </Text>
                <View
                  style={{ flexDirection: "row", flexWrap: "wrap", gap: 4 }}
                >
                  {show.genres.map((genre, index) => (
                    <View
                      key={index}
                      style={{
                        backgroundColor: "#e3f2fd",
                        paddingHorizontal: 8,
                        paddingVertical: 2,
                        borderRadius: 12,
                      }}
                    >
                      <Text style={{ color: "#1976d2", fontSize: 12 }}>
                        {genre}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {show.specialSegments && show.specialSegments.length > 0 && (
              <View>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 8,
                    color: "#666",
                  }}
                >
                  Special Segments
                </Text>
                {show.specialSegments.map((segment, index) => (
                  <View key={index} style={{ marginBottom: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: "500" }}>
                      {segment.name}
                    </Text>
                    <Text style={{ fontSize: 13, opacity: 0.7 }}>
                      {segment.description}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    );
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
                        {programsByDay[day].map((program) => {
                          const showDef = findShowDefinition(program.name);
                          return (
                            <div
                              key={program.id}
                              onClick={() => showDef && showDetails(showDef)}
                              style={{
                                padding: "12px",
                                marginBottom: "8px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "8px",
                                borderLeft: "4px solid #007AFF",
                                cursor: showDef ? "pointer" : "default",
                                transition: "all 0.2s ease",
                              }}
                              onMouseEnter={(e) => {
                                if (showDef) {
                                  e.currentTarget.style.backgroundColor =
                                    "#e3f2fd";
                                  e.currentTarget.style.transform =
                                    "translateY(-1px)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#f5f5f5";
                                e.currentTarget.style.transform =
                                  "translateY(0)";
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
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "8px",
                                    }}
                                  >
                                    {program.name}
                                    {showDef && (
                                      <span
                                        style={{
                                          fontSize: "12px",
                                          opacity: 0.6,
                                        }}
                                      >
                                        ℹ️
                                      </span>
                                    )}
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
                          );
                        })}
                      </div>
                    )
                )}
              </div>
            </div>
          </div>
        )}

        {selectedShow && <ShowDetailsModal show={selectedShow} />}
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
                    {programsByDay[day].map((program) => {
                      const showDef = findShowDefinition(program.name);
                      return (
                        <TouchableOpacity
                          key={program.id}
                          onPress={() => showDef && showDetails(showDef)}
                          style={{
                            padding: 12,
                            marginBottom: 8,
                            backgroundColor: "#f5f5f5",
                            borderRadius: 8,
                            borderLeftWidth: 4,
                            borderLeftColor: "#007AFF",
                            opacity: showDef ? 1 : 0.8,
                          }}
                          disabled={!showDef}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <View style={{ flex: 1, marginRight: 12 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <Text
                                  style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    marginBottom: 4,
                                  }}
                                >
                                  {program.name}
                                </Text>
                                {showDef && (
                                  <Text style={{ fontSize: 12, opacity: 0.6 }}>
                                    ℹ️
                                  </Text>
                                )}
                              </View>
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
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )
            )}
          </ScrollView>
        </View>
      </Modal>

      {selectedShow && <ShowDetailsModal show={selectedShow} />}
    </>
  );
}
