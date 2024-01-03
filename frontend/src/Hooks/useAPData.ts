import { APDataReference } from "@/Library/APData";

export function useAPData() {
  return APDataReference.current;
}
