import { EvaluationResult, StudentRecords } from '../types';

const DB_KEY = 'smart-evaluation-system-records';

/**
 * Retrieves all student records from localStorage.
 * @returns {StudentRecords} An object containing all student records.
 */
export const getAllRecords = (): StudentRecords => {
  try {
    const recordsJson = localStorage.getItem(DB_KEY);
    return recordsJson ? JSON.parse(recordsJson) : {};
  } catch (error) {
    console.error("Failed to parse records from localStorage", error);
    return {};
  }
};

/**
 * Saves a single evaluation result to localStorage.
 * @param {string} collegeId - The ID of the student.
 * @param {EvaluationResult} result - The evaluation result to save.
 */
export const saveRecord = (collegeId: string, result: EvaluationResult): void => {
  try {
    const allRecords = getAllRecords();
    allRecords[collegeId] = result;
    localStorage.setItem(DB_KEY, JSON.stringify(allRecords));
  } catch (error) {
    console.error("Failed to save record to localStorage", error);
  }
};

/**
 * Retrieves a single student record from localStorage.
 * @param {string} collegeId - The ID of the student to retrieve.
 * @returns {EvaluationResult | undefined} The student's record or undefined if not found.
 */
export const getRecord = (collegeId: string): EvaluationResult | undefined => {
  const allRecords = getAllRecords();
  return allRecords[collegeId];
};
