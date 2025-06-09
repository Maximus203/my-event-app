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
    const resp: any = { 
      success: true, 
      data, 
      message, 
      errors: [],
      statusCode 
    };
    
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { 
        timestamp: new Date().toISOString(),
        statusCode,
        type: "success"
      };
    }
    
    return res.status(statusCode).json(resp);
  }

  static error(
    res: Response,
    message: string = "",
    statusCode: number = 500,
    errors: any[] = []
  ) {
    const resp: any = { 
      success: false, 
      data: null, 
      message, 
      errors,
      statusCode 
    };
    
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { 
        timestamp: new Date().toISOString(),
        statusCode,
        type: "error"
      };
    }
    
    return res.status(statusCode).json(resp);
  }

  /**
   * Réponse pour redirections (3xx)
   */
  static redirect(
    res: Response,
    redirectUrl: string,
    message: string = "Redirection",
    statusCode: number = 302
  ) {
    const resp: any = { 
      success: true, 
      data: { redirectUrl }, 
      message, 
      errors: [],
      statusCode 
    };
    
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { 
        timestamp: new Date().toISOString(),
        statusCode,
        type: "redirect",
        redirectUrl
      };
    }
    
    return res.status(statusCode).json(resp);
  }

  /**
   * Réponse générique pour n'importe quel status code
   */
  static response(
    res: Response,
    statusCode: number,
    data: any = null,
    message: string = "",
    errors: any[] = []
  ) {
    const isSuccess = statusCode >= 200 && statusCode < 300;
    
    const resp: any = { 
      success: isSuccess, 
      data: isSuccess ? data : null, 
      message, 
      errors: isSuccess ? [] : errors,
      statusCode 
    };
    
    if (process.env.DEBUG_BACKEND === "true") {
      resp.debug = { 
        timestamp: new Date().toISOString(),
        statusCode,
        type: isSuccess ? "success" : "error"
      };
    }
    
    return res.status(statusCode).json(resp);
  }
}
