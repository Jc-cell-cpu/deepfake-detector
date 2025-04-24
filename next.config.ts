import type { NextConfig } from "next";
import withTM from "next-transpile-modules";

// Transpile the 'yaml' package used internally by Redoc
const withYamlTranspile = withTM(["yaml"]);

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    esmExternals: "loose", // Allows hybrid ESM/CJS packages
  },
};

export default withYamlTranspile(nextConfig);
