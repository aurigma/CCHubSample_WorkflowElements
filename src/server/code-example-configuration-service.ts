import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse, ParseError, printParseErrorCode } from "jsonc-parser";

export interface CodeExampleConfiguration {
  name: string;
  description: string;
  path: string;
  enabled: boolean;
  params: Record<string, unknown>;
}

export class CodeExampleConfigurationService {
  constructor(private readonly codeExamplesFilePath = path.resolve(process.cwd(), "code-examples.jsonc")) {
  }

  async getEnabledCodeExamples(): Promise<CodeExampleConfiguration[]> {
    const codeExamplesJson = await readFile(this.codeExamplesFilePath, "utf-8");
    const parseErrors: ParseError[] = [];
    const codeExamples = parse(codeExamplesJson, parseErrors) as CodeExampleConfiguration[];

    if (parseErrors.length > 0) {
      const errors = parseErrors
        .map(error => `${printParseErrorCode(error.error)} at offset ${error.offset}`)
        .join(", ");

      throw new Error(`Failed to parse ${this.codeExamplesFilePath}: ${errors}`);
    }

    return codeExamples.filter(codeExample => codeExample.enabled === true);
  }
}
