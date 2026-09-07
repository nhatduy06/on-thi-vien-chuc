import type { NextApiRequest, NextApiResponse } from 'next';
import { Category } from '../../lib/mock';
import { getCategories } from '../../lib/db';

type Data = {
  success: boolean;
  data: Category[];
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
    const categories = await getCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      data: [],
      message: 'Internal server error',
    });
  }
}
