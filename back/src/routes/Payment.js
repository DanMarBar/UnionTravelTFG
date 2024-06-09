import express from 'express';
import {createPaymentIntent} from '../controller/Payment.js';
import {createInvoiceUsingUserEmail} from "../controller/Invoice.js";

const router = express.Router();

router.post('/create-payment-intent', createPaymentIntent);
router.post('/createInvoiceUsingUserEmail/:email', createInvoiceUsingUserEmail);

export default router;