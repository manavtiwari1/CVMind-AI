import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Parses a PDF buffer and extracts its text.
 * @param {Buffer} buffer - The PDF file buffer
 * @returns {Promise<string>} - Extracted text
 */
export async function parsePdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('PDF parsing error:', error);
    throw new Error('Failed to parse PDF document. Ensure the file is not corrupted.');
  }
}

/**
 * Parses a DOCX buffer and extracts its text.
 * @param {Buffer} buffer - The DOCX file buffer
 * @returns {Promise<string>} - Extracted text
 */
export async function parseDocx(buffer) {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value || '';
  } catch (error) {
    console.error('DOCX parsing error:', error);
    throw new Error('Failed to parse Word document. Ensure the file is not corrupted.');
  }
}

/**
 * Parses a plain text buffer.
 * @param {Buffer} buffer - The text file buffer
 * @returns {string} - Decoded text
 */
export function parseTxt(buffer) {
  try {
    return buffer.toString('utf-8');
  } catch (error) {
    console.error('Text parsing error:', error);
    throw new Error('Failed to read text file. Ensure it is encoded in UTF-8.');
  }
}
