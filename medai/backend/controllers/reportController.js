const axios = require("axios");
const fs = require("fs");
const path = require("path");
const Report = require("../models/Report");

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:5001";

// ================= UPLOAD REPORT =================
exports.uploadReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { reportType, reportDate } = req.body;

    const report = await Report.create({
      user: req.user.id,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      reportType: reportType || "GENERAL_CHECKUP",
      reportDate: reportDate || new Date(),
      processingStatus: "processing",
    });

    analyzeReport(report._id, req.file.path, reportType);

    res.status(201).json({
      success: true,
      message: "Report uploaded successfully",
      reportId: report._id,
    });
  } catch (error) {
    console.log("Upload Error:", error);
    res.status(500).json({ error: "Upload failed" });
  }
};

// ================= ANALYZE REPORT =================
async function analyzeReport(reportId, filePath, reportType) {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString("base64");

    const response = await axios.post(
      `${AI_SERVICE_URL}/analyze-report`,
      {
        file_data: base64File,
        report_type: reportType,
      },
      { timeout: 30000 }
    );

    const analysis = response.data;

    await Report.findByIdAndUpdate(reportId, {
      extractedText: analysis.extracted_text || "Analysis completed",
      parameters: analysis.parameters || [],
      abnormalValues: analysis.abnormal_values || [],
      reportType: analysis.detected_type || reportType,
      labName: analysis.lab_name || "Unknown Lab",
      patientName: analysis.patient_name || "Patient",
      reportDate: new Date(),

      analysis: {
        summary: analysis.summary || "Your report analyzed successfully.",
        overallStatus: analysis.overall_status || "normal",
        predictedRisks: analysis.predicted_risks || [],
        recommendations:
          analysis.recommendations || ["Maintain healthy lifestyle"],
        urgency: analysis.urgency || "routine",
        followUpRequired: false,
      },

      processingStatus: "completed",
    });
  } catch (error) {
    await Report.findByIdAndUpdate(reportId, {
      extractedText: "Basic analysis completed",
      parameters: [],
      abnormalValues: [],
      analysis: {
        summary:
          "Report uploaded successfully. Detailed AI analysis unavailable.",
        overallStatus: "normal",
        predictedRisks: [],
        recommendations: ["Doctor review recommended"],
        urgency: "routine",
        followUpRequired: false,
      },
      processingStatus: "completed",
    });
  }
}

// ================= GET ALL REPORTS =================
exports.getReports = async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    res.json({ reports });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

// ================= GET SINGLE REPORT =================
exports.getReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ report });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report" });
  }
};

// ================= DELETE REPORT =================
exports.deleteReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    if (fs.existsSync(report.filePath)) {
      fs.unlinkSync(report.filePath);
    }

    await Report.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Delete failed" });
  }
};

// ================= FAVORITE =================
exports.toggleFavorite = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    report.isFavorite = !report.isFavorite;
    await report.save();

    res.json({
      success: true,
      isFavorite: report.isFavorite,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed" });
  }
};

// ================= DOWNLOAD =================
exports.downloadReport = async (req, res) => {
  try {
    const report = await Report.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    const filePath = path.resolve(report.filePath);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing on server" });
    }

    return res.download(filePath, report.originalName);
  } catch (error) {
    console.log("Download Error:", error);
    res.status(500).json({ error: "Download failed" });
  }
};