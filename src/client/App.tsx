import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/main/Main";
import SimpleEditorBasic from "./samples/SimpleEditorBasic";
import HandyEditorBasic from "./samples/HandyEditorBasic";
import HandyEditorNoPIM from "./samples/HandyEditorNoPIM";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/SimpleEditorBasic" element={<SimpleEditorBasic />} />
        <Route path="/HandyEditorBasic" element={<HandyEditorBasic />} />
        <Route path="/HandyEditorNoPIM" element={<HandyEditorNoPIM />} />
      </Routes>
    </Router>
  );
}

export default App;
