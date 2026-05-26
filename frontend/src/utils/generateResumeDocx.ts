import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  BorderStyle,
  convertInchesToTwip,
} from 'docx';
import { saveAs } from 'file-saver';

// ─── Known ATS section header names ────────────────────────────────────────
const SECTION_HEADERS = [
  'PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE',
  'SKILLS', 'TECHNICAL SKILLS', 'CORE COMPETENCIES', 'KEY SKILLS',
  'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'EMPLOYMENT HISTORY',
  'EDUCATION', 'ACADEMIC BACKGROUND',
  'CERTIFICATIONS', 'CERTIFICATES', 'AWARDS', 'HONORS',
  'PROJECTS', 'KEY PROJECTS', 'PORTFOLIO',
  'VOLUNTEER', 'VOLUNTEERING',
  'LANGUAGES', 'PUBLICATIONS', 'REFERENCES',
];

interface ParsedSection {
  heading: string | null;  // null = top personal info block
  lines: string[];
}

/** Split the AI output into logical sections */
function parseSections(text: string): ParsedSection[] {
  const lines = text.split('\n').map(l => l.trimEnd());
  const sections: ParsedSection[] = [];
  let current: ParsedSection = { heading: null, lines: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    const upperTrimmed = trimmed.toUpperCase().replace(/[:\-–—]+$/, '').trim();

    const isHeader = SECTION_HEADERS.includes(upperTrimmed) ||
      (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && trimmed.length < 55 && /^[A-Z\s&\/]+$/.test(trimmed));

    if (isHeader && trimmed.length > 0) {
      if (current.lines.some(l => l.trim() !== '')) {
        sections.push(current);
      }
      current = { heading: trimmed, lines: [] };
    } else {
      current.lines.push(line);
    }
  }
  if (current.lines.some(l => l.trim() !== '')) {
    sections.push(current);
  }
  return sections;
}

/** Extract candidate name — first non-empty line of the header block */
function extractName(sections: ParsedSection[]): string {
  const headerBlock = sections.find(s => s.heading === null);
  if (!headerBlock) return 'Resume';
  const firstLine = headerBlock.lines.find(l => l.trim().length > 0);
  return firstLine?.trim() || 'Resume';
}

/** Extract contact info lines (everything after the name in header block) */
function extractContactLines(sections: ParsedSection[]): string[] {
  const headerBlock = sections.find(s => s.heading === null);
  if (!headerBlock) return [];
  const nonEmpty = headerBlock.lines.filter(l => l.trim().length > 0);
  return nonEmpty.slice(1); // skip name
}

// ─── Colour palette (professional, ATS-safe) ───────────────────────────────
const COLOR_HEADING = '1A3C5E';   // Dark navy blue
const COLOR_RULE    = '2563EB';   // Blue rule under name
const COLOR_SECTION = '1A3C5E';   // Section header colour
const COLOR_BODY    = '1F2937';   // Near-black body text
const COLOR_MUTED   = '6B7280';   // Gray for contact / dates

// ─── Paragraph builders ────────────────────────────────────────────────────

function nameParagraph(name: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: name,
        bold: true,
        size: 56,           // 28pt
        color: COLOR_HEADING,
        font: 'Calibri',
      }),
    ],
  });
}

function contactParagraph(line: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 0 },
    children: [
      new TextRun({
        text: line,
        size: 20,           // 10pt
        color: COLOR_MUTED,
        font: 'Calibri',
      }),
    ],
  });
}

function dividerParagraph(): Paragraph {
  return new Paragraph({
    spacing: { before: 100, after: 100 },
    border: {
      bottom: {
        color: COLOR_RULE,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 12,
      },
    },
    children: [],
  });
}

function sectionHeadingParagraph(heading: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200, after: 80 },
    border: {
      bottom: {
        color: COLOR_SECTION,
        space: 1,
        style: BorderStyle.SINGLE,
        size: 4,
      },
    },
    children: [
      new TextRun({
        text: heading.toUpperCase(),
        bold: true,
        size: 24,           // 12pt
        color: COLOR_SECTION,
        font: 'Calibri',
        allCaps: true,
      }),
    ],
  });
}

