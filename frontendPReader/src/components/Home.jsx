// // Profanity.jsx
// import React from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import "../Analysis.css"; // Reuse the same CSS for consistent styling

// const BACKEND_URL = import.meta.env.VITE_API_URL;
// console.log("Backend URL:", BACKEND_URL); // Debugging

// function Profanity() {
//   const navigate = useNavigate();

//   const [fileName, setFileName] = useState("Not Selected");

//   //Word Counts
//   const [crossWord, setCrossWord] = useState("Section Not Found");
//   const [fieldWord, setFieldWord] = useState("Section Not found");
//   const [backgroundWord, setBackgroundWord] = useState("Section Not found");
//   const [summaryWord, setSummaryWord] = useState("Section Not found");
//   const [drofDraWord, setDroofDraWord] = useState("Section Not found");
//   const [detaDesWord, setDetaDesWord] = useState("Section Not found");
//   const [claimedWord, setClaimedWord] = useState("Section Not found");
//   const [abstractWord, setAbstractWord] = useState("Section Not found");
//   const [fileContent, setFileContent] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [showFileContent, setShowFileContent] = useState(false);
//   const [modifiedTitle, setModifiedTitle] = useState("Title Not found");
//   const [wordCount, setWordCount] = useState(0);
//   const [imgCount, setImgCount] = useState(0);
//   const [dependent, setdependent] = useState(0);
//   const [independent, setIndependent] = useState(0);
//   const [total, setTotal] = useState(0);
//   const [sentenceCount, setSentenceCount] = useState(0);
//   const [lineCount, setLineCount] = useState(0);
//   const [showClaimContent, setShowClaimContent] = useState(false);
//   const [independentClaimLists, setIndependentClaimLists] = useState("");
//   const [dependentClaimLists, setDependentClaimLists] = useState("");
//   const [selectedSections, setSelectedSections] = useState([]);
//   const [showResult, setShowResult] = useState(false);
//   const [showDrop, setShowDrop] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [sectionData, setSectionData] = useState([]);
//   const [titleChar, setTitleChar] = useState(0);
//   const [showSummary, setShowSummary] = useState(false);
//   const [fileFound, setFileFound] = useState(false);
//   const [showParagraphSummary, setShowParagraphSummary] = useState(false);
//   const [totalWordC, setTotalWordC] = useState(null);

//   // Paragraph counts
//   const [crossParagraphCount, setCrossParagraphCount] = useState(0);
//   const [backgroundParagraphCount, setBackgroundParagraphCount] = useState(0);
//   const [summaryParagraphCount, setSummaryParagraphCount] = useState(0);
//   const [drawingDParagraphCount, setDrawingDParagraphCount] = useState(0);
//   const [detailedDescriptionPCount, setDetailedDescriptionPCount] = useState(0);
//   const [abstractPCount, setAbstractPCount] = useState(0);

//   // State for file input, errors, word counts, matched words, confirmation, and updated file
//   const [file, setFile] = useState(null);
//   const [error, setError] = useState(null);
//   const [wordCounts, setWordCounts] = useState({});
//   const [matchedWords, setMatchedWords] = useState({});
//   const [confirmationNeeded, setConfirmationNeeded] = useState(false);
//   const [updatedFile, setUpdatedFile] = useState(null);
//   const [matchedKeys, setMatchedKeys] = useState([]);
//   const [replacementSelections, setReplacementSelections] = useState({});
//   const [showReplacementSelector, setShowReplacementSelector] = useState(false);
//   const [claimTermCounts, setClaimTermCounts] = useState({});
//   const [showAnalysis, setShowAnalysis] = useState(false);
//   const [showProfanity, setShowProfanity] = useState(false);
//   const [isHovered, setIsHovered] = useState(false);
//   const [isAbstractHovered, setIsAbstractHovered] = useState(false);
//   const [showIndependentClaim, setShowIndependentClaim] = useState(false);
//   const [showDependentClaim, setShowDependentClaim] = useState(false);

//   //Profanity Words Counts
//   const [profanityWordCount, setProfanityWordCount] = useState({});

//   //calculating total word count
//   useEffect(() => {
//     const totalWordCount = [
//       fieldWord,
//       crossWord,
//       summaryWord,
//       abstractWord,
//       backgroundWord,
//       detaDesWord,
//       claimedWord,
//     ];

//     setTotalWordC(() => {
//       const total = totalWordCount.reduce((acc, word) => acc + word, 0);
//       return total;
//     });
//   }, [
//     fieldWord,
//     crossWord,
//     summaryWord,
//     abstractWord,
//     backgroundWord,
//     detaDesWord,
//     claimedWord,
//   ]);

//   // Word limits for sections
//   const abstractWordLimit = 150;
//   const backgroundWordLimit = 500;
//   const summaryWordLimit = 800;

//   // Conditions for exceeding word limits
//   const isAbstractExceeding = abstractWord > abstractWordLimit;

