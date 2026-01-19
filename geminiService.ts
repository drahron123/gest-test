
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProfessionalMessage = async (topic: string, tone: string = 'professionale') => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Scrivi un breve messaggio aziendale per una bacheca riguardo a: "${topic}". Il tono deve essere ${tone}. Restituisci il risultato in formato testo semplice, con un titolo accattivante nella prima riga seguito dal contenuto.`,
    });
    
    const text = response.text || '';
    const lines = text.split('\n');
    const title = lines[0].replace(/^(Titolo: )/i, '').trim();
    const content = lines.slice(1).join('\n').trim();
    
    return { title, content };
  } catch (error) {
    console.error("Errore Gemini API:", error);
    return { title: "Errore", content: "Non è stato possibile generare il messaggio." };
  }
};

export const suggestChatReply = async (incomingMessage: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analizza questo messaggio ricevuto da un collega: "${incomingMessage}". Suggerisci una risposta professionale, cordiale e concisa in italiano. Restituisci solo il testo della risposta.`,
    });
    return response.text?.trim() || "Ricevuto, ti faccio sapere a breve.";
  } catch (error) {
    console.error("Errore Gemini API:", error);
    return "Grazie per il messaggio.";
  }
};

export const generateReshipmentEmail = async (customerName: string, reason: string, tracking?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Componi una email professionale e gentile per il cliente ${customerName}. 
      L'oggetto del messaggio è la rispedizione del suo ordine a causa di: "${reason}". 
      ${tracking ? `Includi il tracking number: ${tracking}.` : 'Comunica che riceverà il tracking a breve.'}
      Il tono deve essere rassicurante e orientato al servizio clienti di alta qualità. In italiano.`,
    });
    return response.text?.trim() || "Gentile cliente, il suo ordine è in fase di rispedizione.";
  } catch (error) {
    console.error("Errore Gemini API:", error);
    return "Impossibile generare la bozza dell'email.";
  }
};

export const parseEventFromNaturalLanguage = async (input: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Estrai le informazioni per un evento di calendario da questo testo: "${input}". 
      La data di riferimento odierna è ${new Date().toLocaleDateString()}.
      Formatta l'ora come HH:mm e la data come YYYY-MM-DD.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            date: { type: Type.STRING },
            startTime: { type: Type.STRING },
            endTime: { type: Type.STRING },
            description: { type: Type.STRING }
          },
          required: ["title", "date", "startTime"]
        }
      }
    });
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Errore Gemini API Calendar:", error);
    return null;
  }
};
