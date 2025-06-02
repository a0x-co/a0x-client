interface SplineViewerAttributes {
  url: string;
  loading?: "auto" | "lazy" | "eager";
  style?: React.CSSProperties;
}

declare namespace JSX {
  interface IntrinsicElements {
    "spline-viewer": SplineViewerAttributes;
  }
}
