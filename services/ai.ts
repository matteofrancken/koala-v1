
import { GoogleGenAI, Type } from "@google/genai";
import { ToneType, LengthType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateDailyQuote() {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    Je bent een inspirerende business coach voor Vlaamse en Nederlandse KMO's. 
    Genereer één korte, krachtige quote die ondernemers motiveert om slimmer te werken en tijd te besparen.
    Focus op: tijdswinst, efficiëntie, passie voor ondernemen en het loslaten van administratieve lasten.
    Taal: Nederlands (met een professionele maar warme toon).
    Lengte: Maximaal 15-20 words.
    Geen hashtags, geen emoji's in de tekst zelf.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: "Genereer een nieuwe dagelijkse quote over tijd besparen voor een ondernemer.",
      config: {
        systemInstruction,
        temperature: 0.8, 
      }
    });

    return response.text.trim().replace(/^["']|["']$/g, '');
  } catch (error) {
    console.error("Quote Error:", error);
    return "Tijd is het enige kapitaal dat je niet kunt bijdrukken. Besteed het wijs.";
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
  const model = "gemini-3-flash-preview";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      intent: { type: Type.STRING, description: "De intentie van de klant (bijv. vraag, klacht)." },
      emotion: { type: Type.STRING, description: "De emotie van de klant (bijv. tevreden, gefrustreerd)." },
      urgency: { type: Type.STRING, description: "Urgentie-niveau (bijv. laag, medium, hoog)." },
      variantA: { type: Type.STRING, description: "Direct, professioneel en helder antwoord." },
      variantB: { type: Type.STRING, description: "Menselijker, warmer en creatiever antwoord." }
    },
    required: ["intent", "emotion", "urgency", "variantA", "variantB"]
  };

  const lengthPromptMap: Record<string, string> = {
    [LengthType.ULTRA_SHORT]: "Beperk je antwoord tot EXACT 1 of 2 zinnen. Niet meer.",
    [LengthType.SHORT]: "Schrijf EXACT 3 tot 5 zinnen.",
    [LengthType.NORMAL]: "Schrijf een antwoord van EXACT 6 tot 10 zinnen.",
    [LengthType.EXTENDED]: "Schrijf een uitgebreid antwoord van MINIMAAL 10 zinnen."
  };

  const specificLengthInstruction = lengthPromptMap[length] || "";

  const systemInstruction = `
    Je bent Koala, een hoogwaardige AI-assistent voor Belgische en Nederlandse KMO's. 
    Jouw doel is om ondernemers tijd te besparen door perfecte klantantwoorden te schrijven.
    
    GEBRUIKER INFO:
    - Naam: ${fullName}
    - Bedrijf: ${businessName}

    INPUT DETAILS (Trefwoorden/zinnen van de gebruiker):
    "${keywords}"

    STRIKTE REGELS VOOR HET VERWERKEN VAN DETAILS:
    1. Neem details NOOIT letterlijk over als ze grammaticaal fout of onvolledig zijn.
    2. Corrigeer hoofdletters en interpunctie automatisch.
    3. Zet losse woorden of trefwoorden om naar volledige, logische en professionele zinnen.
    4. Leid context af van de details en verbind deze op een natuurlijke manier met het klantbericht.
    5. Start NOOIT een zin met een detail dat met een kleine letter is geschreven.
    6. Verwerk details INHOUDELIJK; ze moeten vloeien in de tekst, niet als een lijstje overgenomen worden.

    ALGEMENE REGELS VOOR DE ANTWOORDEN:
    - Taal: Nederlands/Vlaams.
    - Toon: Pas je strikt aan de gevraagde stijl: ${tone}.
    - Lengte: ${specificLengthInstruction} Houd je hier strikt aan.
    - Layout: GEBRUIK WITREGELS TUSSEN ALINEA'S voor leesbaarheid.
    - Ondertekening: Sluit ELKE variant af met:
      Met vriendelijke groet,
      (ENTER)
      ${fullName}
      (ENTER)
      ${businessName}
    - Variant A: Focus op efficiëntie, directe actie en zakelijke helderheid.
    - Variant B: Focus op relatiebeheer, empathie en een warmere persoonlijke 'touch'.
    
    Belangrijk: Retourneer ENKEL het JSON object volgens het schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Klantbericht: "${message}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("Leeg antwoord van AI");
    return JSON.parse(text);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error("Kon geen antwoord genereren. Probeer het opnieuw.");
  }
}