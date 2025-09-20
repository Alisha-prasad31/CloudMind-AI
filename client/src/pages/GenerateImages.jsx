import React, { useState } from "react";
import { Image as ImageIcon, ImagePlus, Globe } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL; // ✅ fixed typo

const GenerateImages = () => {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState("512x512");
  const [style, setStyle] = useState("Realistic");
  const [publish, setPublish] = useState(false);
  const [images, setImages] = useState([]);

  const sizes = ["256x256", "512x512", "1024x1024"];
  const styles = ["Realistic", "Cartoon", "3D", "Minimalistic", "Cyberpunk"];

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const handleGenerate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const finalPrompt = `Generate an image of ${prompt} in the style ${style}`;

      const { data } = await axios.post(
        "/api/ai/generate-image",
        { prompt: finalPrompt, size, publish },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        if(data.content){setContent([data.content]);
}
        

        // Simulate multiple images if backend only returns one
        //const fakeImages = [
       //   `https://via.placeholder.com/512x512?text=${style}+Image+1`,
        //  `https://via.placeholder.com/512x512?text=${style}+Image+2`,
       // ];//
       // setImages(fakeImages);//

        if (publish) {
          console.log("✅ Image will be published to the community!");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left Panel */}
      <form
        onSubmit={handleGenerate}
        className="w-full lg:w-1/2 p-6 bg-white rounded-xl border border-gray-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <ImagePlus className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">AI Image Generator</h1>
        </div>

        {/* Prompt Input */}
        <p className="mt-6 text-sm font-medium">Image Prompt</p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Describe the image you want to generate..."
          rows={3}
          required
        />

        {/* Image Size */}
        <p className="mt-6 text-sm font-medium">Image Size</p>
        <div className="flex flex-wrap gap-3 mt-3">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`px-4 py-2 text-xs font-medium rounded-full border transition-all duration-300 ${
                size === s
                  ? "bg-primary text-white border-primary shadow-md scale-105"
                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:scale-105"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Image Style */}
        <p className="mt-6 text-sm font-medium">Image Style</p>
        <div className="flex flex-wrap gap-3 mt-3">
          {styles.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStyle(st)}
              className={`px-4 py-2 text-xs font-medium rounded-full border transition-all duration-300 ${
                style === st
                  ? "bg-primary text-white border-primary shadow-md scale-105"
                  : "bg-gray-100 text-gray-600 border border-gray-300 hover:bg-blue-50 hover:text-blue-700 hover:shadow-sm hover:scale-105"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm font-medium flex items-center gap-2">
            <Globe className="w-4 h-4 text-blue-500" />
            Publish to Community
          </p>
          <button
            type="button"
            onClick={() => setPublish(!publish)}
            className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
              publish ? "bg-blue-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                publish ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Generate Button */}
        <button
          disabled={loading}
          type="submit"
          className="w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#226BFF] to-[#65ADFF] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <ImageIcon className="w-5" />
          )}
          Generate Image
        </button>
      </form>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 max-w-lg p-6 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col min-h-96 max-h-[600px] overflow-y-auto">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="w-5 text-blue-500" /> Generated Images
        </h2>

        <div className="flex-1 mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {images.length > 0 ? (
            images.map((img, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
              >
                <img
                  src={img}
                  alt={`Generated ${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))
          ) : !content ? (
            <div className="text-gray-400 text-center mt-20 flex flex-col items-center gap-3 col-span-2">
              <ImageIcon className="w-10 h-10" />
              <p className="text-sm">
                Enter a prompt & click "Generate Image" to get started
              </p>
            </div>
          ) : (
            <div className="mt-3 h-full col-span-2">
              <img src={content} alt="generated" className="w-full h-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerateImages;
