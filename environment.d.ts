declare namespace NodeJS {
	export interface ProcessEnv {
		PORT: number;
		DB_USER: string;
		DB_PASS: string;
		DB_NAME: string;
		DB_PORT: string;
		DB_HOST: string;
		NODE_ENV: 'development' | 'production' | 'test';
		SECRET_SESSION: string;
		SECRET_TOKEN: string;
		CLIENT_URL: string;
		API_URL: string;
		EMAIL_SMTP: string;
		EMAIL_PORT: number;
		EMAIL_ACOUNT: string;
		EMAIL_PASS: string;
	}
}