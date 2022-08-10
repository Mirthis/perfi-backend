"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("express-async-errors");
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const path_1 = __importDefault(require("path"));
const middleware_1 = __importDefault(require("./utils/middleware"));
const db_1 = require("./utils/db");
const models_1 = require("./models");
const config_1 = __importDefault(require("./utils/config"));
const auth_1 = require("./utils/auth");
const controllers_1 = require("./controllers");
// const LocalStrategy = require('passport-local').Strategy;
const SequelizeStore = require('connect-session-sequelize')(express_session_1.default.Store);
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// TODO: tweak settings
const sessStore = new SequelizeStore({ db: db_1.sequelize, tableName: 'sessions' });
const sess = {
    secret: config_1.default.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
    name: 'perfi.sid',
    store: sessStore,
};
if (config_1.default.NODE_ENV === 'production') {
    app.set('trust proxy', 1); // trust first proxy
    // TODO: check how to enable HTTPS
    sess.cookie.secure = true; // serve secure cookies
}
app.use((0, express_session_1.default)(sess));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(auth_1.localStrategy);
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (userId, done) => {
    try {
        const user = await models_1.User.findByPk(userId);
        // @ts-ignore
        // TODO: Fix TS compile issue
        if (user) {
            done(null, user.toJSON());
        }
        else {
            done(null, null);
        }
    }
    catch (err) {
        done(err, null);
    }
});
if (process.env.NODE_ENV !== 'test') {
    app.use(middleware_1.default.morgan(':method :url :status :res[content-length] - :response-time ms :body'));
}
const buildPath = path_1.default.join(__dirname, 'build-fe');
console.log('buildPath');
console.log(buildPath);
app.use(express_1.default.static(buildPath));
app.use('/api/users', controllers_1.usersRouter);
app.use('/api/plaid', controllers_1.plaidRouter);
app.use('/api/auth', controllers_1.authRouter);
app.use('/api/transactions', controllers_1.transactionsRouter);
app.use('/api/accounts', controllers_1.accountsRouter);
app.use('/api/categories', controllers_1.categoriesRouter);
app.use('/api/demo', controllers_1.demoRouter);
app.get('(/*)?', async (_req, res) => {
    res.sendFile(path_1.default.join(buildPath, 'index.html'));
});
app.use(middleware_1.default.errorHandler);
app.use(middleware_1.default.unknownEndpoint);
exports.default = app;
