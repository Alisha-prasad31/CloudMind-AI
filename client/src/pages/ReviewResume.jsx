import React, { useState } from "react";
import { FileText, Upload, Search } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import Markdown from "react-markdown";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const ReviewResume = () => {
  const [resumeFile, setResumeFile] = useState(null); // actual file
  const [fileName, setFileName] = useState(""); // show file name
  const [analysisResult, setAnalysisResult] = useState(""); // mock/manual result
  const [content, setContent] = useState(""); // API result (markdown)

  const [loading, setLoading] = useState(false);

  const { getToken } = useAuth();

  // ✅ Upload handler
  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      setFileName(file.name);
      setAnalysisResult("");
      setContent("");
    }
  };

  // ✅ Analyze Resume handler
  const handleAnalyzeResume = async (e) => {
    e.preventDefault();
    try {
      if (!resumeFile) return toast.error("Please upload a resume first");

      setLoading(true);

      const formData = new FormData();
      formData.append("resume", resumeFile);

      const { data } = await axios.post("/api/ai/resume-review", formData, {
        headers: {
          Authorization: `Bearer ${await getToken()}`,
        },
      });

      if (data.success) {
        setContent(data.content); // markdown output
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);

      // fallback mock result
      setAnalysisResult(
        "✅ Resume looks great!\n\n💡 Suggestions:\n- Add measurable achievements.\n- Mention specific tools/technologies.\n- Keep it under 1 page for better impact."
      );
    }
    setLoading(false);
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left Column - Resume Upload */}
      <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Resume Review</h1>
        </div>

        {/* Upload Resume */}
        <p className="mt-6 text-sm font-medium">Upload Your Resume</p>
        <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 font-medium">
            {fileName ? fileName : "Click to upload your resume (PDF)"}
          </span>
          <input
            type="file"
            accept=".pdf"
            onChange={handleResumeUpload}
            className="hidden"
          />
        </label>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyzeResume}
          disabled={!resumeFile || loading}
          className={`w-full flex justify-center items-center gap-2 px-4 py-2 mt-6 text-sm rounded-full shadow-md transition ${
            resumeFile && !loading
              ? "bg-primary text-white hover:scale-105 cursor-pointer"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Search className="w-5" />
          )}
          {loading ? "Analyzing..." : "Analyze Resume"}
        </button>
      </div>

      {/* Right Column - Analysis Result */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Analysis Result</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          {analysisResult ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 p-3 bg-gray-50 rounded-lg shadow-sm w-full">
              {analysisResult}
            </pre>
          ) : content ? (
            <div className="mt-3 h-full overflow-y-scroll text-sm text-slate-600 w-full">
              <div className="reset-tw">
                <Markdown>{content}</Markdown>
              </div>
            </div>
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <FileText className="w-9 h-9" />
              <p>Upload your resume and click "Analyze Resume" to see feedback</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReviewResume;
