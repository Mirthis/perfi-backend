import { Sequelize } from 'sequelize';
import { Umzug, SequelizeStorage } from 'umzug';
import config from './config';

export const sequelize = new Sequelize(config.DATABASE_URI, {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const migrationConf = {
  storage: new SequelizeStorage({ sequelize, tableName: 'migrations' }),
  migrations: {
    resolve: ({
      name,
      path,
      context,
    }: {
      name: string;
      path?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context: any;
    }) => {
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const migration = path ? require(path) : '';
      return {
        // adjust the parameters Umzug will
        // pass to migration methods when called
        name,
        up: async () => migration.up(context, Sequelize),
        down: async () => migration.down(context, Sequelize),
      };
    },
    glob: 'src/migrations/*.js',
  },
  context: sequelize.getQueryInterface(),
  logger: console,
};

export const runMigrations = async () => {
  const migrator = new Umzug(migrationConf);
  const migrations = await migrator.up();
  console.log('Migrations up to date', {
    files: migrations.map((mig) => mig.name),
  });
};

export const rollbackMigration = async () => {
  await sequelize.authenticate();
  const migrator = new Umzug(migrationConf);
  await migrator.down();
};

export const connectToDatabase = async () => {
  try {
    await sequelize.authenticate();
    await runMigrations();
    console.log('connected to the database');
  } catch (err) {
    console.log(err);
    console.log('failed to connect to the database');
    return process.exit(1);
  }

  return null;
};
