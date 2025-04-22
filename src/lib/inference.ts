/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as ort from "onnxruntime-node";
import * as path from "path";
import sharp from "sharp";

export async function runInference(
  imagePath: string
): Promise<{ result: string; probability: number }> {
  try {
    // const modelPath = path
    //   .join(process.cwd(), "models", "xception.onnx")
    //   .replace(/\\/g, "/");
    const modelPath = "D:/College_Minor_Project/models/xception.onnx";

    const session = await ort.InferenceSession.create(modelPath);

    const imageBuffer = await sharp(imagePath)
      .resize(299, 299)
      .removeAlpha() // ⬅ removes the alpha channel if present
      .toFormat("png")
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { data, info } = imageBuffer;

    if (info.channels !== 3) {
      throw new Error(`Expected 3 channels, got ${info.channels}`);
    }

    const floatData = new Float32Array(data.length);
    for (let i = 0; i < data.length; i++) {
      floatData[i] = data[i] / 255.0;
    }

    const inputTensor = new ort.Tensor("float32", floatData, [1, 299, 299, 3]);

    const feeds: Record<string, ort.Tensor> = {
      [session.inputNames[0]]: inputTensor,
    };

    const results = await session.run(feeds);
    const output = results[session.outputNames[0]].data as Float32Array;

    const probability = output[1] / (output[0] + output[1]);
    const result = probability > 0.5 ? "Deepfake" : "Real";

    return { result, probability };
  } catch (error) {
    console.error("Inference error:", error);
    throw new Error("Failed to run inference");
  }
}
