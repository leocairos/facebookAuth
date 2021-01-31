import { Router } from 'express';

import controller from './controller';

const router = Router();

router.get('/', controller.getIndex);
router.get('/auth/facebook/callback', controller.facebookCallback);
router.get('/logout', controller.facebookLogout);

export default router;