import React, { useState, useEffect } from "react";
import { getStudentReports } from "../services/reportService";
import { Report } from "../services/reportService";
import { StudentIcon, ResultCheckIcon } from "./icons";
import Spinner from "./Spinner";

const StudentResult: React.FC = () => {
  const [name, setName] = useState("");
  const [roll, setRoll] = useState("");
  const [results, setResults] = useState<Report[]>([]);
  const [filteredResults, setFilteredResults] = useState<Report[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [showSearchForm, setShowSearchForm] = useState(false);

  const handleSearch = async () => {
    if (!name.trim() || !roll.trim()) {
      setError("Please enter both your full name and roll number.");
      return;
    }
    setLoading(true);
    setError("");
    setSearched(true);
    setResults([]);
    setFilteredResults([]);
    setSubjects([]);
    setSelectedSubject("All");

    try {
      const data = await getStudentReports(name.trim(), roll.trim());
      setResults(data);
      if (data.length === 0) {
        setError("❌ No submissions found for the provided details.");
      } else {
        const uniqueSubjects = [...new Set(data.map((r) => r.examId))].sort();
        setSubjects(uniqueSubjects);
      }
    } catch (err: any) {
      setError("Error fetching results: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSubject === "All") {
      setFilteredResults(results);
    } else {
      setFilteredResults(results.filter((r) => r.examId === selectedSubject));
    }
  }, [selectedSubject, results]);
  
  const hasResults = searched && !loading && results.length > 0;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-brand-surface p-6 md:p-8 rounded-xl shadow-2xl shadow-brand-secondary/10 border border-brand-outline backdrop-blur-lg">
        {!hasResults ? (
          <>
            <div className="text-center mb-8">
              <div className="inline-block p-3 bg-brand-secondary/20 rounded-full mb-4">
                <StudentIcon className="h-8 w-8 text-brand-secondary" />
              </div>
              <h2 className="text-3xl font-bold text-text-primary">
                Student Result Portal
              </h2>
              <p className="mt-2 text-text-secondary">
                {showSearchForm
                  ? "Enter your details to view your assignment history."
                  : "Click the button below to find your results."}
              </p>
            </div>
            
            {!showSearchForm ? (
                <div className="text-center py-8">
                    <button
                        onClick={() => setShowSearchForm(true)}
                        className="group relative inline-flex items-center justify-center gap-3 py-4 px-10 border border-transparent text-lg font-semibold rounded-xl text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary/50 transition-all duration-300 shadow-lg shadow-brand-secondary/30 hover:shadow-brand-primary/40 transform hover:scale-105"
                    >
                        <ResultCheckIcon className="w-6 h-6" />
                        <span>Check Your Results</span>
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex flex-col sm:flex-row items-center gap-4 mb-4 max-w-lg mx-auto">
                    <input
                        placeholder="Enter your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-md shadow-sm placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary"
                    />
                    <input
                        placeholder="Enter your roll number"
                        value={roll}
                        onChange={(e) => setRoll(e.target.value)}
                        className="block w-full px-4 py-3 bg-brand-surface border border-brand-outline rounded-md shadow-sm placeholder-text-secondary/70 focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary"
                    />
                    </div>
                    <div className="text-center">
                    <button
                        onClick={handleSearch}
                        disabled={loading || !name.trim() || !roll.trim()}
                        className="group relative inline-flex justify-center py-3 px-8 border border-transparent text-sm font-medium rounded-md text-white bg-brand-secondary hover:bg-brand-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-secondary/50 transition-all duration-300 shadow-lg shadow-brand-secondary/30 hover:shadow-brand-primary/40 disabled:opacity-50 disabled:cursor-not-allowed min-w-[150px]"
                    >
                        {loading ? <Spinner /> : "Search History"}
                    </button>
                    </div>

                    {error && (
                    <p className="text-center mt-4 text-red-400">{error}</p>
                    )}
                </>
            )}
          </>
        ) : (
          <div className="mt-2">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
              <h3 className="text-2xl font-bold text-text-primary">
                Welcome, {name}!
              </h3>
              {subjects.length > 0 && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="subject-filter"
                    className="text-sm font-medium text-text-secondary"
                  >
                    Filter Subjects:
                  </label>
                  <select
                    id="subject-filter"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="px-3 py-2 bg-brand-bg-light border border-brand-outline rounded-md focus:outline-none focus:ring-2 focus:ring-brand-primary text-text-primary text-sm"
                  >
                    <option value="All">All Subjects</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <h4 className="text-xl font-semibold text-text-primary mb-4">Your Submissions</h4>

            {filteredResults.length > 0 ? (
              <div className="space-y-4">
                {filteredResults.map((r) => {
                  const submissionDate = r.createdAt?.toDate
                    ? r.createdAt.toDate().toLocaleDateString()
                    : "N/A";
                  const scorePercentage =
                    r.maxScore > 0 ? (r.score / r.maxScore) * 100 : 0;

                  return (
                    <div
                      key={r.id}
                      className="p-5 rounded-lg bg-brand-bg-light/50 border border-brand-outline transition-all hover:border-brand-primary/70"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-3">
                        <div>
                          <h4 className="font-bold text-lg text-text-primary">
                            {r.examId}
                          </h4>
                          <p className="text-xs text-text-secondary">
                            Submitted on: {submissionDate}
                          </p>
                        </div>
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-3">
                            <div className="text-center">
                              <p className="text-xs text-text-secondary">Score</p>
                              <p className="font-bold text-text-primary">
                                {r.score}
                                <span className="font-normal text-text-secondary">
                                  /{r.maxScore}
                                </span>
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-text-secondary">Grade</p>
                              <p className="font-bold text-lg text-brand-secondary">
                                {r.grade}
                              </p>
                            </div>
                          </div>
                          {r.teacherName && (
                            <p className="text-xs text-text-secondary mt-1">
                              Graded by: {r.teacherName}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="w-full bg-brand-outline rounded-full h-1.5 mb-4">
                        <div
                          className="bg-brand-primary h-1.5 rounded-full"
                          style={{ width: `${scorePercentage}%` }}
                        ></div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-text-primary mb-1">
                          Overall Feedback:
                        </p>
                        <p className="text-sm text-text-secondary p-3 bg-brand-surface rounded-md italic">
                          "{r.answersSummary || "No overall feedback provided."}"
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-text-secondary">
                <p>No submissions found for "{selectedSubject}".</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentResult;