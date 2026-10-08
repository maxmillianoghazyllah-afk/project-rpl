"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const queue_controller_1 = require("../controllers/queue.controller");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get('/', queue_controller_1.getQueue);
router.patch('/:id/status', auth_1.authenticate, auth_1.requireSeller, queue_controller_1.updateQueueStatus);
exports.default = router;