function bodyParagraph(text: string, isBullet = false): Paragraph {
  const cleanText = text.replace(/^[•\-\*]\s*/, '').trim();

  return new Paragraph({
    spacing: { after: 60 },
    indent: isBullet ? { left: convertInchesToTwip(0.2) } : undefined,
    children: [
      isBullet
        ? new TextRun({ text: '•  ', bold: false, size: 20, color: COLOR_BODY, font: 'Calibri' })
        : new TextRun({ text: '' }),
      new TextRun({
        text: cleanText,
        size: 20,           // 10pt
        color: COLOR_BODY,
        font: 'Calibri',
      }),
    ],
  });
}

function jobTitleParagraph(text: string): Paragraph {
  // Detect bold job title lines (lines that look like "Job Title | Company | Dates")
  return new Paragraph({
    spacing: { before: 100, after: 40 },
    children: [
      new TextRun({
        text: text.trim(),
        bold: true,
        size: 22,
        color: COLOR_BODY,
        font: 'Calibri',
      }),
    ],
  });
}

function skillsLineParagraph(text: string): Paragraph {
  // Skills formatted as comma-separated or pipe-separated line
  return new Paragraph({
    spacing: { after: 60 },
    children: [
      new TextRun({
        text: text.trim(),
        size: 20,
        color: COLOR_BODY,
        font: 'Calibri',
      }),
    ],
  });
}

// ─── Heuristics to classify lines inside a section ────────────────────────

function looksLikeBullet(line: string): boolean {
  return /^[•\-\*\u2022]\s+/.test(line.trim()) || /^\d+\.\s+/.test(line.trim());
}

function looksLikeJobTitle(line: string): boolean {
  // Lines with | separators or lines ending with a year range usually are job titles
  return /\|/.test(line) || /\b(20\d{2}|19\d{2})\b/.test(line) || /–|—|-/.test(line);
}

// ─── Build paragraphs for each section ────────────────────────────────────

function buildSectionParagraphs(section: ParsedSection): Paragraph[] {
  const paras: Paragraph[] = [];

  if (section.heading) {
    paras.push(sectionHeadingParagraph(section.heading));
  }

  const headingUpper = (section.heading || '').toUpperCase();
  const isSkills = headingUpper.includes('SKILL') || headingUpper.includes('COMPETENC');

  for (const line of section.lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      paras.push(new Paragraph({ spacing: { after: 40 }, children: [] }));
      continue;
    }

    if (looksLikeBullet(trimmed)) {
      paras.push(bodyParagraph(trimmed, true));
    } else if (!isSkills && looksLikeJobTitle(trimmed)) {
      paras.push(jobTitleParagraph(trimmed));
    } else if (isSkills) {
      paras.push(skillsLineParagraph(trimmed));
    } else {
      paras.push(bodyParagraph(trimmed, false));
    }
  }

  return paras;
}

// ─── Main export ───────────────────────────────────────────────────────────

export async function downloadResumeAsDocx(
  optimizedText: string,
  fileName = 'optimized_resume_cvmind.docx'
): Promise<void> {
  const sections = parseSections(optimizedText);
  const candidateName = extractName(sections);
  const contactLines = extractContactLines(sections);
  const contentSections = sections.filter(s => s.heading !== null);

  const docParagraphs: Paragraph[] = [
    // Candidate name
    nameParagraph(candidateName),
    // Contact info
    ...contactLines.map(l => contactParagraph(l)),
    // Divider
    dividerParagraph(),
    // All content sections
    ...contentSections.flatMap(s => buildSectionParagraphs(s)),
  ];

  const doc = new Document({
    creator: 'CVMind AI',
    title: `${candidateName} - ATS Resume`,
    description: 'AI-optimized ATS resume generated by CVMind AI',
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 20,
            color: COLOR_BODY,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.9),
              right: convertInchesToTwip(0.9),
            },
          },
        },
        children: docParagraphs,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, fileName);
}
