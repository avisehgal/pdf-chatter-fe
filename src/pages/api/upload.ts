import type { NextApiRequest, NextApiResponse } from 'next';
import formidable, { IncomingForm } from 'formidable';
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

  form.parse(req, (err, fields, files) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    const file = Array.isArray(files.file) ? files.file[0] : files.file as formidable.File;

    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    res.status(200).json({ filename: file.newFilename });
  });
};

export default handler;
