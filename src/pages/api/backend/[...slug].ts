import type { NextApiRequest, NextApiResponse } from "next";
import { getApp } from "../../../../backend/dist/app.js";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return getApp()(req, res);
}
