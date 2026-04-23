import { SuggestionsClient } from "./suggestions-client";

export const metadata = {
  title: "Top Picks | PassionDen",
  description: "Your highest-compatibility matches",
};

export default function SuggestionsPage() {
  return <SuggestionsClient />;
}
