import express, { Express } from 'express';
import session from 'express-session';
const MySqlStore = require('express-mysql-session')(session);
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cors from 'cors';
import 'dotenv/config';

const { NODE_ENV, SENTRY_DSN } = process.env;
import { listen } from './utils/listener';
import routes from './routes';
const app: Express = express();

const sessionStore = new MySqlStore({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
});

//Settings
app.set('port', process.env.PORT);
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true }));

//Cors
app.use(
	cors({
		origin: (_, callback) => callback(null, true),
		credentials: true
	})
);

//Session
app.use(
	session({
		secret: `${process.env.SECRET_SESSION}`,
		resave: false,
		saveUninitialized: false,
		store: sessionStore
	})
);

//Error Tracking Sentry
Sentry.init({
	environment: NODE_ENV,
	dsn: SENTRY_DSN,
	integrations: [
		new Sentry.Integrations.Http({ tracing: true }),
		new Tracing.Integrations.Express({ app }),
	],
	tracesSampleRate: 1.0,
});

//Middlewares
app.use(Sentry.Handlers.requestHandler());

if(NODE_ENV == 'development'){
	const morgan = require('morgan');
	app.use(morgan('dev'));
}

//Listen updates from firebase
listen()

//Routes
app.use(routes);

//Error Tracking Sentry
app.use(Sentry.Handlers.errorHandler());

export default app;
