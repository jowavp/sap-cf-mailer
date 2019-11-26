import { IMailDestinationConfiguration, IDestinationData } from 'sap-cf-destconn';
import Mail = require('nodemailer/lib/mailer');
export interface IMailOptions extends Mail.Options {
}
export default class SapCfMailer {
    destinationPromise: Promise<IDestinationData<IMailDestinationConfiguration>>;
    constructor(destinationName?: string);
    private getTransporter;
    sendMail(mailOptions: IMailOptions): Promise<any>;
    sendMailTemplate(mailOptionsIn: IMailOptions, mailValues: any): Promise<any>;
}
