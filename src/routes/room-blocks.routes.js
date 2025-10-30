import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { createBlock, listBlocks, removeBlock } from '../controllers/roomBlocks.controller.js';
const router = Router();

const validate = (rules) => [
  ...rules,
  (req,res,next)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

router.post(
  '/rooms/:id/blocks',
  validate([ body('start').isISO8601(), body('end').isISO8601(), body('reason').optional().isString().isLength({max:200}) ]),
  createBlock
);

router.get('/rooms/:id/blocks', listBlocks);
router.delete('/room-blocks/:blockId', removeBlock);

export default router;
