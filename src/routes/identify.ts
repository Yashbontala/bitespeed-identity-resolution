import { Router } from 'express';
import { identifyCustomer } from '../controllers/identifyController';

const router = Router();

router.post('/', identifyCustomer); 

export default router;
