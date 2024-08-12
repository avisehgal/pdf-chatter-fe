import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import pdf from 'pdf-parse';

type Data = {
  response?: string;
  error?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
  if (req.method === 'POST') {
    const { query, filename } = req.body;

    try {
      const filePath = path.join(process.cwd(), 'public', 'uploads', filename);
      const dataBuffer = fs.readFileSync(filePath);

      const data = await pdf(dataBuffer);
      const extractedText = data.text;

      // Here you would typically send `extractedText` and `query` to your LLM or other backend service
      const responseText = `Simulated response for query '${query}' on extracted text: '${extractedText.slice(0, 100)}...'`;

      return res.status(200).json({ response: responseText });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to process the PDF' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
