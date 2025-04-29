import React from "react";
import "./App.css";
import Analysis from "./components/Analysis";
import Mannual from "./components/Mannual";
import { BrowserRouter as Router, Route, Link, Routes, BrowserRouter } from 'react-router-dom';

function App() {
   return(
    <div>
      <BrowserRouter>
      <Routes>
        <Route exact path="/" element={<Analysis />}/>
        <Route exact path="/mannual" element={<Mannual />}/>
      </Routes>
      </BrowserRouter>
    </div>
 );
}
export default App;
