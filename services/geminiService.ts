
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeComplaint = async (subject: string, description: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `
        بصفتك مسؤول خدمة عملاء في شركة "تاج باص" لحجز التذاكر، قم بتحليل الشكوى التالية وقدم رداً احترافياً وودوداً باللغة العربية.
        الموضوع: ${subject}
        الوصف: ${description}
        الرد يجب أن يتضمن: اعتذاراً، تأكيداً على الاهتمام، ووعداً بالحل.
      `,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "شكراً لتقديم بلاغك، سنقوم بمراجعة الشكوى والرد عليك قريباً.";
  }
};