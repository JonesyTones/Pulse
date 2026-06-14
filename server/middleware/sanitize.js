import { body, validationResult } from 'express-validator'

export const sanitizeQuery = [
  body('query')
    .trim()
    .escape()
    .isLength({ max: 500 })
    .withMessage('Query must be 500 characters or fewer.'),
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    next()
  },
]
