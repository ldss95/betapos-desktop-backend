import express, { Express } from 'express'
import session from 'express-session'
const MySqlStore = require('express-mysql-session')(session)
import path from 'path'
const Sentry = require('@sentry/node')
import cors from 'cors'
import 'dotenv/config'

import routes from './routes'
const app: Express = express()

const sessionStore = new MySqlStore({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME,
	port: process.env.DB_PORT
})

//Settings
app.set('port', process.env.PORT)
app.use(express.json({limit: '100mb'}))
app.use(express.urlencoded({ extended: true }))

//Cors
app.use(cors({
	origin: process.env.CLIENT_URL,
	credentials: true
}))

//Session
app.use(session({
	secret: `${process.env.SECRET_SESSION}`,
	resave: false,
	saveUninitialized: false,
	store: sessionStore
}))

//Error Tracking Sentry
if(process.env.NODE_ENV == 'production')
	Sentry.init({ dsn: 'https://d33b3cbc04e848faa9f54774ebe3557c@o327190.ingest.sentry.io/5424305' });

//Middlewares
if(process.env.NODE_ENV == 'production')
	app.use(Sentry.Handlers.requestHandler());

//Static Files
app.use(express.static(path.join(__dirname, 'public'), {
	setHeaders: (res, path) => {
		if (path.endsWith('.css') || path.endsWith('.js'))
			res.setHeader('Cache-Control', 'max-age=31557600')
		else if (path.endsWith('.jpg') || path.endsWith('.png'))
			res.setHeader('Cache-Control', 'max-age=86400')
		else
			res.setHeader('Cache-Control', 'no-cache')
	}
}))

//Routes
app.use(routes)

//Error Tracking Sentry
if(process.env.NODE_ENV == 'production')
	app.use(Sentry.Handlers.errorHandler());

export default app