import { db, auth } from "./firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, getDocs, doc, updateDoc, collectionGroup, where, deleteDoc } from "firebase/firestore";
import { EvaluationItem } from "../types";

export interface Report {
  id?: string;
  studentId: string;
  studentName: string;
  examId: string;
  score: number;
  maxScore: number;
  answersSummary?: string;
  gradedBy?: string;
  teacherName?: string;
  createdAt?: any;
  plagiarismPercent?: number;
  grade?: string;
  breakdown?: EvaluationItem[];
  extractedText?: string;
}

// Function to save a new evaluation report
export async function saveEvaluationReport(reportData: any) {
  const user = auth.currentUser;
  if (!user) throw new Error("No teacher signed in!");

  const teacherId = user.uid;
  const reportsRef = collection(db, "teachers", teacherId, "reports");

  const docRef = await addDoc(reportsRef, {
    ...reportData,
    gradedBy: teacherId,
    teacherName: user.displayName || user.email,
    createdAt: serverTimestamp(),
  });

  console.log("Report saved with ID:", docRef.id);
  return docRef.id;
}

// Function to read all reports of the logged-in teacher
export async function getAllReports(): Promise<Report[]> {
  const user = auth.currentUser;
  if (!user) throw new Error("No teacher signed in!");

  const teacherId = user.uid;
  const reportsRef = collection(db, "teachers", teacherId, "reports");
  const q = query(reportsRef, orderBy("createdAt", "desc"));

  const snapshot = await getDocs(q);
  const reports: Report[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Report),
  }));

  return reports;
}

export async function updateReport(reportId: string, newData: Partial<{ score: number; maxScore: number; answersSummary: string }>) {
  const user = auth.currentUser;
  if (!user) throw new Error("No teacher signed in!");

  const teacherId = user.uid;
  const reportRef = doc(db, "teachers", teacherId, "reports", reportId);
  await updateDoc(reportRef, newData);

  console.log("✅ Report updated successfully!");
}

export async function deleteReport(reportId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("No teacher signed in!");

  const teacherId = user.uid;
  const reportRef = doc(db, "teachers", teacherId, "reports", reportId);
  await deleteDoc(reportRef);

  console.log("✅ Report deleted successfully!");
}


export async function getStudentReports(studentName: string, studentId: string): Promise<Report[]> {
  // collectionGroup searches across all subcollections with the same name, in this case 'reports'
  const reportsRef = collectionGroup(db, "reports"); 
  const q = query(
    reportsRef,
    where("studentName", "==", studentName),
    where("studentId", "==", studentId)
  );

  const snap = await getDocs(q);
  const results: Report[] = snap.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Report),
  }));

  return results;
}