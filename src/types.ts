export interface Credentials {
  Username: string
  Password: string
}

export interface NugetSource {
  name: string
  url: string
  credentials?: Credentials
}

export interface GetNugetSourceRequest {
  readonly source: NugetSource,
  readonly page: number,
  readonly pageSize: number,
  readonly filter?: string
}

export interface Resource {
  "@id": string;
  "@type": string;
  comment: string;
  clientVersion: string;
}

export interface GetNugetSourceContext {
  "@vocab": string;
  comment: string;
}

export interface GetNugetSourceData {
  version: string;
  resources: Resource[];
  "@context": GetNugetSourceContext;
}

export interface PackageType {
  name: string;
}

export interface Version {
  version: string;
  downloads: number;
  "@id": string;
}

export interface Package {
  id: string;
  version: string;
  description: string;
  summary: string;
  iconUrl: string;
  authors: string | string[];
  versions: Version[];
}

export interface GetNugetPackagesPageContext {
  "@vocab": string;
  "@base": string;
}

export interface GetNugetPackagesPageData {
  "@context": GetNugetPackagesPageContext;
  totalHits: number;
  data: Package[];
}