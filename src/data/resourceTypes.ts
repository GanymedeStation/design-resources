export interface ResourceItem {
  id: string;
  title: string;
  url: string;
  description?: string;
  searchText: string;
}

export interface ResourceGroup {
  id: string;
  title: string;
  parentTitle?: string;
  items: ResourceItem[];
}

export interface ResourceDataset {
  generatedAt: string;
  sourceRepoUrl: string;
  sourceReadmeUrl: string;
  groups: ResourceGroup[];
}

