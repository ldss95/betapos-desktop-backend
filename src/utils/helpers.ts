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

const format = {
	rnc: (rnc: string) =>
		rnc
			? `${rnc.substr(0, 3)}-${rnc.substr(3, 5)}-${rnc.substr(8, 1)}`
			: 'N/A',
	phone: (phone: string) =>
		phone
			? `(${phone.substr(0, 3)}) ${phone.substr(3, 3)}-${phone.substr(
					6,
					4
			  )}`
			: 'N/A',
	cash: (amount: number) =>
		Intl.NumberFormat('es-DO', { minimumFractionDigits: 2 }).format(amount)
};

function duiIsValid(dui: string): boolean {
	let isValid: boolean = false;
	let sum: number = 0;

	if (!dui || dui.length != 11) {
		return isValid;
	}

	const duiIndividualDigits: string[] = dui.split('');
	const lastDigit: number = Number(duiIndividualDigits.pop());

	duiIndividualDigits.forEach((digit: string | number, index: number) => {
		digit = Number(digit);
		const multipler: number = index % 2 ? 2 : 1;

		if (digit * multipler > 9) {
			sum += Number((digit * multipler).toString().charAt(0));
			sum += Number((digit * multipler).toString().charAt(1));
		} else {
			sum += digit * multipler;
		}
	});

	const topTen: number = (Math.floor(sum / 10) + 1) * 10;

	if (lastDigit == topTen - sum) {
		isValid = true;
	}

	return isValid;
}

export { duiIsValid, sendMessage, format };
