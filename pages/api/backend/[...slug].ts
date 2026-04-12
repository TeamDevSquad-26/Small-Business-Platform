import type { NextApiRequest, NextApiResponse } from "next";
import { getApp } from "../../../backend/src/app";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return getApp()(req, res);
}
