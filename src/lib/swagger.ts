import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: "src/app/api", // Updated to match your project structure
    definition: {
      openapi: "3.0.0",
      info: {
        title: "Deepfake Detector API",
        version: "1.0.0",
        description:
          "API documentation for the Deepfake Detector authentication system",
      },
      components: {
        securitySchemes: {
          BasicAuth: {
            type: "http",
            scheme: "basic",
          },
        },
      },
      security: [],
    },
  });
  console.log("Generated Swagger Spec:", JSON.stringify(spec, null, 2));
  return spec;
};
