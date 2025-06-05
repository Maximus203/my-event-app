/**
 * ResponseFormatter : formate systématiquement les réponses JSON.
 * `{ success, data, message, errors, debug? }`
 */

export class ResponseFormatter {
  static success(data: any = null, message: string = "", debug?: any) {
    const resp: any = { success: true, data, message, errors: [] };
    if (process.env.DEBUG_BACKEND === "true" && debug) {
      resp.debug = debug;
    }
    return resp;
  }

  static error(message: string = "", errors: any[] = [], debug?: any) {
    const resp: any = { success: false, data: null, message, errors };
    if (process.env.DEBUG_BACKEND === "true" && debug) {
      resp.debug = debug;
    }
    return resp;
  }
}
