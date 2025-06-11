import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/main/Main";
import SimpleEditorBasic from "./samples/SimpleEditorBasic";
import HandyEditorBasic from "./samples/HandyEditorBasic";
import HandyEditorNoPIM from "./samples/HandyEditorNoPIM";
import TemplateEditor from "./samples/TemplateEditor";
import SimpleEditorWithPluginApi from "./samples/SimpleEditorWithPluginApi";


function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/SimpleEditorBasic" element={<SimpleEditorBasic />} />
        <Route path="/SimpleEditorWithPluginApi" element={<SimpleEditorWithPluginApi />} />
        <Route path="/HandyEditorBasic" element={<HandyEditorBasic />} />
        <Route path="/HandyEditorNoPIM" element={<HandyEditorNoPIM />} />
        <Route path="/TemplateEditor" element={<TemplateEditor />} />
      </Routes>
    </Router>
  );
}

export default App;
