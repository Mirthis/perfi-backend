"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectToDatabase = exports.rollbackMigration = exports.runMigrations = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const umzug_1 = require("umzug");
const config_1 = __importDefault(require("./config"));
exports.sequelize = new sequelize_1.Sequelize(config_1.default.DATABASE_URI, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        supportBigNumbers: true,
    },
    logging: false,
});
const migrationConf = {
    storage: new umzug_1.SequelizeStorage({ sequelize: exports.sequelize, tableName: 'migrations' }),
    migrations: {
        resolve: ({ name, path, context, }) => {
            // eslint-disable-next-line import/no-dynamic-require, global-require
            const migration = path ? require(path) : '';
            return {
                // adjust the parameters Umzug will
                // pass to migration methods when called
                name,
                up: async () => migration.up(context, sequelize_1.Sequelize),
                down: async () => migration.down(context, sequelize_1.Sequelize),
            };
        },
        glob: 'src/migrations/*.js',
    },
    context: exports.sequelize.getQueryInterface(),
    logger: console,
};
const runMigrations = async () => {
    const migrator = new umzug_1.Umzug(migrationConf);
    const migrations = await migrator.up();
    console.log('Migrations up to date', {
        files: migrations.map((mig) => mig.name),
    });
};
exports.runMigrations = runMigrations;
const rollbackMigration = async () => {
    await exports.sequelize.authenticate();
    const migrator = new umzug_1.Umzug(migrationConf);
    await migrator.down();
};
exports.rollbackMigration = rollbackMigration;
const connectToDatabase = async () => {
    try {
        await exports.sequelize.authenticate();
        await (0, exports.runMigrations)();
        console.log('connected to the database');
    }
    catch (err) {
        console.log(err);
        console.log('failed to connect to the database');
        return process.exit(1);
    }
    return null;
};
exports.connectToDatabase = connectToDatabase;
