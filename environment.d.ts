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
		SMTP_SERVER: string;
		SMTP_USERNAME: string;
		SMTP_PASSWORD: string;
		NOTIFICATIONS_EMAIL: string;
	}
}