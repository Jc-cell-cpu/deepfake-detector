// declarations.d.ts
declare module "onnxruntime-web";

// Declare redoc tag so TypeScript doesn't complain
declare global {
  namespace JSX {
    interface IntrinsicElements {
      redoc: React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}
