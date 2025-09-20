import React, { useState } from "react";
import { Image, Eraser, Upload } from "lucide-react";
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const RemoveObject = () => {
  const [image, setImage] = useState(null); // preview
  const [file, setFile] = useState(null); // upload backend
  const [fileName, setFileName] = useState(""); 
  const [description, setDescription] = useState("");
  const [processedImage, setProcessedImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");

  const { getToken } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      if (!file) return toast.error("Please upload an image first");
      if (!description) return toast.error("Please enter object to remove");

      // ✅ Restriction: single word only (as per your logic)
      if (description.trim().split(" ").length > 1) {
        return toast.error("Please enter only one object name");
      }

      setLoading(true);

      const formData = new FormData();
      formData.append("image", file);
      formData.append("object", description);

      const { data } = await axios.post(
        "api/ai/remove-image-object",
        formData,
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`,
          },
        }
      );

      if (data.success) {
        setContent(data.content);
        setProcessedImage(data.content);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setImage(URL.createObjectURL(file));
      setFileName(file.name);
      setProcessedImage(null);
      setContent("");
    }
  };

  const handleRemoveObject = (e) => {
    onSubmitHandler(e);
  };

  return (
    <div className="h-full overflow-y-auto p-6 flex flex-col lg:flex-row gap-6 text-slate-700">
      {/* Left Column - Input Section */}
      <div className="w-full max-w-lg p-6 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3">
          <Eraser className="w-6 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Remove Object</h1>
        </div>

        {/* Upload Image */}
        <p className="mt-6 text-sm font-medium">Upload Image</p>
        <label className="mt-3 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer hover:border-blue-400 transition">
          <Upload className="w-10 h-10 text-gray-400 mb-2" />
          <span className="text-sm text-gray-600 font-medium">
            {fileName ? fileName : "Click to upload or drag and drop"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        {/* Object Description */}
        <p className="mt-4 text-sm font-medium">Object to Remove</p>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          placeholder="e.g. tree"
          required
        />

        {/* Button */}
        <button
          disabled={loading}
          onClick={handleRemoveObject}
          className="w-full flex justify-center items-center gap-2 bg-primary text-white px-4 py-2 mt-6 text-sm rounded-full shadow-md cursor-pointer hover:scale-105 transition"
        >
          {loading ? (
            <span className="w-4 h-4 my-1 rounded-full border-2 border-t-transparent animate-spin"></span>
          ) : (
            <Eraser className="w-5" />
          )}
          Remove Object
        </button>
      </div>

      {/* Right Column - Processed Image Preview */}
      <div className="w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]">
        <div className="flex items-center gap-3">
          <Image className="w-5 h-5 text-[#4A7AFF]" />
          <h1 className="text-xl font-semibold">Processed Image</h1>
        </div>

        <div className="flex-1 flex justify-center items-center">
          {processedImage ? (
            <img
              src={processedImage}
              alt="Processed"
              className="max-h-[400px] object-contain rounded-lg shadow-sm"
            />
          ) : image ? (
            <img
              src={image}
              alt="Uploaded"
              className="max-h-[400px] object-contain rounded-lg shadow-sm"
            />
          ) : (
            <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
              <Image className="w-9 h-9" />
              <p>Upload an image, describe the object, and click "Remove Object"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RemoveObject;
