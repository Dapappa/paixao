import { PreferencesClient } from "./preferences-client";

export const metadata = {
  title: "Match Preferences | PassionDen",
  description: "Customize your match preferences",
};

export default function PreferencesPage() {
  return <PreferencesClient />;
}
