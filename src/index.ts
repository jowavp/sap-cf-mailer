import * as nodemailer from 'nodemailer'
import * as Mustache from 'mustache'
import { readDestination, IMailDestinationConfiguration, IDestinationData, readConnectivity } from 'sap-cf-destconn'
import Mail = require('nodemailer/lib/mailer')
import SMTPTransport = require('nodemailer/lib/smtp-transport');

export interface IMailOptions extends Mail.Options { };

export default class SapCfMailer {
    destinationPromise: Promise<IDestinationData<IMailDestinationConfiguration>>;
    transportConfig: SMTPTransport.Options | undefined;

    constructor(destinationName?: string, transportConfig?:  SMTPTransport.Options) {
        this.destinationPromise = readDestination<IMailDestinationConfiguration>(destinationName || "MAIL");

        this.transportConfig = transportConfig;
    }

    public async getTransporter() {
        const { destinationConfiguration } = await this.destinationPromise;

        if (!destinationConfiguration["mail.smtp.host"] && !destinationConfiguration["mail.smtp"]) {
            throw (`No SMTP address found in the mail destination. Please define a 'mail.smtp.host' property in your destination`)
        }

        let proxy;
        if (destinationConfiguration.ProxyType.toLowerCase() === 'onpremise') {
            throw (`At this moment we do not support the onpremise SMTP server.`)
        //    const connectivity = await readConnectivity(destinationConfiguration.CloudConnectorLocationId);
        //    proxy = `socks5://${connectivity.proxy.host}:${connectivity.onpremise_socks5_proxy_port}`
        }

        // create reusable transporter object using the default SMTP transport
        const transporter  = nodemailer.createTransport(<SMTPTransport.Options>{
            ...this.transportConfig,
            host: destinationConfiguration["mail.smtp.host"] || destinationConfiguration["mail.smtp"],
            port: parseInt(destinationConfiguration["mail.smtp.port"] || destinationConfiguration["mail.port"] || "587") || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: destinationConfiguration["mail.user"], // generated ethereal user
                pass: destinationConfiguration["mail.password"] // generated ethereal password
            },
            proxy
        });

        return transporter;
    }

    public async sendMail(mailOptions: IMailOptions) {
        const transporter = await this.getTransporter();
        const { destinationConfiguration } = await this.destinationPromise;

        if (!mailOptions.from) {
            mailOptions.from = destinationConfiguration["mail.smtp.from"] ||  destinationConfiguration["mail.from"] || destinationConfiguration["mail.user"];
        }

        return transporter.sendMail(mailOptions)
    }

    public async sendMailTemplate(mailOptionsIn: IMailOptions, mailValues: any) {
        return this.sendMail({ 
            ...mailOptionsIn, 
            html: mailOptionsIn.html ? Mustache.render(mailOptionsIn.html.toString(), mailValues) : undefined,
            text: mailOptionsIn.text ? Mustache.render(mailOptionsIn.text.toString(), mailValues) : undefined
        });
    }
}
