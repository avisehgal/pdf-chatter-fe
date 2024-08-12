import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm, File as FormidableFile, Files } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const form = new IncomingForm({
    uploadDir,
    keepExtensions: true,
  });

  form.parse(req, (err, fields, files: Files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    // Check if files.file is defined
    const file = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : undefined;

    if (!file || !(file as FormidableFile).newFilename) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    res.status(200).json({ filename: (file as FormidableFile).newFilename });
  });
};

export default handler;
