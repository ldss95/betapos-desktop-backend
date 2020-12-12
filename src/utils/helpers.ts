import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
	secure: false,
	ignoreTLS: true,
	tls: {
		rejectUnauthorized: false,
	},
	port: 587,
	host: 'us2.smtp.mailhostbox.com',
	auth: {
		user: process.env.NOTIFICATIONS_EMAIL,
		pass: process.env.NOTIFICATIONS_PASSWORD
	}
})

interface msgAttr {
	from?: string;
	to: string;
	subject: string;
	html: string;
	attachments?: {
		filename: string;
		path: string;
	}[];
}

function sendMessage(msg: msgAttr) {
	msg.from = `ZECONOMY <${process.env.NOTIFICATIONS_EMAIL}>`
	
	transporter.sendMail(msg, (error) => {
		if (error) {
			throw error
		}
	})
}

export { sendMessage };
