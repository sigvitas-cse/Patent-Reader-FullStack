import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Collapse,
  Tooltip, // Material-UI Tooltip for hover
} from "@mui/material";
import "../Analysis.css";
import DOMPurify from "dompurify";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend
);

const BACKEND_URL = import.meta.env.VITE_API_URL;

function Profanity() {
  const [viewContent, setViewContent] = useState(false);
  const [viewProfanity, setViewProfanity] = useState(false);
  const [viewMatchedWords, setViewMatchedWords] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const [profanityWordCount, setProfanityWordCount] = useState({});
  const [viewHighlighted, setViewHighlighted] = useState("");
  const [totalProfanityCounts, setTotalProfanityCounts] = useState(0);
  const [fileName, setFileName] = useState("");
  const [fileFound, setFileFound] = useState(false);
  const [file, setFile] = useState(null);
  const [predefinedWords, setPredefinedWords] = useState({}); // New state for predefinedWords

  const { state } = useLocation();
  const navigate = useNavigate();

  // Initialize state from useLocation
  useEffect(() => {
    if (state) {
      console.log("Raw viewHighlighted HTML:", state.viewHighlighted);
      setProfanityWordCount(state.profanityWordCount || {});
      setViewHighlighted(state.viewHighlighted || "");
      setTotalProfanityCounts(state.totalProfanityCounts || 0);
      setFileName(state.fileName || "");
      setFileFound(state.fileFound || false);
      setFile(state.file || null);
      setPredefinedWords(state.totalMatchedProfanityObject || {}); // Store predefinedWords   
    }
  }, [state]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFileUploaded(selectedFile);
      setUploadMessage("");
    } else {
      setFileUploaded(null);
      setUploadMessage("Please select a valid CSV file.");
    }
  };

  const handleUploadProfanity = async () => {
    if (!fileUploaded) {
      setUploadMessage("No file selected.");
      return;
    }

    const formData = new FormData();
    formData.append("file", fileUploaded);

    try {
      const uploadResponse = await fetch(`${BACKEND_URL}/upload-profanity`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();
      if (!uploadResponse.ok) {
        setUploadMessage(uploadData.error || "Failed to upload profanity list.");
        return;
      }

      setUploadMessage(uploadData.message);
      setFileUploaded(null);
      document.querySelector('input[type="file"]').value = null;

      if (!file && !fileName) {
        setUploadMessage("No document available to reprocess.");
        return;
      }

      const reprocessFormData = new FormData();
      if (file) {
        reprocessFormData.append("file", file);
      } else {
        reprocessFormData.append("fileName", fileName);
      }

      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: reprocessFormData,
      });

      if (!response.ok) {
        throw new Error("Error reprocessing document with new profanity list.");
      }

      const data = await response.json();
      console.log("Reprocess API response", data);

      setProfanityWordCount(data.profanityWordCount || {});
      setViewHighlighted(data.highlightedContent || "");
      setTotalProfanityCounts(data.totalProfanityCounts || 0);
      setFileName(data.fileName || fileName);
      setFileFound(true);
      setPredefinedWords(data.predefinedWords || {}); // Update predefinedWords
    } catch (error) {
      setUploadMessage(`Error: ${error.message}`);
    }
  };

  if (!fileFound || Object.keys(profanityWordCount).length === 0) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Profanity Reporter
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No file uploaded or profanity data available. Please upload a file
            in the Analysis page.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/")}
            sx={{ mb: 2 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h6" gutterBottom>
              Upload Profanity List
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <input type="file" accept=".csv" onChange={handleFileChange} />
              <Button
                variant="contained"
                onClick={handleUploadProfanity}
                disabled={!fileUploaded}
              >
                Upload Profanity List
              </Button>
            </Box>
            {uploadMessage && (
              <Typography
                color={uploadMessage.includes("Error") ? "error" : "success"}
              >
                {uploadMessage}
              </Typography>
            )}
          </Box>
        </Paper>
      </Box>
    );
  }

  const handleHighlightedContent = () => {
    setViewContent((prevValue) => !prevValue);
  };

  const handleViewMatchedWords = () => {
    setViewMatchedWords((prevValue) => !prevValue);
  };

  const handleProfanityView = () => {
    setViewProfanity((prevValue) => !prevValue);
  };

  const handleDownload = async () => {
    if (!viewHighlighted || !fileName) {
      alert("No highlighted content or file name available for download.");
      return;
    }

    const contentSizeInBytes = new TextEncoder().encode(viewHighlighted).length;
    const contentSizeInMB = contentSizeInBytes / (1024 * 1024);
    const maxSizeInMB = 50;

    if (contentSizeInMB > maxSizeInMB) {
      alert(
        `The content size (${contentSizeInMB.toFixed(
          2
        )} MB) exceeds the maximum allowed size (${maxSizeInMB} MB). Please reduce the content size and try again.`
      );
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          highlightedContent: viewHighlighted,
          fileName: fileName.replace(".docx", ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download file");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName.replace(".docx", "")}_highlighted.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error.message);
      alert(`Error downloading file: ${error.message}`);
    }
  };

  // Render highlighted content with tooltips
  const renderHighlightedContent = () => {
    let highlightedContent = DOMPurify.sanitize(viewHighlighted);
    
    // Only process words that are in profanityWordCount to avoid unnecessary replacements
    Object.keys(profanityWordCount).forEach((word) => {
      const regex = new RegExp(
        `(<span style="background-color: yellow">${word}</span>)`,
        "gi"
      );
      const replacements = predefinedWords[word] || ["No replacements available"];
      highlightedContent = highlightedContent.replace(
        regex,
        `<span style="cursor: pointer;" title="Replacements: ${replacements.join(", ")}">$1</span>`
      );
    });

    return (
      <div
        style={{ textAlign: "justify" }}
        dangerouslySetInnerHTML={{ __html: highlightedContent }}
      />
    );
  };

  const matchedWordsCount = Object.keys(profanityWordCount).length;
  const totalWords = totalProfanityCounts;

  const chartData = {
    labels: ["Matched Words", "Total Profanity Words"],
    datasets: [
      {
        label: "Word Count",
        data: [matchedWordsCount, totalWords],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(153, 102, 255, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Profanity Words Matched vs Total Profanity Words",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Words",
        },
      },
    },
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom>
          Profanity Reporter
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" onClick={() => navigate("/")}>
              Back
            </Button>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button fullWidth variant="contained" onClick={handleProfanityView}>
              {viewProfanity ? "Close Analysis" : "View Analysis"}
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <input type="file" accept=".csv" onChange={handleFileChange} />
            <Button
              variant="contained"
              onClick={handleUploadProfanity}
              disabled={!fileUploaded}
            >
              Upload Profanity List
            </Button>
          </Box>
          {uploadMessage && (
            <Typography
              color={uploadMessage.includes("Error") ? "error" : "success"}
            >
              {uploadMessage}
            </Typography>
          )}
        </Box>

        <Collapse in={viewProfanity}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Button
                fullWidth
                variant="contained"
                onClick={handleHighlightedContent}
                sx={{ mb: 2 }}
              >
                {viewContent ? "Close Content" : "View Content"}
              </Button>

              <Button
                fullWidth
                variant="contained"
                onClick={handleViewMatchedWords}
                sx={{ mb: 2 }}
              >
                {viewMatchedWords
                  ? "Close Matched Words"
                  : "View Matched Words"}
              </Button>
              <Button
                fullWidth
                variant="contained"
                onClick={handleDownload}
                sx={{ mb: 2 }}
              >
                Download Highlighted Content (DOCX)
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={viewMatchedWords}>
                <Grid item xs={12}>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Word</TableCell>
                          <TableCell>Occurrence</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.keys(profanityWordCount).map((word, index) => (
                          <TableRow key={index}>
                            <TableCell>{word}</TableCell>
                            <TableCell>{profanityWordCount[word]}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
                    <Bar data={chartData} options={chartOptions} />
                  </Box>
                </Grid>
              </Collapse>
            </Grid>
            <Grid item xs={12}>
              <Collapse in={viewContent}>
                <Paper sx={{ p: 2, bgcolor: "white" }}>
                  {renderHighlightedContent()}
                </Paper>
              </Collapse>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>
    </Box>
  );
}

export default Profanity;