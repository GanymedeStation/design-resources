import resourceDataset from "./resources.json";
import type { ResourceDataset } from "./resourceTypes";

export function loadResourceDataset(): ResourceDataset {
  return resourceDataset as ResourceDataset;
}

