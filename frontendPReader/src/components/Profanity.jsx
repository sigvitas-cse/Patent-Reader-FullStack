// Profanity.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Grid,
  Paper,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse,
} from "@mui/material";
import "../Analysis.css";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function Profanity() {
  const [viewContent, setViewContent] = useState(false);
  const [viewProfanity, setViewProfanity] = useState(false);
  const [viewMatchedWords, setViewMatchedWords] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");
  const { state } = useLocation();
  const navigate = useNavigate();
  const {
    profanityWordCount,
    fileUploadedFound,
    viewHighlighted,
    fileUploadedName,
    totalProfanityCounts,
    file
  } = state || {};

  console.log("inside Profanity", file);

  const handlefileUploadedChange = (event) => {
    const selectedfileUploaded = event.target.fileUploadeds[0];
    if (selectedfileUploaded && selectedfileUploaded.type === "text/csv") {
      setFileUploaded(selectedfileUploaded);
      setUploadMessage("");
    } else {
      setFileUploaded(null);
      setUploadMessage("Please select a valid CSV fileUploaded.");
    }
  };

  const handleUploadProfanity = async () => {
    if (!fileUploaded) {
      setUploadMessage("No fileUploaded selected.");
      return;
    }

    const formData = new FormData();
    formData.append("fileUploaded", fileUploaded);

    try {
      const response = await fetch("http://localhost:5000/upload-profanity", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        setUploadMessage(data.message);
        setFileUploaded(null);
        document.querySelector('input[type="fileUploaded"]').value = null;
      } else {
        setUploadMessage(data.error || "Failed to upload profanity list.");
      }
    } catch (error) {
      setUploadMessage(`Error uploading fileUploaded: ${error.message}`);
    }
  };

  if (!fileUploadedFound || !profanityWordCount) {
    return (
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Profanity Reporter
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            No fileUploaded uploaded or profanity data available. Please upload a fileUploaded
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
            <Typography variant="h6" gutterBottom sx={{ color: "white" }}>
              Upload Profanity List
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <input type="fileUploaded" accept=".csv" onChange={handlefileUploadedChange} />
              <Button
                variant="contained"
                onClick={handleUploadProfanity}
                disabled={!fileUploaded}
                sx={{ color: "white" }}
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
    if (!viewHighlighted || !fileUploadedName) {
      alert("No highlighted content or fileUploaded name available for download.");
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
      const response = await fetch("http://localhost:5000/download", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          highlightedContent: viewHighlighted,
          fileUploadedName: fileUploadedName.replace(".docx", ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to download fileUploaded");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileUploadedName.replace(".docx", "")}_highlighted.docx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading fileUploaded:", error.message);
      alert(`Error downloading fileUploaded: ${error.message}`);
    }
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
        <Typography variant="h4 'p'" gutterBottom>
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
            <input type="fileUploaded" accept=".csv" onChange={handlefileUploadedChange} />
            <Button
              variant="contained"
              onClick={handleUploadProfanity}
              disabled={!fileUploaded}
              color="white"
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
            {/* <Grid item xs={12}>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Word</TableCell>
                      <TableCell>Occurrence</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(profanityWordCount).map(
                      ([word, count], index) => (
                        <TableRow key={index}>
                          <TableCell>{word}</TableCell>
                          <TableCell>{count}</TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
                <Bar data={chartData} options={chartOptions} />
              </Box>
            </Grid> */}
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
                        {Object.entries(profanityWordCount).map(
                          ([word, count], index) => (
                            <TableRow key={index}>
                              <TableCell>{word}</TableCell>
                              <TableCell>{count}</TableCell>
                            </TableRow>
                          )
                        )}
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
                  <div dangerouslySetInnerHTML={{ __html: viewHighlighted }} />
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