//   // Predefined words and replacements
//   const predefinedWords = {
//     Above: ["Surpassing", "Beyond"],
//     "Adapted For": ["Altered for", "Modified for"],
//     "Adapted To": ["Made adjustments to", "Modified to"],
//     All: ["The total", "Every single"],
//     Always: ["Perpetually", "Invariably"],
//     Allow: ["Permit", "Grant"],
//     Appropriately: ["Accordingly", "Fittingly"],
//     Authoritative: ["Attested", "Authenticated"],
//     Approximate: ["Closer", "Almost"],
//     Around: ["On all sides", "Throughout"],
//     Below: ["Less than", "Lower than"],
//     Big: ["Oversize", "Hefty"],
//     Best: ["Perfect", "Ace", "Incomparable"],
//     Biggest: ["Largest", "Huge"],
//     Bigger: ["Greater", "Heftier"],
//     "Black Hat": ["Cybercriminal", "Cracker"],
//     But: ["Although", "In spite"],
//     "By Necessity": ["Obligatory", "Inescapable"],
//     "Black List": ["Ban list", "Prohibited list"],
//     Broadest: ["Spacious", "Widespread"],
//     Certain: ["Undoubtful", "Assertively"],
//     Certainly: ["Exactly", "Assertively"],
//     "Characterized By": ["Defined by", "Recognised by"],
//     Chief: ["Head", "First"],
//     "Chinese Wall": ["Information Partition", "Ethical barrier"],
//     Compel: ["Enforce", "Urge"],
//     Clearly: ["Noticeably", "Undoubtedly"],
//     Completely: ["To the limit", "Fully"],
//     Compelled: ["Bound", "Forced"],
//     "Composed Of": ["Involving", "Constructed from"],
//     Compelling: ["Forcing"],
//     Every: ["each"],
//   };

//   // Claim-specific terms
//   const claimSpecificTerms = [
//     "at least one",
//     "at least two",
//     "one or more",
//     "plurality of",
//     "wherein",
//   ];

//   let totalWordCount = [];

//   // Handle radio button changes
//   const handleRadioChange = (event) => {
//     const value = event.target.value;
//     if (value === "option1") {
//       setShowResult(true);
//       setShowDrop(false);
//     } else {
//       setShowResult(false);
//       setShowDrop(true);
//     }
//   };

//   // Toggle dropdown
//   const toggleDropdown = () => {
//     setIsOpen(true);
//   };

//   // Handle checkbox toggle for sections
//   const toggleCheckbox = (sectionName) => {
//     if (selectedSections.includes(sectionName)) {
//       setSelectedSections(
//         selectedSections.filter((name) => name !== sectionName)
//       );
//     } else {
//       setSelectedSections([...selectedSections, sectionName]);
//     }
//   };

//   // Handle file upload and send to backend
//   const handleFileChange = async (e) => {
//     const selectedFile = e.target.files[0];
//     if (!selectedFile) {
//       setErrorMessage("Please select a file.");
//       return;
//     }

//     setFile(selectedFile);
//     setFileFound(true);
//     setFileName(selectedFile.name.replace(".docx", ""));
//     setErrorMessage("");
//     setWordCounts({});
//     setMatchedWords({});
//     setConfirmationNeeded(false);
//     setUpdatedFile(null);
//     setError(null);
//     setMatchedKeys([]);
//     setReplacementSelections({});
//     setShowReplacementSelector(false);
//     setClaimTermCounts({});

//     // Send file to backend
//     const formData = new FormData();
//     formData.append("file", selectedFile);

//     try {
//       const response = await fetch(`${BACKEND_URL}/upload`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Error uploading file to server.");
//       }

//       const data = await response.json();
//       console.log("API response", data);

//       // Update state with backend response
//       setFileName(data.fileName);
//       setModifiedTitle(data.modifiedTitle);
//       setTitleChar(data.titleChar);
//       setWordCount(data.wordCount);
//       setSentenceCount(data.sentenceCount);
//       setLineCount(data.lineCount);
//       setCrossWord(data.crossWord);
//       setCrossParagraphCount(data.crossParagraphCount);
//       setFieldWord(data.fieldWord);
//       setBackgroundWord(data.backgroundWord);
//       setBackgroundParagraphCount(data.backgroundParagraphCount);
//       setSummaryWord(data.summaryWord);
//       setSummaryParagraphCount(data.summaryParagraphCount);
//       setDroofDraWord(data.drofDraWord);
//       setDrawingDParagraphCount(data.drawingDParagraphCount);
//       setDetaDesWord(data.detaDesWord);
//       setDetailedDescriptionPCount(data.detailedDescriptionPCount);
//       setClaimedWord(data.claimedWord);
//       setAbstractWord(data.abstractWord);
//       setAbstractPCount(data.abstractPCount);
//       setImgCount(data.imgCount);
//       setTotal(data.total);
//       setIndependent(data.independent);
//       setdependent(data.dependent);
//       setIndependentClaimLists(data.independentClaimLists);
//       setDependentClaimLists(data.dependentClaimLists);
//       setSectionData(data.sectionData);
//       setFileContent(""); // File content is not sent from backend to reduce payload size
//       setProfanityWordCount(data.predefinedWordCounts);

//       // console.log("inside debugger");
//       // const totalWordCount = [fieldWord, crossWord, summaryWord, abstractWord, backgroundWord, detaDesWord, claimedWord];

//       // setTotalWordC(() => {
//       //   const total = totalWordCount.reduce((acc, word) => acc + word, 0);
//       //   return total;
//       // });
//     } catch (error) {
//       setErrorMessage("Error processing the file: " + error.message);
//     }
//   };

//   const goToAnalysis = () => {
//     navigate("/analysis");
//   };

//   const goToProfanity = () => {
//     navigate("/profanity");
//   };

//   return (
//     <div className="App">
//       <h1>Patent Reader Application</h1>
//       <button onClick={goToAnalysis}>Analysis</button>
//       <button onClick={goToProfanity}>Profanity Reporter</button>
//     </div>
//   );
// }

// export default Profanity;
