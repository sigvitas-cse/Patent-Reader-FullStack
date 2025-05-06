import React, { useState } from "react";
import "../Analysis.css";
import mammoth from "mammoth";
import { useNavigate } from "react-router-dom";

const Mannual = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [fileName, setFileName] = useState("Not Selected");
  const [inputValues, setInputValues] = useState([""]);
  const [text, setText] = useState("");
  const [Mtitle, setMtitle] = useState("");
  const [MtitleCount, setMtitleCount] = useState(0);
  const [section, setSection] = useState([]);
  const [mLines, setMlines] = useState(0);
  const [mWords, setMwords] = useState(0);
  const [mChar, setMchar] = useState(0);
  const [mSentence, setMsentence] = useState(0);
  const [mFigure, setMfigure] = useState(0);
  const [showMfileContent, setShowMfileContent] = useState(false);
  const [showMclaimContent, setShowMclaimContent] = useState(false);
  const [mFileContent, setMfileContent] = useState("");
  const [mTotal, setMtotal] = useState(0);
  const [mIndependent, setMindependent] = useState(0);
  const [mDependent, setMdependent] = useState(0);
  const [mIndependetClaimList, setMindependentClaimList] = useState("");
  const [mDependentClaimList, setMdependentClaimList] = useState("");
  const [mTitleChar, setMtitleChar] = useState(0);

  //to handle user inputs
  const handleInputChange = (index, value) => {
    const updatedValues = [...inputValues];
    updatedValues[index] = value;
    setInputValues(updatedValues);
  };
  // to add new inputs to array
  const handleAddInput = () => {
    setInputValues([...inputValues, ""]);
  };
  //function to hide the form
  const hideForm = () => {
    const formhide = document.getElementById("formContainer");
    formhide.style.display = "none";
  };
  // to handle the submit function
  const handleSubmit = (event) => {
    ;
    event.preventDefault();
    const trimmedValues = inputValues.map((value) => value.trim());

    if (inputValues.length < 1) {
      console.log("At least one section title is required.");
      return;
    }
    //array to store the sections titles

    let totalWordsCounts = [];
    const MtitleR = new RegExp(`([\\s\\S]*?)${trimmedValues[0]}`, "i");
    const MtitleSec = MtitleR.exec(text);
    if (MtitleSec) {
      const MtitleNames = MtitleSec[1];
      const MtitleName = MtitleNames.replace(/\[\d+\]/g, "");
      const mwordss = MtitleName.split(/\s+/).filter(Boolean);
      const mtitle = MtitleName.replace(/\s/g, "");
      setMtitleChar(mtitle.length);
      setMtitle(MtitleName);
      setMtitleCount(mwordss.length);
    }
    setMsentence(text.split(".").length);
    setMlines(text.split("\n").length);
    setMchar(text.replace(/\s/g, "").length);
    setMwords(text.split(/\s+/).filter(Boolean).length);

    for (let i = 0; i < trimmedValues.length; i++) {
      const currentSectionTitle = trimmedValues[i];
      const nextSectionTitle = trimmedValues[i + 1];

      const Mregex = new RegExp(
        `\\b${currentSectionTitle}\\b([\\s\\S]*?)(\\b${nextSectionTitle}\\b|TECHNICAL FIELD|FIELD|BACKGROUND|SUMMARY|BRIEF DESCRIPTION OF(?: THE)? DRAWINGS|DETAILED DESCRIPTION|CLAIMS|ABSTRACT|$)`


      );
      const sectionSec = Mregex.exec(text);
      if (sectionSec) {
        const sectionText = sectionSec[1];
        const filterSectionText = sectionText.replace(
          /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
          ""
        );
        const wordsForSection = filterSectionText.split(/\s+/).filter(Boolean);
        const MwordCount = wordsForSection.length;
        
        totalWordsCounts.push({
          sectionTitle: currentSectionTitle,
          wordCount: MwordCount,
          sectionWords: sectionText,
        });
        setSection(totalWordsCounts);

        const drawingWord = new RegExp("drawing", "i");
        totalWordsCounts.forEach(item => {
          if (drawingWord.test(item.sectionTitle)) {
            const drwingSection = item.sectionWords
            const imageRegex1 =
              /(?:FIG(?:URE)?)\.?[-\s]?(?:\d+|[IVXLCDM]+)[A-Z]?(?:\([\w\s]+\))?\b/gi;
            const matches = drwingSection.match(imageRegex1);
            const uniqueMatches = [...new Set(matches)];
            ;
            const matchesWithoutanyWord = uniqueMatches.filter(
              (match) =>
                !/\bfigured\b/i.test(match) && !/\bfiguring\b/i.test(match)
            );

            console.log("aa", matchesWithoutanyWord);
            const Rx1 = matchesWithoutanyWord.length;

            const figsRomanRegex =
              /FIGS(?:URES?)?\.\s(?:\d+|[IVXLCDM]+)(?:[A-Za-z]?(?:\sAND\s(?:\d+|[IVXLCDM]+)[A-Za-z]?)+)?/i;

            const matches2 = drwingSection.match(figsRomanRegex);
            const unique = [...new Set(matches2)];
            console.log("aaa", unique);
            const Rx2 = unique.length * 2;
            const totalFigs = Rx1 + Rx2;
            setMfigure(totalFigs);
          }
        })


        const claimWord = new RegExp("claim", "i");

        totalWordsCounts.forEach(item => {
          
          if (claimWord.test(item.sectionTitle)) {
            const claimsection = item.sectionWords
            const claimsection1 = claimsection.replace(
              /what is claimedis:/i, ""
            )

            console.log("claimssection", claimsection)

            const linesa = claimsection1
              .split(/(?<=\.)\s+/)
              .filter((line) => line.includes("."));
            const filteredLines = linesa.filter(
              (line) =>
                line.trim().length >= 40 &&
                !/^\s*[\d\n\t\s]+\.?$|^:\s*\n{1,10}CLAIMS\s*\n{1,10}1\./.test(
                  line
                )
            );

            console.log("claims", linesa);
            console.log("claims1", filteredLines);

            let independentClaimCount = 0;
            let dependentClaimCount = 0;
            const independentClaims = [];
            const dependentClaims = [];

            for (let i = 0; i < filteredLines.length; i++) {
              const line = filteredLines[i];
              const words = line.split(/\s+/).filter(Boolean);
              const wordCount = words.length;
              if (/claim\s+(\d+)/i.test(line)) {
                dependentClaims.push(`claim ${i + 1} - ${wordCount} words`);
                dependentClaimCount++;
              } else {
                independentClaims.push(`claim ${i + 1} - ${wordCount} words`);
                independentClaimCount++;
              }
            }

            setMtotal(filteredLines.length);
            setMindependent(independentClaimCount);
            setMdependent(dependentClaimCount);
            setMindependentClaimList(independentClaims.join("\n"));
            setMdependentClaimList(dependentClaims.join("\n "));

          }
        })
      } else {
        setErrorMessage(`Section title not found: ${currentSectionTitle}`);
      }
    }
    hideForm();
  };

  const handleMannualFileChange = async (e) => {
    const file = e.target.files[0];
    const fileWithdep = e.target.files[0].name;
    const filename = fileWithdep.replace(".docx", "");
    setFileName(filename);
    if (!file) {
      setErrorMessage("Please select a file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target.result;
      try {
        ;
        const result = await mammoth.extractRawText({ arrayBuffer: content });
        setText(result.value);
        setMfileContent(result.value);

        console.log("manual", text);
      } catch (error) {
        setErrorMessage("Error reading the .docx file.");
      }
    };

    reader.onerror = () => {
      setErrorMessage("Error reading the file.");
    };

    reader.readAsArrayBuffer(file);
  };
  return (
    <div className="App">
      <div
        // style={{
        //   letterSpacing: 0,
        //   top: "20px",
        //   width: "100%",
        //   backgroundColor: "white",
        //   color: "white",
        //   padding: "20px",
        //   textAlign: "center",
        //   textDecorationColor: "#03e9f4",
        // }}
      >
        <h1>Patent Reader</h1>
      </div>
      <button onClick={() => navigate("/")}>Go Back</button>

      <input type="file" onChange={handleMannualFileChange} />
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form
        onSubmit={handleSubmit}
        className="formContainer"
        id="formContainer"
      >
        {inputValues.map((value, index) => (
          <div key={index} className="formFields">
            <label className="inputLable" htmlFor={`input-${index}`}>
              Enter section {index + 1} :{" "}
            </label>
            <input
              className="inputFields"
              type="text"
              id={`input-${index}`}
              value={value}
              required
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
          </div>
        ))}
        <div className="buttonContainer">
          <button
            type="button"
            onClick={handleAddInput}
            className="smallButton"
          >
            Add
          </button>
          <button type="submit" className="smallButton">
            Submit
          </button>
        </div>
      </form>
      <div className="result">
        <p>Title: {Mtitle}</p>
        <p> Word Count :{MtitleCount}</p>
        <p>Character Count :{mTitleChar}</p>
      </div>
      <div className="result">
        <p>
          {section.map((item) => (
            <div key={item.sectionTitle}>
              {`${item.sectionTitle}:`} <strong>{item.wordCount}</strong>
            </div>
          ))}
        </p>
        <p> Total Number of Figures: <strong>{mFigure}</strong></p>
        <p> Total Lines: <strong>{mLines}</strong></p>
        <p> Total Words: <strong>{mWords}</strong></p>
        <p> Total Characters:<strong>{mChar}</strong></p>
        <p> Total Sentence:<strong>{mSentence}</strong></p>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "2%",
        }}
      >
        <div>
          <button onClick={() => setShowMfileContent(!showMfileContent)}>
            {showMfileContent ? "hide" : "view"} content
          </button>
        </div>
        <div>
          <button onClick={() => setShowMclaimContent(!showMclaimContent)}>
            {showMclaimContent ? "hide" : "view"} Claims
          </button>
        </div>
      </div>
      {showMfileContent && (
        <div className="file-content" style={{ textAlign: "center" }}>
          <h2
            style={{
              color: "white",
              textDecoration: "underline",
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
            }}
          >
            {mFileContent
              .split("\n")
              .reduce((acc, line) => {
                const trimmedLine = line.trim();
                const modifiedLine = trimmedLine.replace(
                  /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
                  ""
                );
                if (modifiedLine) {
                  acc.push(modifiedLine);
                } else if (!acc[acc.length - 1]) {
                  return acc;
                } else {
                  acc.push("");
                }
                return acc;
              }, [])
              .join("\n")}
          </p>
        </div>
      )}
      {showMclaimContent && (
        <div className="claim-content">
          <h2>CLAIMS:</h2>
          <p>Total Claims :{mTotal}</p>
          <p>Independent Claims :{mIndependent}</p>
          <p>Dependent Claims :{mDependent}</p>
          <p>
            <b>Independent Claims:</b>
          </p>
          <pre>{mIndependetClaimList}</pre>
          <p>
            <b>Dependent Claims:</b>
          </p>
          <pre>{mDependentClaimList}</pre>
        </div>
      )}

    </div>
  );
};

export default Mannual;
