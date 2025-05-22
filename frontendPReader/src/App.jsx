import React from "react";
import "./App.css";
import Analysis from "./components/Analysis";
import Mannual from "./components/Mannual";
import Profanity from "./components/Profanity";
// import Home from "./components/Home";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Routes,
  BrowserRouter,
} from "react-router-dom";
import { APP_VERSION } from "./version";

function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            {/* <Route path="/" element={<Home />} /> */}
            <Route path="/" element={<Analysis />} />
            <Route path="/profanity" element={<Profanity />} />
            <Route path="/mannual" element={<Mannual />} />
          </Routes>
        </BrowserRouter>
      </div>
      <div className="version">
        <footer style={{ color: "black" }}>Version: {APP_VERSION}</footer>
      </div>
    </>
  );
}
export default App;
