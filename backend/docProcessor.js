const mammoth = require('mammoth');
const { escapeRegExp, cleanText, countWords, countParagraphs } = require('./utils');

// Function to process the document
async function processDocument(buffer, fileName) {
  // Extract text using mammoth
  console.log('Buffer length:', buffer.length); // Debug buffer
  const result = await mammoth.extractRawText({ buffer: buffer });
  console.log('Mammoth result:', result); // Debug result
  let text = result.value;

  // Validate and ensure text is a string
  if (!text || typeof text !== 'string') {
    throw new Error('No valid text could be extracted from the file.');
  }
  text = text.toString(); // Ensure text is a string

  // Initialize response data
  const responseData = {
    fileName,
    modifiedTitle: 'Title Not found',
    titleChar: 0,
    wordCount: 0,
    sentenceCount: text.split('.').length,
    lineCount: text.replace(/\n+/g, '\n').split('\n').filter(line => line.trim() !== '').length,
    crossWord: 'Section Not Found',
    crossParagraphCount: 0,
    fieldWord: 'Section Not Found',
    backgroundWord: 'Section Not Found',
    backgroundParagraphCount: 0,
    summaryWord: 'Section Not Found',
    summaryParagraphCount: 0,
    drofDraWord: 'Section Not Found',
    drawingDParagraphCount: 0,
    detaDesWord: 'Section Not Found',
    detailedDescriptionPCount: 0,
    claimedWord: 'Section Not Found',
    abstractWord: 'Section Not Found',
    abstractPCount: 0,
    imgCount: 0,
    total: 0,
    independent: 0,
    dependent: 0,
    independentClaimLists: '',
    dependentClaimLists: '',
    sectionData: [],
  };

  // Define regex patterns
  const titleRegx = /([\s\S]*?)(cross-reference to related application|CROSS|Cross|technical|CROSS REFERENCE TO RELATED APPLICATIONS|What is claimed is|Claims|CLAIMS|WHAT IS CLAIMED IS|abstract|ABSTRACT|Cross-reference to related application|CROSS-REFERENCE TO RELATED APPLICATION|field|background|summary|description of the drawing|$)/i;
  const crossregex = /(?:CROSS-REFERENCE TO RELATED APPLICATION|CROSS-REFERENCE TO RELATED APPLICATIONS|CROSS REFERENCE TO RELATED APPLICATION|Cross-reference to related application|Cross-Reference To Related Application|Related Applications)([\s\S]*?)(?:TECHNICAL FIELD|FIELD|Field|Background|BACKGROUND|Summary|SUMMARY|DESCRIPTION OF (?: THE) DRAWING|Description Of(?: The)? Drawing|DETAILED DESCRIPTION|WHAT IS CLAIMED IS|ABSTRACT|$)/i;
  const fieldregex = /(?:FIELD|TECHNICAL FIELD|FIELD OF THE INVENTION|Field|Technical Field)([\s\S]*?)(?:BACKGROUND|Background|BRIEF DESCRIPTION OF THE INVENTION|Summary|SUMMARY|DESCRIPTION OF (?: THE) DRAWING|Description of (?: the) Drawing|DETAILED DESCRIPTION|detailed description|What is claimed is|CLAIMS|Abstract|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|$)/i;
  const backgrdregex = /(?:background|background of the invention)([\s\S]*?)(?:summary|brief description of the invention|description of (?: the) drawings|detailed description|what is claimed is|abstract|cross-reference to related application|field|$)/i;
  const summregex = /(?:SUMMARY|BRIEF DESCRIPTION OF THE INVENTION|BRIEF SUMMARY)([\s\S]*?)(?:DESCRIPTION OF (?: THE)? DRAWINGS|BRIEF DESCRIPTION OF DRAWINGS|detailed description|what is claimed is|claims|abstract|cross-reference to related application|field|background|$)/i;
  const dodregex = /(?:Description of(?: the)? Drawings|DESCRIPTION OF(?: THE)? DRAWINGS)([\s\S]*?)(?:DETAILED DESCRIPTION|\nDetailed Description|DESCRIPTION OF EMBODIMENTS|DESCRIPTION OF IMPLEMENTATIONS|DETAILED DESCRIPTION OF SPECIFIC EMBODIMENTS|What is claimed is|CLAIMS|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|BACKGROUND|SUMMARY|BRIEF DESCRIPTION THE INVENTION|$)/i;
  const detDesregex = /(?:\nDetailed Description|DETAILED DESCRIPTION|DESCRIPTION OF EMBODIMENTS|DESCRIPTION OF IMPLEMENTATIONS|DETAILED DESCRIPTION OF SPECIFIC EMBODIMENTS)([\s\S]*?)(?:What is claimed is|Claims|WHAT IS CLAIMED IS|CLAIMS|abstract|ABSTRACT|Cross-reference to related application|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|BACKGROUND|SUMMARY|$)/i;
  const claimregex = /(?:What is claimed is|Claims|CLAIMS|WHAT IS CLAIMED IS)([\s\S]*?)(?:\babstract\b|\bABSTRACT\b|\bABSTRACT OF THE DISCLOSURE\b|Related Applications|Cross-reference to related application|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|Field|BACKGROUND|SUMMARY|$)/i;
  const abstractregex = /(?: Abstract|ABSTRACT|Abstract of the Disclosure)\s*([\s\S]*?)(?:What is claimed is|Claims|CLAIMS|CROSS-REFERENCE |cross-reference to related application|field|background|summary|description of the drawing|$)/i;
  const figRegex = /(?:Description of(?: the)? Drawings|DESCRIPTION OF(?: THE)? DRAWINGS)([\s\S]*?)(?:DETAILED DESCRIPTION|\nDetailed Description|DESCRIPTION OF EMBODIMENTS|DESCRIPTION OF IMPLEMENTATIONS|DETAILED DESCRIPTION OF SPECIFIC EMBODIMENTS|What is claimed is|CLAIMS|ABSTRACT|CROSS-REFERENCE TO RELATED APPLICATION|FIELD|BACKGROUND|SUMMARY|BRIEF DESCRIPTION THE INVENTION|$)/i;

  // Extract title
  let titlename = '';
  let titlesec = titleRegx.exec(text);
  if (titlesec) {
    titlename = titlesec[1].replace(/\[\d+\]/g, '');
  }
  const titleMatch = text.match(/\(54\)\s*([\s\S]+?)(?=\(\d+\)|References Cited|U\.S\. PATENT DOCUMENTS|DIFFERENT ROUGHNESS|$)/i);
  if (titleMatch) {
    titlename = titleMatch[1].trim();
  }
  const wordss = titlename.split(/\s+/).filter(Boolean);
  const chars = titlename.replace(/\s/g, '');
  responseData.modifiedTitle = titlename;
  responseData.wordCount = wordss.length;
  responseData.titleChar = chars.length;

  // Extract Cross-Reference section
  let crosssec = crossregex.exec(text);
  if (crosssec) {
    let crosssection = crosssec[1].replace(/^\s*[A-Za-z]?\s*\n*/, '').trim();
    const filteredContent = cleanText(crosssection);
    const words = countWords(filteredContent);
    responseData.crossWord = words.length;
    responseData.crossParagraphCount = countParagraphs(filteredContent);
  }

  // Extract Field section
  let fieldsec = fieldregex.exec(text);
  if (fieldsec) {
    const fieldsection = fieldsec[1];
    const filteredContent = cleanText(fieldsection);
    const words = countWords(filteredContent);
    const fieldCharCount = filteredContent.replace(/\s/g, '').length;
    const fieldSentCount = filteredContent.split('.').length;
    const fieldlineCount = countParagraphs(filteredContent);
    responseData.fieldWord = words.length;
    const fi = fieldsec[0].match(/^(.*?)(?=\n|$)/);
    const fi1 = fi[1].trim();
    responseData.sectionData.push({
      sName: fi1,
      sCount: words.length,
      sChar: fieldCharCount,
      sSent: fieldSentCount,
      sLine: fieldlineCount,
    });
  }

  // Extract Background section
  let backgrdsec = backgrdregex.exec(text);
  if (backgrdsec) {
    const backgrdsection = backgrdsec[1];
    const filteredContent = cleanText(backgrdsection);
    const words = countWords(filteredContent);
    responseData.backgroundWord = words.length;
    responseData.backgroundParagraphCount = countParagraphs(filteredContent);
    const ba = backgrdsec[0].match(/^(.*?)(?=\n|$)/);
    const ba1 = ba[1].trim();
    responseData.sectionData.push({ sName: ba1, sCount: words.length });
  }

  // Extract Summary section
  let summsec = summregex.exec(text);
  if (summsec) {
    const summsection = summsec[1];
    const filteredContent = cleanText(summsection);
    const words = countWords(filteredContent);
    responseData.summaryWord = words.length;
    responseData.summaryParagraphCount = countParagraphs(filteredContent);
    const su = summsec[0].match(/^(.*?)(?=\n|$)/);
    const su1 = su[1].trim();
    responseData.sectionData.push({ sName: su1, sCount: words.length });
  }

  // Extract Description of Drawings section
  let dodsec = dodregex.exec(text);
  if (dodsec) {
    const dodsection = dodsec[1];
    const filteredContent = cleanText(dodsection);
    const words = countWords(filteredContent);
    responseData.drofDraWord = words.length;
    responseData.drawingDParagraphCount = countParagraphs(filteredContent);
    const dd = dodsec[0].match(/^(.*?)(?=\n|$)/);
    const dd1 = dd[1].trim();
    responseData.sectionData.push({ sName: dd1, sCount: words.length });
  }

  // Extract Detailed Description section
  let detDessec = detDesregex.exec(text);
  if (detDessec) {
    const detDessection = detDessec[1];
    const filteredContent = cleanText(detDessection);
    const words = countWords(filteredContent);
    responseData.detaDesWord = words.length;
    responseData.detailedDescriptionPCount = countParagraphs(filteredContent);
    const dt = detDessec[0].match(/^(.*?)(?=\n|$)/);
    const dt1 = dt[1].trim();
    responseData.sectionData.push({ sName: dt1, sCount: words.length });
  }

  // Extract Claims section
  let claimsec = claimregex.exec(text);
  console.log("claim section is", claimsec);
  
  if (claimsec) {
    const claimsection = claimsec[1].replace(/what is claimed is:/i, '');
    const linesa = claimsection.split(/(?<=\.)\s+/).filter(line => line.includes('.'));
    const filteredLines = linesa.filter(
      line => line.trim().length >= 40 && !/^\s*[\d\n\t\s]+\.?$|^:\s*\n{1,10}CLAIMS\s*\n{1,10}1\./.test(line)
    );

    let independentClaimCount = 0;
    let dependentClaimCount = 0;
    const independentClaims = [];
    const dependentClaims = [];

    for (let i = 0; i < filteredLines.length; i++) {
      const line = filteredLines[i];
      const words = countWords(line);
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
    responseData.independentClaimLists = independentClaims.join('\n');
    responseData.dependentClaimLists = dependentClaims.join('\n');

    const filteredContent = cleanText(claimsection);
    const words = countWords(filteredContent);
    responseData.claimedWord = words.length;
    const cl = claimsec[0].match(/^(.*?)(?=\n|$)/);
    const cl1 = cl[1].trim();
    responseData.sectionData.push({ sName: cl1, sCount: words.length });
  }

  // Extract Abstract section
  let abssec = abstractregex.exec(text);
  if (abssec) {
    let abssection = abssec[1].trim();
    const unwantedWords = ['OF', 'THE', 'DISCLOSURE'];
    abssection = abssection
      .split(/\s+/)
      .filter((word, index) => index >= 3 || !unwantedWords.includes(word.toUpperCase()))
      .join(' ');
    const filteredContent = cleanText(abssection);
    const words = countWords(filteredContent);
    responseData.abstractWord = words.length;
    responseData.abstractPCount = countParagraphs(filteredContent);
    const ab = abssec[0].match(/^(.*?)(?=\n|$)/);
    const ab1 = ab ? ab[1].trim() : 'Abstract';
    responseData.sectionData.push({ sName: ab1, sCount: words.length });
  }

  // Count figures
  let descriptionMatches = figRegex.exec(text);
  if (descriptionMatches) {
    const descriptionText = descriptionMatches[1];
    const imageRegex1 = /(?:FIG(?:URE)?)\.?[-\s]?(?:\d+|[IVXLCDM]+)[A-Z]?(?:\([F\w\s]+\))?\b/gi;
    const matches = descriptionText.match(imageRegex1);
    const uniqueMatches = [...new Set(matches || [])];
    const matchesWithoutanyWord = uniqueMatches.filter(
      match => !/\bfigured\b/i.test(match) && !/\bfiguring\b/i.test(match)
    );
    const Rx1 = matchesWithoutanyWord.length;

    const figsRomanRegex = /FIGS(?:URES?)?\.\s(?:\d+|[IVXLCDM]+)(?:[A-Za-z]?(?:\sAND\s(?:\d+|[IVXLCDM]+)[A-Za-z]?)+)?/i;
    const matches2 = descriptionText.match(figsRomanRegex);
    const unique = [...new Set(matches2 || [])];
    const Rx2 = unique.length * 2;
    responseData.imgCount = Rx1 + Rx2;
  }

  return responseData;
}

module.exports = { processDocument };