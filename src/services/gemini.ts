import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function askAssistant(prompt: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Você é o assistente virtual do "Amor em Ação", um sistema de gestão de assistência social. 
       Ajude o assistente social com dúvidas sobre protocolos, sugestões de encaminhamento ou resumos de casos.
       Seja empático, profissional e objetivo. Responda sempre em Português do Brasil.
       
       Usuário pergunta: ${prompt}`
    });
    
    return response.text || "Não consegui gerar uma resposta agora.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, estou tendo dificuldades para me conectar agora. Por favor, tente novamente em instantes.";
  }
}
