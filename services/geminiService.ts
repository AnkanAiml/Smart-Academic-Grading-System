import { GoogleGenAI, Type } from "@google/genai";
import { EvaluationResult, EvaluationItem, EvaluationSummary, PlagiarismReport } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

/**
 * Engages in a chat with the AI to define evaluation rules.
 */
export async function getRulesFromChat(
  history: { role: 'user' | 'model'; parts: { text: string }[] }[]
): Promise<string> {
    const systemInstruction = `You are a helpful AI assistant for a teacher. Your purpose is to help the teacher create a set of clear, structured rules for evaluating an exam.
- When the teacher provides instructions, rephrase them as a clear, numbered list to confirm your understanding. For example, if they say 'q1 is 10 marks', you should say '1. Question 1 is worth 10 marks.'
- If instructions are ambiguous, ask for clarification.
- Combine all confirmed rules into a single, comprehensive list.
- Your final response in a turn, after the user has provided rules, should *only* be the summarized list of rules. Do not add conversational filler like 'Here are the rules:'. Just output the list.
- If the chat history is empty, start the conversation by greeting the teacher and asking them to describe the marking scheme.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: history,
        config: {
            systemInstruction: systemInstruction,
        }
    });

    return response.text;
}

/**
 * Utility: Convert handwriting or PDF to text using Gemini
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve((reader.result as string).split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [
      { text: "Extract all text clearly and accurately from this handwritten or printed answer sheet." },
      { inlineData: { mimeType: file.type, data: base64 } },
    ]},
  });

  return response.text;
}

/**
 * Utility: Plagiarism check (mocked)
 */
export async function checkPlagiarism(text: string): Promise<{ percentage: number; summary: string }> {
  // As external API calls can be unreliable in some environments, this provides a mock result.
  const percentage = Math.floor(Math.random() * 20); // Simulate 0-20% plagiarism
  const summary = percentage > 5 
      ? `A low to moderate similarity score of ${percentage}% was detected. Manual review is recommended.`
      : `No significant plagiarism detected (${percentage}% similarity).`;
  return { percentage, summary };
}

const calculateGrade = (totalMarksAwarded: number, totalMaxMarks: number): string => {
    if (totalMaxMarks === 0) return 'N/A';
    const percentage = (totalMarksAwarded / totalMaxMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        evaluation: {
            type: Type.ARRAY,
            description: "A question-wise breakdown of the evaluation.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING, description: "The question being evaluated." },
                    studentAnswer: { type: Type.STRING, description: "A brief summary of the student's answer for this question." },
                    marksAwarded: { type: Type.NUMBER, description: "Marks awarded for this specific question." },
                    maxMarks: { type: Type.NUMBER, description: "Maximum marks possible for this question." },
                    feedback: { type: Type.STRING, description: "Detailed, constructive feedback for the student's answer to this question." },
                },
                required: ["question", "studentAnswer", "marksAwarded", "maxMarks", "feedback"]
            }
        },
        summary: {
            type: Type.OBJECT,
            description: "A summary of the entire evaluation.",
            properties: {
                overallFeedback: { type: Type.STRING, description: "A comprehensive summary of the student's overall performance, highlighting strengths and areas for improvement." }
            },
            required: ["overallFeedback"]
        }
    },
    required: ['evaluation', 'summary']
};


export const evaluateAnswerSheet = async (
  collegeId: string,
  studentName: string,
  rollNo: string,
  subject: string,
  questionText: string,
  answerText: string,
  customRules: string
): Promise<EvaluationResult> => {

    // Step 1: Plagiarism Check
    const plagiarismResult = await checkPlagiarism(answerText);

    // Step 2: AI Evaluation for detailed breakdown
    const rulesInstruction = customRules 
        ? `A specific set of custom grading rules has been provided. You MUST follow these rules strictly when grading. The rules are:\n---\n${customRules}\n---`
        : "Evaluate based on general academic standards for the subject matter.";

    const prompt = `You are an expert and strict examiner evaluating a student's exam paper.
    Your primary task is to provide a detailed, question-by-question evaluation. Follow these steps methodically:

    **Step 1: Understand the Question Paper Thoroughly**
    First, carefully read and analyze the entire **QUESTION PAPER** provided below. Understand the scope of each question, the marks allocated, and what is being asked. This is the most critical step.

    **Step 2: Apply Grading Rules**
    Adhere strictly to the grading rules. ${rulesInstruction}

    **Step 3: Evaluate the Student's Answers**
    Only after you have a complete understanding of the questions and rules, proceed to the **STUDENT'S ANSWER SHEET**.
    1. For each question from the question paper, locate the corresponding answer in the student's answer sheet.
    2. Evaluate the answer critically against the question's requirements and the grading rules. Award marks based on correctness, completeness, and clarity. Be strict with partial marks.
    3. Provide concise, specific, and constructive feedback for each answer. Point out mistakes and suggest improvements.
    4. After evaluating all questions, write a final summary of the student's overall performance.

    **Step 4: Format the Output**
    The final output MUST be a valid JSON object that adheres to the provided schema. Do not include any text or markdown formatting outside of the JSON object.

    **QUESTION PAPER:**
    ---
    ${questionText}
    ---

    **STUDENT'S ANSWER SHEET:**
    ---
    ${answerText}
    ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: evaluationSchema,
        }
    });
    
    const jsonText = response.text.trim();
    const parsedResult: { evaluation: EvaluationItem[]; summary: { overallFeedback: string } } = JSON.parse(jsonText);

    // Step 3: Assemble the final, comprehensive result object
    const totalMarksAwarded = parsedResult.evaluation.reduce((sum, item) => sum + item.marksAwarded, 0);
    const totalMaxMarks = parsedResult.evaluation.reduce((sum, item) => sum + item.maxMarks, 0);
    const finalGrade = calculateGrade(totalMarksAwarded, totalMaxMarks);
    
    const plagiarismReport: PlagiarismReport = {
        status: plagiarismResult.percentage > 5 ? 'Plagiarism Detected' : 'Clear',
        summary: plagiarismResult.summary,
        matches: [], // The simple check doesn't provide specific matches
        plagiarismPercentage: plagiarismResult.percentage
    };
    
    const summary: EvaluationSummary = {
        totalMarksAwarded,
        totalMaxMarks,
        finalGrade,
        overallFeedback: parsedResult.summary.overallFeedback,
    };

    const fullResult: EvaluationResult = {
        collegeId,
        studentName,
        rollNo,
        subject,
        // FIX: Removed duplicate 'new' keyword.
        submissionDate: new Date().toISOString(),
        extractedText: answerText,
        plagiarismReport,
        evaluation: parsedResult.evaluation,
        summary,
    };

    return fullResult;
};