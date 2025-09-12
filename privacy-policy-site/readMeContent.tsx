import { ImageSourcePropType } from "react-native";
import { VideoSource } from "expo-video";

// Export intro content
export const introContent = {
  title: "Collection Paradise",
  paragraphs: [
    {
      content:
        "Collection Paradise is a prototype mobile and web application designed to query a database and return information about a specific collection. It can be accessed via a web browser or downloaded on Android/iOS.\n\n" +
        "Users enter a library and collection code to retrieve a list of books. This list can then be filtered according to one of four cultivation types (Weeding/Find/Transfer).\n\n" +
        "Once a cultivation list has been generated, it can be saved and revisited later. Basic functionality is provided for editing, sharing, and reviewing saved lists.",
    },
  ],
};

// Define paragraph structure with optional subheading
export interface Paragraph {
  subheading?: string;
  content: string;
}

// Define types for section content
export interface Section {
  title: string;
  paragraphs: Paragraph[];
  video?: VideoSource;
  image?: ImageSourcePropType;
  caption?: string;
}

// Export sections data
export const sections: Section[] = [
  {
    title: "Analyze",
    video: require("../../assets/demovideos/CultivateScreenVideo.mp4"),
    paragraphs: [
      {
        content:
          "Use the Analyze screen to examine library collection data and generate insights.\n\n" +
          "Select a library and collection to view statistical analysis and charts showing distribution patterns, usage trends, and collection health metrics.\n\n" +
          "The charts can be customized to show different data views and exported for reporting purposes.\n\n" +
          "[Placeholder content - detailed functionality to be documented]",
      },
    ],
  },
  {
    title: "Cultivate",
    video: require("../../assets/demovideos/CultivateScreenVideo.mp4"),
    caption: "Cultivate Screen",
    paragraphs: [
      {
        content:
          "Use the Cultivate screen to generate new crops.\n\n" +
          "Select the desired Library and Collection from the filters (these are optional and can be left blank).\n\n" +
          "Choose from the available filter types (Weeding / Find / Transfer), then adjust the sliders as needed.\n\n" +
          "The number of results is displayed at the bottom of the screen. Tap it to expand and save the crop.",
      },
    ],
  },
  {
    title: "Harvest",
    video: require("../../assets/demovideos/HarvestScreenVideo.mp4"),
    caption: "Harvest Screen",
    paragraphs: [
      {
        content:
          "Use the Harvest screen to review a crop and create sublists.\n\n" +
          "Use the filter at the top to run a text search or sort results by a specific parameter.\n\n" +
          "Each entry includes a 'status' field which defaults to 'unknown' but can be set to 'Lost' or 'Found'.\n\n" +
          "Tapping an item reveals additional details from Google Books and allows you to edit notes for the item.\n\n" +
          "To generate a sublist, mark the desired items for inclusion and tap 'Generate Sublist'.",
      },
    ],
  },
  {
    title: "Gardens",
    video: require("../../assets/demovideos/GardenScreenVideo.mp4"),
    caption: "Gardens Screen",
    paragraphs: [
      {
        content:
          "Use the Garden screen to load or create gardens. Click 'Change Garden' to select from available gardens.\n\n" +
          "Crops for the selected garden are displayed in a list. Buttons are provided for each item to harvest, cultivate, rename, or delete.\n\n" +
          "The section at the bottom shows the Privacy Policy and links to the web app.",
      },
    ],
  },
];
