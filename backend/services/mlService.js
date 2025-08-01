const { HfInference } = require('@huggingface/inference');
const hf = new HfInference(process.env.HF_API_TOKEN);

const LABELS = [
  "reliable journalism",
  "clickbait",
  "biased reporting",
  "satire",
  "conspiracy theory",
  "misinformation"
];

async function analyzeWithML(text) {
  try {
    // Zero-shot classification
    const classification = await hf.zeroShotClassification({
      model: "facebook/bart-large-mnli",
      inputs: text,
      parameters: { candidate_labels: LABELS }
    });

    // Text generation detection (for AI-generated content)
    const generationDetection = await hf.textClassification({
      model: "roberta-base-openai-detector",
      inputs: text
    });

    return {
      classification: classification[0],
      aiDetection: generationDetection[0]
    };
  } catch (error) {
    console.error("ML analysis failed:", error);
    return null;
  }
}

module.exports = { analyzeWithML };