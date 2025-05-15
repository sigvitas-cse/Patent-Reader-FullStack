// Profanity.jsx
import react from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../Analysis.css";
import { useState } from "react";

function Profanity() {
  const [viewContent, setViewContent] = useState(false);
  const { state } = useLocation(); // Get data passed via navigation
  const navigate = useNavigate();
  const { profanityWordCount, fileFound, viewHighlighted } = state || {}; // Destructure the passed state

  // If no data is passed or file is not found, show a message
  if (!fileFound || !profanityWordCount) {
    return (
      <div className="App">
        <h1>Profanity Reporter</h1>
        <p>
          No file uploaded or profanity data available. Please upload a file in
          the Analysis page.
        </p>
        <button onClick={() => navigate("/")}>Back to Analysis</button>
      </div>
    );
  }

  const handleHighlightedContent = () => {
    setViewContent((prevValue) => !prevValue);
  };

  return (
    <div className="App">
      <h1>Profanity Reporter</h1>
      <button style={{ marginBottom: "20px" }} onClick={() => navigate("/")}>
        Back to Analysis
      </button>
      <button onClick={handleHighlightedContent}>
        {viewContent ? "Close Content" : "View Content"}
      </button>
      <div>
        <table className="styled-table">
          <thead>
            <tr>
              <th>Word</th>
              <th>Occurrence</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(profanityWordCount).map(([word, count], index) => (
              <tr key={index}>
                <td>{word}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {viewContent && (<div
          style={{ backgroundColor: "white", color: "black"}}
          dangerouslySetInnerHTML={{ __html: viewHighlighted }}
        />)}
      </div>
    </div>
  );
}

export default Profanity;
