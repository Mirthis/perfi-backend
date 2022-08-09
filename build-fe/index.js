"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const config_1 = __importDefault(require("./utils/config"));
const db_1 = require("./utils/db");
const logger_1 = __importDefault(require("./utils/logger"));
const http = require('http');
const server = http.createServer(app_1.default);
// server.listen(config.PORT, () => {
//   logger.info(`Server running on port ${config.PORT}`);
// });
const start = async () => {
    await (0, db_1.connectToDatabase)();
    server.listen(config_1.default.PORT, () => {
        logger_1.default.info(`Server running on port ${config_1.default.PORT}`);
    });
};
start();
