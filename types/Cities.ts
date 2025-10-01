export interface Highlight {
  id: string;
  title: string;
  description: string;
  images: [];
  latitude: number;
  longitude: number;
  municipalityId: string;
  createdAt: string;
}

export interface Image {
  id: string;
  url: string;
  municipalityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Attraction {
  id: string;
  name: string;
  description: string;
}

export interface Event {
  id: string;
  title: string;
  date: string; // ISO date string
  description: string;
  image?: string;
}

export interface Guide {
  id: string;
  name: string;
  phone: string;
  email?: string;
  languages?: string[];
}

/**
 * Representa a estrutura completa de um município,
 * incluindo dados básicos e listas de entidades relacionadas.
 */
export interface Municipality {
  id: string;
  name: string;
  description: string;
  coatOfArms: string;
  latitude: number;
  longitude: number;
  about: string;
  slug: string;
  ibgeCode: string;
  createdAt: string;
  updatedAt: string;
  highlights: Highlight[];
  images: Image[];
  attractions?: Attraction[];
  events?: Event[];
  guides?: Guide[];
}

/**
 * Representa a estrutura simplificada de um município,
 * usada em listagens.
 */
export type MunicipalityListItem = Pick<
  Municipality,
  | "id"
  | "name"
  | "slug"
  | "description"
  | "coatOfArms"
  | "latitude"
  | "longitude"
>;

/**
 * Representa a estrutura de um destaque popular,
 * retornada pela API para a tela de exploração.
 */

