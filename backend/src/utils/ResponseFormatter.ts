/**
 * ResponseFormatter : formate systématiquement les réponses JSON.
 * `{ success, data, message, errors, debug? }`
 */

import { Response } from "express";

export class ResponseFormatter {
  static success(
    res: Response,
    data: any = null,
    message: string = "",
    statusCode: number = 200
  ) {
    const resp: any = { success: true, data, message, errors: [] };
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { timestamp: new Date().toISOString() };
    }
    return res.status(statusCode).json(resp);
  }

  static error(
    res: Response,
    message: string = "",
    statusCode: number = 500,
    errors: any[] = []
  ) {
    const resp: any = { success: false, data: null, message, errors };
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { timestamp: new Date().toISOString() };
    }
    return res.status(statusCode).json(resp);
  }
}
