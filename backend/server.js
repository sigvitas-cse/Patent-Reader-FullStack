const express = require("express");
const multer = require("multer");
const mammoth = require("mammoth");
const cors = require("cors");
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();
const port = 5000;

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Patent Document Processing API",
      description: "API for processing .docx files and extracting patent-related metadata",
      version: "1.0.0",
    },
    servers: [
      {
        url: "[patent reader API]",
        description: "Local development server",
      },
    ],
  },
  apis: [__filename],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Existing middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads with validation
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only .docx files are allowed"), false);
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
});

// Function to escape special regex characters
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Function to count paragraphs
function countParagraphs(sectionText) {
  // First, try counting paragraph numbers ([0001], [0002], etc.)
  const paragraphNumbers = sectionText.match(/\[\d+\]/g);
  if (paragraphNumbers && paragraphNumbers.length > 0) {
    return paragraphNumbers.length;
  }
  // Fallback: Split by two or more newlines for paragraphs
  return sectionText
    .replace(/\n{2,}/g, "\n\n") // Normalize multiple newlines
    .split("\n\n")
    .filter((para) => para.trim() !== "").length;
}

// Endpoint with JSDoc for Swagger documentation
/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload and process a .docx file
 *     description: Accepts a .docx file and extracts metadata such as title, word counts, and section details.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The .docx file to process (max 10MB)
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: Successful response with extracted metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 fileName:
 *                   type: string
 *                 modifiedTitle:
 *                   type: string
 *                 titleChar:
 *                   type: integer
 *                 wordCount:
 *                   type: integer
 *                 sentenceCount:
 *                   type: integer
 *                 lineCount:
 *                   type: integer
 *                 crossWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 crossParagraphCount:
 *                   type: integer
 *                 fieldWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 backgroundWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 backgroundParagraphCount:
 *                   type: integer
 *                 summaryWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 summaryParagraphCount:
 *                   type: integer
 *                 drofDraWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 drawingDParagraphCount:
 *                   type: integer
 *                 detaDesWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 detailedDescriptionPCount:
 *                   type: integer
 *                 claimedWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 abstractWord:
 *                   oneOf:
 *                     - type: integer
 *                     - type: string
 *                 abstractPCount:
 *                   type: integer
 *                 imgCount:
 *                   type: integer
 *                 total:
 *                   type: integer
 *                 independent:
 *                   type: integer
 *                 dependent:
 *                   type: integer
 *                 independentClaimLists:
 *                   type: string
 *                 dependentClaimLists:
 *                   type: string
 *                 sectionData:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       sName:
 *                         type: string
 *                       sCount:
 *                         type: integer
 *                       sChar:
 *                         type: integer
 *                       sSent:
 *                         type: integer
 *                       sLine:
 *                         type: integer
 *                       sParagraphCount:
 *                         type: integer
 *       400:
 *         description: Bad request (e.g., invalid file type or empty file)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Server error during file processing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 */
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Check if file is present
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: "No file uploaded or file is empty." });
    }

    // Validate file size
    if (req.file.size === 0) {
      return res.status(400).json({ error: "Uploaded file is empty." });
    }

    const fileName = req.file.originalname.replace(".docx", "");
    const buffer = req.file.buffer;

    // Extract text using mammoth
    const result = await mammoth.extractRawText({ buffer: req.file.buffer });
    const text = result.value;

    // Validate extracted text
    if (!text || text.trim() === "") {
      return res.status(400).json({ error: "No text could be extracted from the file." });
    }

    // Initialize response data
    const responseData = {
      fileName,
      modifiedTitle: "Title Not found",
      titleChar: 0,
      wordCount: 0,
      sentenceCount: text.split(".").length,
      lineCount: text
        .replace(/\n+/g, "\n")
        .split("\n")
        .filter((line) => line.trim() !== "").length,
      crossWord: "Section Not Found",
      crossParagraphCount: 0,
      fieldWord: "Section Not Found",
      backgroundWord: "Section Not Found",
      backgroundParagraphCount: 0,
      summaryWord: "Section Not Found",
      summaryParagraphCount: 0,
      drofDraWord: "Section Not Found",
      drawingDParagraphCount: 0,
      detaDesWord: "Section Not Found",
      detailedDescriptionPCount: 0,
      claimedWord: "Section Not Found",
      abstractWord: "Section Not found",
      abstractPCount: 0,
      imgCount: 0,
      total: 0,
      independent: 0,
      dependent: 0,
      independentClaimLists: "",
      dependentClaimLists: "",
      sectionData: [],
    };

    // Extract title
    const titleRegx =
      /([\s\S]*?)(cross-reference to related application|CROSS|Cross|technical|CROSS REFERENCE TO RELATED APPLICATIONS|What is claimed is|Claims|CLAIMS|WHAT IS CLAIMED IS|abstract|ABSTRACT|Cross-reference to related application|CROSS-REFERENCE TO RELATED APPLICATION|field|background|summary|description of the drawing|$)/i;
    const titlesec = titleRegx.exec(text);
    let titlename = titlesec ? titlesec[1].replace(/\[\d+\]/g, "") : "";

    const titleMatch = text.match(
      /\(54\)\s*([\s\S]+?)(?=\(\d+\)|References Cited|U\.S\. PATENT DOCUMENTS|DIFFERENT ROUGHNESS|$)/i
    );
    if (titleMatch) {
      titlename = titleMatch[1].trim();
    }

    const wordss = titlename.split(/\s+/).filter(Boolean);
    const chars = titlename.replace(/\s/g, "");
    responseData.modifiedTitle = titlename;
    responseData.wordCount = wordss.length;
    responseData.titleChar = chars.length;

    // Extract Cross-Reference section
    const crossregex =
      /(?:CROSS-REFERENCE TO RELATED APPLICATION|CROSS-REFERENCE TO RELATED APPLICATIONS|CROSS REFERENCE TO RELATED APPLICATION|Cross-reference to related application|Cross-Reference To Related Application|Related Applications)([\s\S]*?)(?:TECHNICAL FIELD|FIELD|Field|Background|BACKGROUND|Summary|SUMMARY|DESCRIPTION OF (?: THE) DRAWING|Description Of(?: The)? Drawing|DETAILED DESCRIPTION|WHAT IS CLAIMED IS|ABSTRACT|$)/i;
    const crosssec = crossregex.exec(text);
    if (crosssec) {
      let crosssection = crosssec[1].replace(/^\s*[A-Za-z]?\s*\n*/, "").trim();
      responseData.crossParagraphCount = countParagraphs(crosssection);
      const filteredContent = crosssection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(Boolean);
      responseData.crossWord = words.length;
    }

    // Extract Field section
    const fieldregex =
      /(?:FIELD|TECHNICAL FIELD|FIELD OF THE INVENTION|Field|Technical Field)([\s\S]*?)(?:BACKGROUND|Background|BRIEF DESCRIPTION OF THE INVENTION|Summary|SUMMARY|DESCRIPTION OF (?: THE) DRAWING|Description of (?: the) Drawing|DETAILED DESCRIPTION|detailed description|What is claimed is|CLAIMS|Abstract|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|$)/i;
    const fieldsec = fieldregex.exec(text);
    if (fieldsec) {
      const fieldsection = fieldsec[1];
      const filteredContent = fieldsection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      const fieldCharCount = filteredContent.replace(/\s/g, "").length;
      const fieldSentCount = filteredContent.split(".").length;
      const fieldlineCount = filteredContent
        .split("\n")
        .filter((line) => line.trim() !== "").length;
      responseData.fieldWord = words.length;
      responseData.sectionData.push({
        sName: fieldsec[0].match(/^(.*?)(?=\n|$)/)[1].trim(),
        sCount: words.length,
        sChar: fieldCharCount,
        sSent: fieldSentCount,
        sLine: fieldlineCount,
        sParagraphCount: countParagraphs(fieldsection),
      });
    }

    // Extract Background section
    const backgrdregex =
      /(?:background|background of the invention)([\s\S]*?)(?:summary|brief description of the invention|description of (?: the) drawings|detailed description|what is claimed is|abstract|cross-reference to related application|field|$)/i;
    const backgrdsec = backgrdregex.exec(text);
    if (backgrdsec) {
      const backgrdsection = backgrdsec[1];
      const filteredContent = backgrdsection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      responseData.backgroundWord = words.length;
      responseData.backgroundParagraphCount = countParagraphs(backgrdsection);
      const ba = backgrdsec[0].match(/^(.*?)(?=\n|$)/);
      const ba1 = ba[1].trim();
      responseData.sectionData.push({
        sName: ba1,
        sCount: words.length,
        sParagraphCount: countParagraphs(backgrdsection),
      });
    }

    // Extract Summary section
    const summregex =
      /(?:SUMMARY|BRIEF DESCRIPTION OF THE INVENTION|BRIEF SUMMARY)([\s\S]*?)(?:DESCRIPTION OF (?: THE)? DRAWINGS|BRIEF DESCRIPTION OF DRAWINGS|detailed description|what is claimed is|claims|abstract|cross-reference to related application|field|background|$)/i;
    const summsec = summregex.exec(text);
    if (summsec) {
      const summsection = summsec[1];
      const filteredContent = summsection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      responseData.summaryWord = words.length;
      responseData.summaryParagraphCount = countParagraphs(summsection);
      const su = summsec[0].match(/^(.*?)(?=\n|$)/);
      const su1 = su[1].trim();
      responseData.sectionData.push({
        sName: su1,
        sCount: words.length,
        sParagraphCount: countParagraphs(summsection),
      });
    }

    // Extract Description of Drawings section
    const dodregex =
      /(?:Description of(?: the)? Drawings|DESCRIPTION OF(?: THE)? DRAWINGS)([\s\S]*?)(?:DETAILED DESCRIPTION|\nDetailed Description|DESCRIPTION OF EMBODIMENTS|DESCRIPTION OF IMPLEMENTATIONS|DETAILED DESCRIPTION OF SPECIFIC EMBODIMENTS|What is claimed is|CLAIMS|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|BACKGROUND|SUMMARY|BRIEF DESCRIPTION THE INVENTION|$)/i;
    const dodsec = dodregex.exec(text);
    if (dodsec) {
      const dodsection = dodsec[1];
      const filteredContent = dodsection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      responseData.drofDraWord = words.length;
      responseData.drawingDParagraphCount = countParagraphs(dodsection);
      const dd = dodsec[0].match(/^(.*?)(?=\n|$)/);
      const dd1 = dd[1].trim();
      responseData.sectionData.push({
        sName: dd1,
        sCount: words.length,
        sParagraphCount: countParagraphs(dodsection),
      });
    }

    // Extract Detailed Description
    const detDesregex =
      /(DETAILED DESCRIPTION\s*)([\s\S]*?)(?=\s*(WHAT IS CLAIMED IS|CLAIMS\s*\d+|$))/gi;
    const detDessec = detDesregex.exec(text);
    if (detDessec) {
      const detDessection = detDessec[2];
      const filteredContent = detDessection
        .replace(/\[\d+\]\s*/g, "")
        .replace(/\b\d+\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
      const words = filteredContent
        .split(/[\s\u200B-\u200D\uFEFF]+/)
        .filter((word) => word.length > 0 && !/^\d+$/.test(word));
      responseData.detaDesWord = words.length;
      responseData.detailedDescriptionPCount = countParagraphs(detDessection);
      responseData.sectionData.push({
        sName: "DETAILED DESCRIPTION",
        sCount: words.length,
        sParagraphCount: countParagraphs(detDessection),
      });
    }

    // Extract Claims section
    const claimregex =
      /(?:What is claimed is|WHAT IS CLAIMED IS)([\s\S]*?)(?:\babstract\b|\bABSTRACT\b|\bABSTRACT OF THE DISCLOSURE\b|Related Applications|Cross-reference to related application|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|Field|BACKGROUND|SUMMARY|$)/i;
    const claimsec = claimregex.exec(text);
    if (claimsec) {
      const claimsection = claimsec[1].replace(/what is claimed is:/i, "");
      const linesa = claimsection
        .split(/(?<=\.)\s+/)
        .filter((line) => line.includes("."));
      const filteredLines = linesa.filter(
        (line) =>
          line.trim().length >= 40 &&
          !/^\s*[\d\n\t\s]+\.?$|^:\s*\n{1,10}CLAIMS\s*\n{1,10}1\./.test(line)
      );

      let independentClaimCount = 0;
      let dependentClaimCount = 0;
      const independentClaims = [];
      const dependentClaims = [];

      for (let i = 0; i < filteredLines.length; i++) {
        const line = filteredLines[i];
        const words = line.split(/\s+/).filter(Boolean);
        const wordCount = words.length - 1;
        if (/claim\s+\d+/i.test(line)) {
          dependentClaims.push(`claim ${i + 1} - ${wordCount} words`);
          dependentClaimCount++;
        } else {
          independentClaims.push(`claim ${i + 1} - ${wordCount} words`);
          independentClaimCount++;
        }
      }

      responseData.total = filteredLines.length;
      responseData.independent = independentClaimCount;
      responseData.dependent = dependentClaimCount;
      responseData.independentClaimLists = independentClaims.join("\n");
      responseData.dependentClaimLists = dependentClaims.join("\n");

      const filteredContent = claimsection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      responseData.claimedWord = words.length;
      const cl = claimsec[0].match(/^(.*?)(?=\n|$)/);
      const cl1 = cl[1].trim();
      responseData.sectionData.push({ sName: cl1, sCount: words.length });
    }

    // Extract Abstract section
    const abstractregex =
      /(?: Abstract|ABSTRACT|Abstract of the Disclosure)\s*([\s\S]*?)(?:What is claimed is|Claims|CLAIMS|CROSS-REFERENCE |cross-reference to related application|field|background|summary|description of the drawing|$)/i;
    const abssec = abstractregex.exec(text);
    if (abssec) {
      let abssection = abssec[1].trim();
      const unwantedWords = ["OF", "THE", "DISCLOSURE"];
      abssection = abssection
        .split(/\s+/)
        .filter(
          (word, index) =>
            index >= 3 || !unwantedWords.includes(word.toUpperCase())
        )
        .join(" ");
      const filteredContent = abssection.replace(
        /\[\d+\]|\b(?:[1-4]|[6-9])?\d{1,}(?:(?<!\[\d+)\b5\b)?\b/g,
        ""
      );
      const words = filteredContent.split(/\s+/).filter(Boolean);
      responseData.abstractWord = words.length;
      responseData.abstractPCount = countParagraphs(abssection);
      const ab = abssec[0].match(/^(.*?)(?=\n|$)/);
      const ab1 = ab ? ab[1].trim() : "Abstract";
      responseData.sectionData.push({
        sName: ab1,
        sCount: words.length,
        sParagraphCount: countParagraphs(abssection),
      });
    }

    // Count figures
    const figRegex =
      /(?:Description of(?: the)? Drawings|DESCRIPTION OF(?: THE)? DRAWINGS)([\s\S]*?)(?:DETAILED DESCRIPTION|\nDetailed Description|DESCRIPTION OF EMBODIMENTS|DESCRIPTION OF IMPLEMENTATIONS|DETAILED DESCRIPTION OF SPECIFIC EMBODIMENTS|What is claimed is|CLAIMS|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|BACKGROUND|SUMMARY|BRIEF DESCRIPTION THE INVENTION|$)/i;
    const descriptionMatches = figRegex.exec(text);
    if (descriptionMatches) {
      const descriptionText = descriptionMatches[1];
      const imageRegex1 =
        /(?:FIG(?:URE)?)\.?[-\s]?(?:\d+|[IVXLCDM]+)[A-Z]?(?:\([F\w\s]+\))?\b/gi;
      const matches = descriptionText.match(imageRegex1);
      const uniqueMatches = [...new Set(matches || [])];
      const matchesWithoutanyWord = uniqueMatches.filter(
        (match) => !/\bfigured\b/i.test(match) && !/\bfiguring\b/i.test(match)
      );
      const Rx1 = matchesWithoutanyWord.length;

      const figsRomanRegex =
        /FIGS(?:URES?)?\.\s(?:\d+|[IVXLCDM]+)(?:[A-Za-z]?(?:\sAND\s(?:\d+|[IVXLCDM]+)[A-Za-z]?)+)?/i;
      const matches2 = descriptionText.match(figsRomanRegex);
      const unique = [...new Set(matches2 || [])];
      const Rx2 = unique.length * 2;
      responseData.imgCount = Rx1 + Rx2;
    }

    // Send response
    res.json(responseData);
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ error: `Error processing the .docx file: ${error.message}` });
  }
});

// Error handling middleware for multer errors
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Multer error: ${err.message}` });
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:5000`);
  console.log(`Swagger UI available at http://localhost:5000/api-docs`);
});

