
import { GoogleGenAI, Type } from "@google/genai";
import { ToneType, LengthType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function askKoko(question: string, history: { role: 'user' | 'model', text: string }[] = []) {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    Je bent Koko de Koala, de vrolijke en deskundige AI-assistent van de 'Koala AI' app.
    Koala AI is een platform voor Belgische en Nederlandse ondernemers om hun klantencommunicatie te automatiseren.
    
    JOUW ROL:
    - Help gebruikers met vragen over de app.
    - Geef tips over hoe ze betere mails kunnen schrijven.
    - Leg uit wat de verschillende plannen (Gratis, Starter, Pro, Unlimited) inhouden.
    - Wees altijd vriendelijk, professioneel en een tikkeltje speels (je bent immers een koala).
    
    RICHTLIJNEN:
    - Houd je antwoorden kort en bondig (max 3-4 zinnen).
    - Gebruik af en toe een emoji (🐨, ✨, ✍️).
    - Taal: Nederlands (Vlaamse context is een plus).
    - Als je het antwoord niet weet, verwijs dan naar info@koala-ai.be.
  `;

  try {
    const contents = [
      ...history.map(h => ({ role: h.role, parts: [{ text: h.text }] })),
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

    return (response.text || "").trim();
  } catch (error) {
    console.error("Koko Error:", error);
    return "Oei, mijn koala-brein heeft even een kortsluiting! 🐨 Kun je het nog eens proberen of stuur een mailtje naar onze support?";
  }
}

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

    return (response.text || "").trim().replace(/^["']|["']$/g, '') || "Tijd is je meest kostbare bezit.";
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
  // Gebruik Flash model voor maximale snelheid (volle toeren)
  const model = "gemini-3-flash-preview";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      intent: { type: Type.STRING, description: "De intentie van de klant (bijv. vraag, klacht)." },
      emotion: { type: Type.STRING, description: "De emotie van de klant (bijv. tevreden, gefrustreerd)." },
      urgency: { type: Type.STRING, description: "Urgentie-niveau (bijv. laag, medium, hoog)." },
      variantA: { type: Type.STRING, description: "Direct en professioneel antwoord volgens de 7 stappen." },
      variantB: { type: Type.STRING, description: "Warmer en persoonlijker antwoord volgens de 7 stappen." }
    },
    required: ["intent", "emotion", "urgency", "variantA", "variantB"]
  };

  const lengthPromptMap: Record<string, string> = {
    [LengthType.ULTRA_SHORT]: "Houd het zeer beknopt, maar volg alle 7 stappen kort.",
    [LengthType.SHORT]: "Schrijf ongeveer 3 tot 5 zinnen in totaal, verdeeld over de 7 stappen.",
    [LengthType.NORMAL]: "Schrijf een gebalanceerd antwoord van 6 tot 10 zinnen.",
    [LengthType.EXTENDED]: "Schrijf een uitgebreid en zeer gedetailleerd antwoord."
  };

  const specificLengthInstruction = lengthPromptMap[length] || "";

  const systemInstruction = `
    Je bent Koala, een razendsnelle AI-assistent voor Belgische en Nederlandse KMO's. 
    Jouw doel is om ondernemers tijd te besparen door onmiddellijk perfecte klantantwoorden te schrijven.
    
    GEBRUIKER INFO:
    - Naam: ${fullName}
    - Bedrijf: ${businessName}

    INPUT DETAILS (Trefwoorden/zinnen van de gebruiker):
    "${keywords}"

    STRIKTE STANDAARDOPBOUW VOOR ELK ANTWOORD (7 STAPPEN):
    1) Aanspreking: Warm, professioneel, klantgericht (bv. Beste [naam], Dag [naam]).
    2) Bedanking + erkenning van de vraag: Toont respect en klantgerichtheid.
    3) Korte samenvatting van hun vraag/probleem: Laat zien dat je het goed begrepen hebt.
    4) Antwoord / oplossing / status: Duidelijk, concreet, zonder ruis. Gebruik bullets als er meerdere punten zijn.
    5) Actie die jij neemt + actie die zij moeten nemen: Wees zeer duidelijk over wat er nu gebeurt.
    6) Afsluitende geruststelling / extra hulp: Toont klantvriendelijkheid en verlaagt frustratie.
    7) Professionele groet + bedrijfsnaam:
       Met vriendelijke groeten,
       ${fullName}
       ${businessName}

    STRIKTE REGELS VOOR DE ANTWOORDEN:
    - Taal: Nederlands/Vlaams.
    - Toon: Pas je strikt aan de gevraagde stijl: ${tone}.
    - Lengte: ${specificLengthInstruction}
    - Layout: GEBRUIK WITREGELS TUSSEN ALINEA'S (stappen) voor leesbaarheid.
    - Variant A: Focus op efficiëntie en zakelijke helderheid.
    - Variant B: Focus op relatiebeheer en een warmere persoonlijke touch.

    Details verwerking:
    - Zet trefwoorden uit de details om naar vloeiende, grammaticaal correcte zinnen.
    - Corrigeer fouten in de details automatisch.
    
    Belangrijk: Retourneer ENKEL het JSON object volgens het schema. Wees bondig en accuraat.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: `Klantbericht: "${message}"`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema,
        temperature: 0.2 // Lagere temperatuur voor consistentere en snellere output
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
