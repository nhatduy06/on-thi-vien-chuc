import type { NextApiRequest, NextApiResponse } from 'next';
import { Subject } from '../../lib/mock';
import { getSubjects } from '../../lib/db';

type Data = {
  success: boolean;
  data: Subject[];
  message?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      data: [],
      message: 'Method not allowed',
    });
  }

  try {
    let categoryId: number | undefined;

    // Parse categoryId if provided
    const rawCategoryId = req.query.categoryId;
    if (rawCategoryId) {
      const id = parseInt(rawCategoryId as string, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          data: [],
          message: 'Invalid categoryId parameter',
        });
      }
      categoryId = id;
    }

    const subjects = await getSubjects(categoryId);

    return res.status(200).json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      message: 'Internal server error',
    });
  }
}