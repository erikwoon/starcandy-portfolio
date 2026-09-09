export type PhotoExif = {
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: string;
  focalLength?: string;
  date?: string;
};

export type Photo = {
  id: string;
  thumb: string;
  full: string;
  width: number;
  height: number;
  exif?: PhotoExif;
};
