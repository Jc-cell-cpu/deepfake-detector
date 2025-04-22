/* eslint-disable @typescript-eslint/no-explicit-any */
import { runInference } from "./src/lib/inference";
import fetch from "node-fetch";
import { InferenceSession } from "onnxjs";

// Polyfill fetch for Node.js
(global as any).fetch = fetch;

// Configure ONNX.js for Node.js
InferenceSession.prototype.loadModel = async function (modelUrl: string) {
  const fs = await import("fs");
  const path = await import("path");
  const modelPath = path.resolve(modelUrl);
  const modelBuffer = fs.readFileSync(modelPath);
  return this.loadModelFromBuffer(modelBuffer);
};

async function test() {
  try {
    const result = await runInference(
      "D:/College_Minor_Project/archive/Dataset/Validation/Real/real_533.jpg"
    );
    console.log("Result:", result);
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
