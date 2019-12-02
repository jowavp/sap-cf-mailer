import { IMailDestinationConfiguration, IDestinationData } from 'sap-cf-destconn';
import Mail = require('nodemailer/lib/mailer');
import SMTPTransport = require('nodemailer/lib/smtp-transport');
export interface IMailOptions extends Mail.Options {
}
export default class SapCfMailer {
    destinationPromise: Promise<IDestinationData<IMailDestinationConfiguration>>;
    transportConfig: SMTPTransport.Options | undefined;
    constructor(destinationName?: string, transportConfig?: SMTPTransport.Options);
    getTransporter(): Promise<Mail>;
    sendMail(mailOptions: IMailOptions): Promise<any>;
    sendMailTemplate(mailOptionsIn: IMailOptions, mailValues: any): Promise<any>;
}
