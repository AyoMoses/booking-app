export interface Coordinates {
  lat: number;
  lng: number;
}

// extends means this interface relies on the coordinates to extend its own interface
export interface PlaceLocation extends Coordinates {
  address: string;
  staticMapImageUrl: string;
}
