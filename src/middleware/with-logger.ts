import { Middleware } from "./types.ts"

export type Logger = {
  debug: (...args: any[]) => void
  info: (...args: any[]) => void
  warn: (...args: any[]) => void
  error: (...args: any[]) => void
}

/**
 * Attaches a provided logger to ctx.logger.
 * `ctx.logger` is used by internal EdgeSpec middleware when provided (instead of `console`).
 */
export const createWithLogger =
  <L extends Logger>(
    logger: L
  ): Middleware<
    {},
    {
      logger: L
    }
  > =>
  (req, ctx, next) => {
    req.logger = logger
    return next(req, ctx)
  }
