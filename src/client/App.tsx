import "./App.scss";
import { ComponentType, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from "./components/main/Main";
import SimpleEditorBasic from "./code-examples/SimpleEditorBasic";
import HandyEditorBasic from "./code-examples/HandyEditorBasic";
import HandyEditorNoPIM from "./code-examples/HandyEditorNoPIM";
import TemplateEditor from "./code-examples/TemplateEditor";
import HandyEditorContainerColors from "./code-examples/HandyEditorContainerColors";
import SimpleEditorWithPluginApi from "./code-examples/SimpleEditorWithPluginApi";
import UIFramework from "./code-examples/UI-framework";
import { CodeExampleConfig, CodeExamplePageProps } from "./interfaces/server-api";
import { ServerApiService } from "./shared/server-api-service";

const CODE_EXAMPLE_COMPONENTS: Record<string, ComponentType<CodeExamplePageProps>> = {
  "/SimpleEditorBasic": SimpleEditorBasic,
  "/SimpleEditorWithPluginApi": SimpleEditorWithPluginApi,
  "/HandyEditorBasic": HandyEditorBasic,
  "/HandyEditorNoPIM": HandyEditorNoPIM,
  "/HandyEditorContainerColors": HandyEditorContainerColors,
  "/TemplateEditor": TemplateEditor,
  "/UIFramework": UIFramework,
};

function App() {
  const [codeExamples, setCodeExamples] = useState<CodeExampleConfig[]>([]);
  const [isCodeExamplesLoading, setIsCodeExamplesLoading] = useState(true);
  const [codeExamplesLoadingError, setCodeExamplesLoadingError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const codeExamples = await ServerApiService.getCodeExamples();
        setCodeExamples(codeExamples);
      } catch (error) {
        setCodeExamplesLoadingError("Failed to load code examples.");
      } finally {
        setIsCodeExamplesLoading(false);
      }
    })();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main codeExamples={codeExamples} isLoading={isCodeExamplesLoading} error={codeExamplesLoadingError} />} />
        {codeExamples.map((codeExample) => {
          const CodeExampleComponent = CODE_EXAMPLE_COMPONENTS[codeExample.path];

          if (!CodeExampleComponent) {
            return null;
          }

          return (
            <Route
              key={codeExample.path}
              path={codeExample.path}
              element={<CodeExampleComponent codeExample={codeExample} />}
            />
          );
        })}
        <Route path="*" element={<Main codeExamples={codeExamples} isLoading={isCodeExamplesLoading} error={codeExamplesLoadingError} />} />
      </Routes>
    </Router>
  );
}

export default App;
