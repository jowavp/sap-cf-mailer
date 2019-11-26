import * as nodemailer from 'nodemailer'
import * as Mustache from 'mustache'
import { readDestination, IMailDestinationConfiguration, IDestinationData } from 'sap-cf-destconn'
import Mail = require('nodemailer/lib/mailer')

export interface IMailOptions extends Mail.Options { };

export default class SapCfMailer {
    destinationPromise: Promise<IDestinationData<IMailDestinationConfiguration>>;

    constructor(destinationName?: string) {
        this.destinationPromise = readDestination<IMailDestinationConfiguration>(destinationName || "MAIL");
    }

    private async getTransporter() {
        const { destinationConfiguration } = await this.destinationPromise;

        if (!destinationConfiguration["mail.smtp"]) {
            throw (`No SMTP address found in the mail destination. Please define a 'mail.smtp' property in your destination`)
        }

        // create reusable transporter object using the default SMTP transport
        return nodemailer.createTransport({
            host: destinationConfiguration["mail.smtp"],
            port: parseInt(destinationConfiguration["mail.port"] || "587") || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: destinationConfiguration["mail.user"], // generated ethereal user
                pass: destinationConfiguration["mail.password"] // generated ethereal password
            }
        });
    }

    public async sendMail(mailOptions: IMailOptions) {
        const transporter = await this.getTransporter();
        const { destinationConfiguration } = await this.destinationPromise;

        if (!mailOptions.from) {
            mailOptions.from = destinationConfiguration["mail.from"] || destinationConfiguration["mail.user"];
        }

        return transporter.sendMail(mailOptions)
    }

    public async sendMailTemplate(mailOptionsIn: IMailOptions, mailValues: any) {
        const mailOptions = {...mailOptionsIn}
        if (mailOptions.html) {
            const HtmlTemplate = Mustache.parse(mailOptions.html.toString());
            mailOptions.html = Mustache.render(HtmlTemplate, mailValues)
        }
        if (mailOptions.text) {
            const TextTemplate = Mustache.parse(mailOptions.text.toString());
            mailOptions.text = Mustache.render(TextTemplate, mailValues);
        }

        return this.sendMail(mailOptions);
    }
}
