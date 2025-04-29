import React, { useState } from "react";
import "../Analysis.css";
import { useNavigate } from "react-router-dom";
import PizZip from "pizzip";
import { saveAs } from "file-saver";

const BACKEND_URL =import.meta.env.VITE_API_URL;
console.log("Backend URL:", BACKEND_URL); // Debugging

function Analysis() {
  const [fileName, setFileName] = useState("Not Selected");
  const [crossWord, setCrossWord] = useState("Section Not Found");
  const [fieldWord, setFieldWord] = useState("Section Not found");
  const [backgroundWord, setBackgroundWord] = useState("Section Not found");
  const [summaryWord, setSummaryWord] = useState("Section Not found");
  const [drofDraWord, setDroofDraWord] = useState("Section Not found");
  const [detaDesWord, setDetaDesWord] = useState("Section Not found");
  const [claimedWord, setClaimedWord] = useState("Section Not found");
  const [abstractWord, setAbstractWord] = useState("Section Not found");
  const [fileContent, setFileContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showFileContent, setShowFileContent] = useState(false);
  const [modifiedTitle, setModifiedTitle] = useState("Title Not found");
  const [wordCount, setWordCount] = useState(0);
  const [imgCount, setImgCount] = useState(0);
  const [dependent, setdependent] = useState(0);
  const [independent, setIndependent] = useState(0);
  const [total, setTotal] = useState(0);
  const [sentenceCount, setSentenceCount] = useState(0);
  const [lineCount, setLineCount] = useState(0);
  const [showClaimContent, setShowClaimContent] = useState(false);
  const [independentClaimLists, setIndependentClaimLists] = useState("");
  const [dependentClaimLists, setDependentClaimLists] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [showResult, setShowResult] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [sectionData, setSectionData] = useState([]);
  const [titleChar, setTitleChar] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [fileFound, setFileFound] = useState(false);
  const [showParagraphSummary, setShowParagraphSummary] = useState(false);

  // Paragraph counts
  const [crossParagraphCount, setCrossParagraphCount] = useState(0);
  const [backgroundParagraphCount, setBackgroundParagraphCount] = useState(0);
  const [summaryParagraphCount, setSummaryParagraphCount] = useState(0);
  const [drawingDParagraphCount, setDrawingDParagraphCount] = useState(0);
  const [detailedDescriptionPCount, setDetailedDescriptionPCount] = useState(0);
  const [abstractPCount, setAbstractPCount] = useState(0);

  // State for file input, errors, word counts, matched words, confirmation, and updated file
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [wordCounts, setWordCounts] = useState({});
  const [matchedWords, setMatchedWords] = useState({});
  const [confirmationNeeded, setConfirmationNeeded] = useState(false);
  const [updatedFile, setUpdatedFile] = useState(null);
  const [matchedKeys, setMatchedKeys] = useState([]);
  const [replacementSelections, setReplacementSelections] = useState({});
  const [showReplacementSelector, setShowReplacementSelector] = useState(false);
  const [claimTermCounts, setClaimTermCounts] = useState({});
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showProfanity, setShowProfanity] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isAbstractHovered, setIsAbstractHovered] = useState(false);
  const [showIndependentClaim, setShowIndependentClaim] = useState(false);
  const [showDependentClaim, setShowDependentClaim] = useState(false);

  // Word limits for sections
  const abstractWordLimit = 150;
  const backgroundWordLimit = 500;
  const summaryWordLimit = 800;

  // Conditions for exceeding word limits
  const isAbstractExceeding = abstractWord > abstractWordLimit;
  // const isAbackgroundExceeding = backgroundWord > backgroundWordLimit;
  // const isSummaryExceeding = summaryWord > summaryWordLimit;

  // Predefined words and replacements
  const predefinedWords = {
    Above: ["Surpassing", "Beyond"],
    "Adapted For": ["Altered for", "Modified for"],
    "Adapted To": ["Made adjustments to", "Modified to"],
    All: ["The total", "Every single"],
    Always: ["Perpetually", "Invariably"],
    Allow: ["Permit", "Grant"],
    Appropriately: ["Accordingly", "Fittingly"],
    Authoritative: ["Attested", "Authenticated"],
    Approximate: ["Closer", "Almost"],
    Around: ["On all sides", "Throughout"],
    Below: ["Less than", "Lower than"],
    Big: ["Oversize", "Hefty"],
    Best: ["Perfect", "Ace", "Incomparable"],
    Biggest: ["Largest", "Huge"],
    Bigger: ["Greater", "Heftier"],
    "Black Hat": ["Cybercriminal", "Cracker"],
    But: ["Although", "In spite"],
    "By Necessity": ["Obligatory", "Inescapable"],
    "Black List": ["Ban list", "Prohibited list"],
    Broadest: ["Spacious", "Widespread"],
    Certain: ["Undoubtful", "Assertively"],
    Certainly: ["Exactly", "Assertively"],
    "Characterized By": ["Defined by", "Recognised by"],
    Chief: ["Head", "First"],
    "Chinese Wall": ["Information Partition", "Ethical barrier"],
    Compel: ["Enforce", "Urge"],
    Clearly: ["Noticeably", "Undoubtedly"],
    Completely: ["To the limit", "Fully"],
    Compelled: ["Bound", "Forced"],
    "Composed Of": ["Involving", "Constructed from"],
    Compelling: ["Forcing"],
    Every: ["each"],
  };

  // Claim-specific terms
  const claimSpecificTerms = [
    "at least one",
    "at least two",
    "one or more",
    "plurality of",
    "wherein",
  ];

  const navigate = useNavigate();

  // Handle radio button changes
  const handleRadioChange = (event) => {
    const value = event.target.value;
    if (value === "option1") {
      setShowResult(true);
      setShowDrop(false);
    } else {
      setShowResult(false);
      setShowDrop(true);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(true);
  };

  // Handle checkbox toggle for sections
  const toggleCheckbox = (sectionName) => {
    if (selectedSections.includes(sectionName)) {
      setSelectedSections(selectedSections.filter((name) => name !== sectionName));
    } else {
      setSelectedSections([...selectedSections, sectionName]);
    }
  };

  // Handle file upload and send to backend
  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) {
      setErrorMessage("Please select a file.");
      return;
    }

    setFile(selectedFile);
    setFileFound(true);
    setFileName(selectedFile.name.replace(".docx", ""));
    setErrorMessage("");
    setWordCounts({});
    setMatchedWords({});
    setConfirmationNeeded(false);
    setUpdatedFile(null);
    setError(null);
    setMatchedKeys([]);
    setReplacementSelections({});
    setShowReplacementSelector(false);
    setClaimTermCounts({});

    // Send file to backend
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch(`${BACKEND_URL}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error uploading file to server.");
      }

      const data = await response.json();

      // Update state with backend response
      setFileName(data.fileName);
      setModifiedTitle(data.modifiedTitle);
      setTitleChar(data.titleChar);
      setWordCount(data.wordCount);
      setSentenceCount(data.sentenceCount);
      setLineCount(data.lineCount);
      setCrossWord(data.crossWord);
      setCrossParagraphCount(data.crossParagraphCount);
      setFieldWord(data.fieldWord);
      setBackgroundWord(data.backgroundWord);
      setBackgroundParagraphCount(data.backgroundParagraphCount);
      setSummaryWord(data.summaryWord);
      setSummaryParagraphCount(data.summaryParagraphCount);
      setDroofDraWord(data.drofDraWord);
      setDrawingDParagraphCount(data.drawingDParagraphCount);
      setDetaDesWord(data.detaDesWord);
      setDetailedDescriptionPCount(data.detailedDescriptionPCount);
      setClaimedWord(data.claimedWord);
      setAbstractWord(data.abstractWord);
      setAbstractPCount(data.abstractPCount);
      setImgCount(data.imgCount);
      setTotal(data.total);
      setIndependent(data.independent);
      setdependent(data.dependent);
      setIndependentClaimLists(data.independentClaimLists);
      setDependentClaimLists(data.dependentClaimLists);
      setSectionData(data.sectionData);
      setFileContent(""); // File content is not sent from backend to reduce payload size
    } catch (error) {
      setErrorMessage("Error processing the file: " + error.message);
    }
  };

  const handleSummary = () => {
    setShowSummary((prevValue) => !prevValue);
  };

  const handleParagraphSummary = () => {
    setShowParagraphSummary((prevValue) => !prevValue);
  };

  // Download matched words as text file
  const downloadMatchedWordsAsTxt = () => {
    const colWidth1 = 25;
    const colWidth2 = 40;
    const colWidth3 = 10;
    const header = `Predefined Words${" ".repeat(colWidth1 - "Predefined Words".length)}| Alternative Words${" ".repeat(colWidth2 - "Alternative Words".length)}| Count`;
    const border = `${"-".repeat(colWidth1)}+${"-".repeat(colWidth2)}+${"-".repeat(colWidth3)}`;
    let rows = [];

    for (const [word, count] of Object.entries(wordCounts)) {
      const wordCol = word.padEnd(colWidth1, " ");
      const altCol = predefinedWords[word].join(", ").padEnd(colWidth2, " ");
      const countCol = count.toString().padEnd(colWidth3, " ");
      rows.push(`${wordCol}| ${altCol}| ${countCol}`);
    }

    const fileContent = [header, border, ...rows].join("\n");
    const blob = new Blob([fileContent], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "MatchedPredefinedWords.txt");
  };

  const tableStyle = {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "20px",
  };

  const thTdStyle = {
    border: "1px solid black",
    padding: "8px",
    textAlign: "left",
  };

  const handleAnalysis = () => {
    setShowAnalysis((prevValue) => !prevValue);
    setShowDrop(showAnalysis ? false : showDrop);
    setShowResult(showAnalysis ? false : showResult);
    setShowFileContent(showAnalysis ? false : showFileContent);
    setShowClaimContent(showAnalysis ? false : showClaimContent);
  };

  const handleProfanity = () => {
    setShowProfanity((prevValue) => !prevValue);
    setShowReplacementSelector(showProfanity ? false : showReplacementSelector);
    setConfirmationNeeded(showProfanity ? false : confirmationNeeded);
  };

  const handleIndependentClaimList = () => {
    setShowIndependentClaim((prevValue) => !prevValue);
  };

  const handleDependentClaimList = () => {
    setShowDependentClaim((prevValue) => !prevValue);
  };

  return (
    <div className="App">
      <div
        style={{
          letterSpacing: 0,
          top: 0,
          width: "100%",
          backgroundColor: "",
          color: "white",
          padding: "20px",
          fontWeight: "bold",
          textDecorationColor: "#03e9f4",
        }}
      >
        <h1>Patent Reader</h1>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "gba(255, 255, 255, 0.1)",
        }}
      >
        <input type="file" accept=".docx" onChange={handleFileChange} />
        <div>
          <button
            className="manually button"
            onClick={() => navigate("/Mannual")}
          >
            Enter manually
          </button>
        </div>
      </div>
      {fileFound && (
        <>
          <button onClick={handleAnalysis}>
            {showAnalysis
              ? "Close Document Analysis"
              : "View Document Analysis"}
          </button>
          <button
            style={{
              margin: "5%",
              padding: "12px 20px",
              background: isHovered
                ? "linear-gradient(135deg,rgb(204, 151, 167), #6a4caf)"
                : "linear-gradient(135deg, #6a4caf, #c35b7a)",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "10px",
              letterSpacing: "1.5px",
              transition: "all 0.3s ease-in-out",
              cursor: "pointer",
              position: "relative",
              boxShadow: isHovered
                ? "0 0 10px rgba(255, 255, 255, 0.5)"
                : "2px 2px 10px rgba(0, 0, 0, 0.2)",
              transform: isHovered ? "translateY(-2px)" : "none",
              display: "flex",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleProfanity}
          >
            {showProfanity
              ? "Close Profanity Word Replacer"
              : "Profanity Word Replacer"}
          </button>
        </>
      )}
      {errorMessage && <p className="error">{errorMessage}</p>}
      {fileFound ? (
        ""
      ) : (
        <h5 style={{ color: "black" }}>Attach a word file to scan </h5>
      )}
      {!errorMessage && fileFound && showAnalysis && (
        <>
          <div className="result" style={{ marginBottom: "4%" }}>
            <p>
              Title : <strong>{modifiedTitle}</strong>
            </p>
            <p>
              {" "}
              Word Count : <strong>{wordCount}</strong>
            </p>
            <p>
              Character Count : <strong>{titleChar}</strong>
            </p>
          </div>
          <div className="radio-buttons" style={{ marginBottom: "4%" }}>
            <label className="radio">
              <input
                type="radio"
                name="radioGroup"
                value="option1"
                onChange={handleRadioChange}
              />
              All Section Analysis
            </label>
            <label className="radio">
              <input
                type="radio"
                name="radioGroup"
                value="option2"
                onChange={handleRadioChange}
              />
              Specific Section Analysis
            </label>
          </div>
        </>
      )}

      {showResult && showAnalysis && (
        <div className="result">
          <h3 className="section-title">
            Below is the section-wise total word count
          </h3>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Word Count</th>
              </tr>
            </thead>
            <tbody>
              {/\d/.test(crossWord) && (
                <tr>
                  <td>Cross Reference</td>
                  <td>{crossWord}</td>
                </tr>
              )}
              {/\d/.test(fieldWord) && (
                <tr>
                  <td>Technical Field</td>
                  <td>{fieldWord}</td>
                </tr>
              )}
              {/\d/.test(backgroundWord) && (
                <tr>
                  <td>Background</td>
                  <td>{backgroundWord}</td>
                </tr>
              )}
              {/\d/.test(summaryWord) && (
                <tr>
                  <td>Summary</td>
                  <td>{summaryWord}</td>
                </tr>
              )}
              {/\d/.test(drofDraWord) && (
                <tr>
                  <td>Description of Drawing</td>
                  <td>{drofDraWord}</td>
                </tr>
              )}
              <tr>
                <td>Total Number of Figures</td>
                <td>{imgCount}</td>
              </tr>
              {/\d/.test(detaDesWord) && (
                <tr>
                  <td>Detailed Description</td>
                  <td>{detaDesWord}</td>
                </tr>
              )}
              {/\d/.test(claimedWord) && (
                <tr>
                  <td>Claims</td>
                  <td>{claimedWord}</td>
                </tr>
              )}
              {/\d/.test(abstractWord) && (
                <tr
                  className="tooltip-container"
                  onMouseEnter={() => setIsAbstractHovered(true)}
                  onMouseLeave={() => setIsAbstractHovered(false)}
                >
                  <td>Abstract</td>
                  <td className={isAbstractExceeding ? "exceeding" : "normal"}>
                    {abstractWord}
                    {isAbstractExceeding && (
                      <span
                        className={`tooltip ${
                          isAbstractHovered ? "visible" : ""
                        }`}
                      >
                        Maximum 150 words
                      </span>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <button className="summary-button" onClick={handleSummary}>
            {showSummary ? "Close the Summary" : "View Summary"}
          </button>

          <button
            className="paragraph-summary"
            onClick={handleParagraphSummary}
          >
            {showParagraphSummary
              ? "Close the Paragraph count"
              : "View Paragraph Count"}
          </button>

          {showSummary && (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total lines</td>
                  <td>{lineCount}</td>
                </tr>
                <tr>
                  <td>Total word count</td>
                  <td>{wordCount}</td>
                </tr>
                <tr>
                  <td>Total character count</td>
                  <td>{titleChar}</td>
                </tr>
                <tr>
                  <td>Total sentence count</td>
                  <td>{sentenceCount}</td>
                </tr>
              </tbody>
            </table>
          )}

          {showParagraphSummary && (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>Section Name</th>
                  <th>Value</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cross Reference</td>
                  <td>{crossParagraphCount}</td>
                </tr>
                <tr>
                  <td>Summary</td>
                  <td>{summaryParagraphCount}</td>
                </tr>
                <tr>
                  <td>Brief Description of Diagrams</td>
                  <td>{drawingDParagraphCount}</td>
                </tr>
                <tr>
                  <td>Detailed Description</td>
                  <td>{detailedDescriptionPCount}</td>
                </tr>
                <tr>
                  <td>Abstract</td>
                  <td>{abstractPCount}</td>
                </tr>
                <tr>
                  <td>Background</td>
                  <td>{backgroundParagraphCount}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      )}

      {showDrop && showAnalysis && (
        <div>
          <div>
            <details className="custom-dropdown" style={{ marginBottom: "4%", width: "100%" }}>
              <summary onClick={toggleDropdown}>Select Sections</summary>
              {isOpen && (
                <ul className="custom-dropdown-list">
                  {sectionData.map((section, index) => (
                    <li key={index}>
                      <label>
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(section.sName)}
                          onChange={() => toggleCheckbox(section.sName)}
                        />
                        <span style={{ marginLeft: "10px" }}>{section.sName}</span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </details>
          </div>
          <div className="result">
            <div style={{ textDecorationColor: "#0a0909", marginBottom: "2%", fontWeight: "bold" }}>
              Word Count of Selected Sections :
            </div>
            {selectedSections.map((sectionName, index) => {
              const selectedSection = sectionData.find((section) => section.sName === sectionName);
              return (
                <div key={index}>
                  {`${selectedSection.sName} : `}
                  <strong>{selectedSection.sCount}</strong>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {fileFound && !errorMessage && showAnalysis && (
        <div>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: "2%",
            }}
          >
            <div>
              <button onClick={() => setShowFileContent(!showFileContent)}>
                {showFileContent ? "hide" : "view"} Content
              </button>
            </div>
            <div>
              <button onClick={() => setShowClaimContent(!showClaimContent)}>
                {showClaimContent ? "hide" : "view"} Claims
              </button>
            </div>
          </div>
        </div>
      )}

      {showFileContent && showAnalysis && (
        <div className="file-content" style={{ textAlign: "center" }}>
          <h2
            style={{
              color: "black",
              textDecorationColor: "#03e9f4",
            }}
          >
            File Content : {"  " + fileName}
          </h2>
          <p
            style={{
              whiteSpace: "pre-wrap",
              textAlign: "left",
              backgroundColor: "white",
              margin: "0",
              paddingLeft: "20px",
              paddingRight: "20px",
            }}
          >
            File content is processed on the server. Please check section analysis.
          </p>
        </div>
      )}

      {showClaimContent && showAnalysis && (
        <div className="claim-content">
          <h2>Claims</h2>
          <table className="styled-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>word Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Total Cliams</td>
                <td>
                  <strong>{total}</strong>
                </td>
              </tr>
              <tr>
                <td>Independent Claims</td>
                <td>
                  {" "}
                  <strong>{independent}</strong>
                </td>
              </tr>
              <tr>
                <td>Dependent Claims</td>
                <td>
                  {" "}
                  <strong>{dependent}</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <p>
            <button onClick={handleIndependentClaimList}>
              {showIndependentClaim
                ? "Close Independent Claim List Count"
                : "Show Independent Claim List Count"}
            </button>
          </p>
          {showIndependentClaim && (
            <pre style={{ color: "white", backgroundColor: "GrayText" }}>
              {independentClaimLists}
            </pre>
          )}
          <p>
            <button onClick={handleDependentClaimList}>
              {showDependentClaim
                ? "Close Dependent Claim List Count"
                : "Show Dependent Claim List Count"}
            </button>
          </p>
          {showDependentClaim && (
            <pre style={{ color: "white", backgroundColor: "GrayText" }}>
              {dependentClaimLists}
            </pre>
          )}
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
}

export default Analysis;