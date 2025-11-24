import { GoogleGenAI } from "@google/genai";

const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getParentalAdvice = async (query: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const model = 'gemini-2.5-flash';
    
    const systemInstruction = `
      Você é um consultor parental especializado em gamificação e economia familiar positiva.
      O usuário é um pai ou mãe usando um aplicativo de "Banco Familiar" onde filhos ganham e gastam pontos.
      
      Seu objetivo é sugerir tarefas justas, valores de pontos equilibrados, ou formas construtivas de lidar com mau comportamento.
      Mantenha as respostas curtas, práticas e encorajadoras. Use formatação Markdown simples.
      Se pedirem sugestões de tarefas, inclua valores sugeridos de pontos (ex: 10-50 pts).
    `;

    const response = await ai.models.generateContent({
      model,
      contents: query,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 300,
      }
    });

    return response.text || "Desculpe, não consegui gerar uma sugestão no momento.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Erro ao consultar o assistente inteligente. Verifique sua chave de API.";
  }
};