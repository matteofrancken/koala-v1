import { GoogleGenAI, Type } from "@google/genai";
import { ToneType, LengthType } from "../types";

// Helper to safely access API key
const getApiKey = () => {
  try {
    return process.env.API_KEY || "";
  } catch (e) {
    return "";
  }
};

export async function askKoko(question: string, history: { role: 'user' | 'model', text: string }[] = []) {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      Je bent Koko de Koala, de vrolijke en deskundige AI-assistent van de 'Koala AI' app.
      Koala AI is een platform voor Belgische en Nederlandse ondernemers om hun klantencommunicatie te automatiseren.
      
      JOUW ROL:
      - Help gebruikers met vragen over de app.
      - Geef tips over hoe ze betere mails kunnen schrijven.
      - Leg uit wat de verschillende plannen (Gratis, Starter, Pro, Unlimited) inhouden.
      - Wees altijd vriendelijk, professioneel en een tikkeltje speels.
      
      RICHTLIJNEN:
      - Houd je antwoorden kort en bondig (max 3-4 zinnen).
      - Gebruik af en toe een emoji (🐨, ✨, ✍️).
      - Taal: Nederlands.
    `;

    const contents = [
      ...history.map(h => ({ role: h.role === 'model' ? 'model' : 'user', parts: [{ text: h.text }] })),
      { role: 'user', parts: [{ text: question }] }
    ];

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Sorry, ik kon geen antwoord genereren.";
  } catch (error) {
    console.error("Koko Error:", error);
    return "Oei, ik heb even een korte storing in mijn koala-boom! 🐨";
  }
}

export async function generateDailyQuote() {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const systemInstruction = `
      Je bent een inspirerende business coach voor Vlaamse en Nederlandse KMO's. 
      Genereer één korte, krachtige quote die ondernemers motiveert om slimmer te werken.
      Taal: Nederlands. Max 15 woorden.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: "Genereer een nieuwe dagelijkse quote over tijd besparen." }] }],
      config: {
        systemInstruction,
        temperature: 0.8, 
      }
    });

    return (response.text || "Focus op wat echt telt.").trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    return "Tijd is het enige kapitaal dat je niet kunt bijdrukken.";
  }
}

export async function generateKoalaResponse(
  message: string,
  tone: ToneType | string,
  length: LengthType,
  fullName: string,
  businessName: string,
  keywords: string = ""
) {
  try {
    const apiKey = getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-3-flash-preview";

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        intent: { type: Type.STRING },
        emotion: { type: Type.STRING },
        urgency: { type: Type.STRING },
        variantA: { type: Type.STRING },
        variantB: { type: Type.STRING }
      },
      required: ["intent", "emotion", "urgency", "variantA", "variantB"]
    };

    const systemInstruction = `
      Je bent Koala, een AI-assistent voor Belgische en Nederlandse KMO's. 
      Naam: ${fullName}, Bedrijf: ${businessName}.
      Keywords: ${keywords}.
      Toon: ${tone}.
      
      BELANGRIJK: Gebruik een correcte e-mail opbouw. Dit betekent dat je de tekst NOOIT als één blok verstuurt.
      Gebruik ALTIJD dubbele witregels (\\n\\n) tussen:
      1) De aanhef (bv. Beste...,)
      2) De inleidende zin
      3) De kern van het bericht (verdeel eventueel in kortere alinea's)
      4) De afsluiting (bv. Met vriendelijke groet,)
      5) Jouw naam en bedrijfsnaam
      
      STAPPENPLAN VOOR DE INHOUD:
      1) Formele/Vriendelijke aanspreking
      2) Bedanking
      3) Korte samenvatting van de vraag van de klant
      4) Helder antwoord of oplossing
      5) Duidelijke actie of vervolgstap
      6) Vriendelijke afsluitende groet met ${fullName} en ${businessName}.

      Output MOET in JSON zijn volgens het schema. Zorg dat de witregels (\n\n) correct in de JSON strings staan.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: [{ role: 'user', parts: [{ text: `Klantbericht: "${message}"` }] }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.3
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Kon geen antwoord genereren.");
  }
}