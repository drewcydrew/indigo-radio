import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigator from "./TabNavigator";
import ShowDetailsScreen from "../screens/ShowDetailsScreen";
import FullScheduleScreen from "../screens/FullScheduleScreen";
import { ShowDefinition, RadioProgram } from "../types/types";

export type RootStackParamList = {
  Main: undefined;
  ShowDetails: { show: ShowDefinition };
  FullSchedule: { programs: RadioProgram[] };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="ShowDetails"
          component={ShowDetailsScreen}
          options={{
            headerShown: true,
            headerTitle: "Show Details",
            headerBackTitle: "Back",
            headerTintColor: "#DD8210",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTitleStyle: {
              color: "#FFFBE7",
            },
          }}
        />
        <Stack.Screen
          name="FullSchedule"
          component={FullScheduleScreen}
          options={{
            headerShown: true,
            headerTitle: "Full Schedule",
            headerBackTitle: "Back",
            headerTintColor: "#DD8210",
            headerStyle: {
              backgroundColor: "#008080",
            },
            headerTitleStyle: {
              color: "#FFFBE7",
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
