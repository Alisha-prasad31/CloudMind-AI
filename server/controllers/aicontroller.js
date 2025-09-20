import { GoogleGenerativeAI } from "@google/generative-ai";
import sql from "../config/db.js";
import { clerkClient } from "@clerk/express";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import FormData from "form-data";
import fs from 'fs'
import pdf from 'pdf-parse/lib/pdf-parse.js'

import { constrainedMemory } from "process";


// ✅ Use Gemini SDK (NOT OpenAI)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
 

export const generateArticle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt, length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // ✅ Check free usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // ✅ Gemini Model Call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: length || 500,
      },
    });

    const content = result.response.text();


    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'article')
    `;

    // ✅ Update free usage if user is on free plan
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


//blog title-----
export const generateBlogTitle = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt,length } = req.body;
    const plan = req.plan;
    const free_usage = req.free_usage;

    // ✅ Check free usage limit
    if (plan !== "premium" && free_usage >= 10) {
      return res.json({
        success: false,
        message: "Limit reached. Upgrade to continue.",
      });
    }

    // ✅ Gemini Model Call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {role: "user",parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: length || 100,
      },
    });

    const content = result.response.text();

    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${prompt}, ${content}, 'blog-title')
    `;

    // ✅ Update free usage if user is on free plan
    if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }

    res.json({ success: true, content });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


//Image generate article--------
export const generateImage = async (req, res) => {
  try {
    const { userId } = req.auth();
    const { prompt,publish } = req.body;
    const plan = req.plan;
    

    // ✅ Check free usage limit
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This features is only available for premium subscriptions",
      });
    }
/*
    // ✅ Gemini Model Call
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent({
      contents: [
        {role: "user",parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: length || 100,
      },
    });

    const content = result.response.text();
*/

    const formData = new FormData()
    formData.append('prompt', prompt)

    const {data} =await axios.post("https://clipdrop-api.co/text-to-image/v1",formData,{
      headers: {
        'x-api-key': process.env.CLIPDROP_API_KEY,
      },
      responseType:"arraybuffer",
    })

    const base64Image = `data:image/png;base64,${Buffer.from(data, "binary").toString("base64")}`;

    const {secure_url}=await cloudinary.uploader.upload(base64Image)

    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type,publish)
      VALUES (${userId}, ${prompt}, ${secure_url}, 'image', ${publish ?? false})
    `;

    // ✅ Update free usage if user is on free plan
    /*if (plan !== "premium") {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: {
          free_usage: free_usage + 1,
        },
      });
    }*/

    res.json({ success: true, content:secure_url });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


//genrate removeImageBackground
export const removeImageBackground = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image  = req.file;
    const plan = req.plan;
    

    // ✅ Check free usage limit
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This features is only available for premium subscriptions",
      });
    }


    

    const {secure_url}=await cloudinary.uploader.upload(image.path,{
      transformation:[
        {
          effect:'background_removal',
          background_removal: 'remove_the_background'
        }
      ]
    })

    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, 'Remove background from image', ${secure_url}, 'image')
    `;

    res.json({ success: true, content:secure_url });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};


//removeobjectimage
export const removeImageObject = async (req, res) => {
  try {
    const { userId } = req.auth();
    const image  = req.file;
    const plan = req.plan;
    const { object } = req.body;
    

    // ✅ Check free usage limit
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This features is only available for premium subscriptions",
      });
    }


    

    const {public_id}=await cloudinary.uploader.upload(image.path)

    const imageUrl = cloudinary.url(public_id, {
        transformation: [{ effect: `gen_remove:${object}` }], // ✅ backticks
        resource_type: 'image'
      });


    // ✅ Save to DB
    await sql`
    INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${`Remove ${object} from image`}, ${imageUrl}, 'image')
    `;


    res.json({ success: true, content:imageUrl });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};

//review resume------
/*
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;
    
    

    // ✅ Check free usage limit
    if (plan !== "premium" ) {
      return res.json({
        success: false,
        message: "This features is only available for premium subscriptions",
      });
    }
    if(resume.size > 5 *1024 * 1024){
      return res.json({success:false,message:"Resume file size exceeds allowed size(5MB)."})
    }

    const dataBuffer=fs.readFileSync(resume.path)
    const pdfData = await pdf(dataBuffer)

    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. 

    Resume Content:${pdfData.text}`;


    const result = await model.generateContent({
      contents: [
        {role: "user",parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: length || 1000,
      },
    });

    const content = result.response.text();


    
    // ✅ Save to DB
    await sql`
    INSERT INTO creations (user_id, prompt, content, type)
    VALUES (${userId}, ${'Review the uploaded resume'}, ${content}, 'review-resume')
  `;



    res.json({ success: true, content});
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};*/
//resume viwe anylsis
export const resumeReview = async (req, res) => {
  try {
    const { userId } = req.auth();
    const resume = req.file;
    const plan = req.plan;

    // ✅ Premium check
    if (plan !== "premium") {
      return res.json({
        success: false,
        message: "This feature is only available for premium subscriptions",
      });
    }

    // ✅ File size check
    if (resume.size > 5 * 1024 * 1024) {
      return res.json({
        success: false,
        message: "Resume file size exceeds allowed size (5MB).",
      });
    }

    // ✅ Read PDF
    const dataBuffer = fs.readFileSync(resume.path);
    const pdfData = await pdf(dataBuffer);

    // ✅ Prompt
    const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. 

    Resume Content: ${pdfData.text}`;

    // ✅ Call Gemini
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // ✅ Save to DB
    await sql`
      INSERT INTO creations (user_id, prompt, content, type)
      VALUES (${userId}, ${"Review the uploaded resume"}, ${content}, 'review-resume')
    `;

    res.json({ success: true, content });
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    res.json({ success: false, message: error.message });
  }
};
