"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)({ mergeParams: true });
router.post('/confirmation', auth_1.authenticate, payment_controller_1.confirmPayment);
router.patch('/decision', auth_1.authenticate, auth_1.requireSeller, payment_controller_1.decidePayment);
exports.default = router;
