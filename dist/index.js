"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = __importStar(require("nodemailer"));
const Mustache = __importStar(require("mustache"));
const sap_cf_destconn_1 = require("sap-cf-destconn");
;
class SapCfMailer {
    constructor(destinationName, transportConfig) {
        this.destinationPromise = sap_cf_destconn_1.readDestination(destinationName || "MAIL");
        this.transportConfig = transportConfig;
    }
    getTransporter() {
        return __awaiter(this, void 0, void 0, function* () {
            const { destinationConfiguration } = yield this.destinationPromise;
            if (!destinationConfiguration["mail.smtp"]) {
                throw (`No SMTP address found in the mail destination. Please define a 'mail.smtp' property in your destination`);
            }
            // create reusable transporter object using the default SMTP transport
            return nodemailer.createTransport(Object.assign(Object.assign({}, this.transportConfig), { host: destinationConfiguration["mail.smtp.host"] || destinationConfiguration["mail.smtp"], port: parseInt(destinationConfiguration["mail.smtp.port"] || destinationConfiguration["mail.port"] || "587") || 587, secure: false, auth: {
                    user: destinationConfiguration["mail.user"],
                    pass: destinationConfiguration["mail.password"] // generated ethereal password
                } }));
        });
    }
    sendMail(mailOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = yield this.getTransporter();
            const { destinationConfiguration } = yield this.destinationPromise;
            if (!mailOptions.from) {
                mailOptions.from = destinationConfiguration["mail.from"] || destinationConfiguration["mail.user"];
            }
            return transporter.sendMail(mailOptions);
        });
    }
    sendMailTemplate(mailOptionsIn, mailValues) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.sendMail(Object.assign(Object.assign({}, mailOptionsIn), { html: mailOptionsIn.html ? Mustache.render(mailOptionsIn.html.toString(), mailValues) : undefined, text: mailOptionsIn.text ? Mustache.render(mailOptionsIn.text.toString(), mailValues) : undefined }));
        });
    }
}
exports.default = SapCfMailer;
