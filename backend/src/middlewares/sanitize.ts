import xss from 'xss'
import { Request, Response, NextFunction } from 'express'

const sanitizeObject = (obj: any) => {
  const sanitized: any = {}

  for (const key in obj) {
    if (typeof obj[key] === 'string') {
      sanitized[key] = xss(obj[key])
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      sanitized[key] = sanitizeObject(obj[key])
    } else {
      sanitized[key] = obj[key]
    }
  }

  return sanitized
}

export const sanitizeInputs = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    req.body = sanitizeObject(req.body)
  }

  if (req.query) {
    req.sanitizedQuery = sanitizeObject(req.query)
  }

  if (req.params) {
    req.params = sanitizeObject(req.params)
  }

  next()
}
