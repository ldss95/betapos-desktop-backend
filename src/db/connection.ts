import { Sequelize } from 'sequelize';

export const db = new Sequelize({
	dialect: 'mysql',
	dialectOptions: {
		dateStrings: true,
		typeCast: true,
	},
	define: {
		charset: 'utf8',
		collate: 'utf8_general_ci'
	},
	timezone: '-04:00',
	host: process.env.DB_HOST,
	username: process.env.DB_USER,
	password: process.env.DB_PASS,
	port: Number(process.env.DB_PORT),
	database: process.env.DB_NAME,
	logging: false
});

db.query("SET GLOBAL sql_mode=(SELECT REPLACE(@@sql_mode, 'ONLY_FULL_GROUP_BY', ''));");

db.sync();
