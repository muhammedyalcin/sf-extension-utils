/**
 * Smartface Error Handling module
 * @module error
 * @type {object}
 * @author Alper Ozisik <alper.ozisik@smartface.io>
 * @copyright Smartface 2017
 */
const Application = require("sf-core/application");
const AlertView = require('sf-core/ui/alertview');
const System = require('sf-core/device/system');
const File = require('sf-core/io/file');
const Path = require('sf-core/io/path');
const FileStream = require('sf-core/io/filestream');
const Screen = require('sf-core/device/screen');
const Image = require('sf-core/ui/image');
const langChecker = require("./base/langchecker")("permission");
const expect = require('chai').expect;

langChecker.check(["ok", "sendEmail", "applicationError", "error"]);
exports.handleErrors = handleErrors;

var config;
/**
 * @callback error:customAction
 * @param {object} err fired Error object as argument
 */

/**
 * Sets a handler for unhandlled js errors.
 * @function error:handleErrors
 * @param {object} [options]
 * @param {boolean} [options.silent = false] will not show alert
 * @param {boolean} [options.screenCapture = false] attaches screenshots to mail
 * @param {boolean} [options.sendEmail = false] sends error messages via email
 * @param {string} [options.mailSubject] subject field when sending mails
 * @param {string} [options.mailTo] to field to send the error mails
 * @param {boolean} [options.consoleLog = false] prints errors using console.log
 * @param {boolean} [options.vibrate = false] vibrates when error occurs
 * @param {error:customAction} [options.customAction] called when error occurs. Fired before internal handling
 * @param {boolean} [options.displayErrorDetails = false] in the alert body, it will show details
 * @public
 * @static
 * @example
 * require("sf-extension-utils").handleErrors({
 *  silent: false,
 *  sendEmail: true,
 *  screenCapture: true,
 *  mailTo: "services@smartface.io",
 *  consoleLog: true,
 *  vibrate: true,
 *  displayErrorDetails: false
 * });
 */
function handleErrors(options) {
    Application.onUnhandledError = onError;
    config = options || {};
    
    expect(config).to.be.an("object");
    expect(config).to.have.optional.property('silent').that.would.be.a('boolean');
    expect(config).to.have.optional.property('screenCapture').that.would.be.a('boolean');
    expect(config).to.have.optional.property('sendEmail').that.would.be.a('boolean');
    expect(config).to.have.optional.property('mailSubject').that.would.be.a('string');
    expect(config).to.have.optional.property('mailTo').that.would.be.a('string');
    expect(config).to.have.optional.property('consoleLog').that.would.be.a('boolean');
    expect(config).to.have.optional.property('vibrate').that.would.be.a('boolean');
    expect(config).to.have.optional.property('customAction').that.would.be.a('function');
    expect(config).to.have.optional.property('displayErrorDetails').that.would.be.a('boolean');
    
}

function onError(err) {
    if (typeof config.customAction === "function") {
        config.customAction(err);
    }
    var errorValue = err;
    if (typeof err === "object") {
        try {
            errorValue = JSON.stringify(err, null, "\t");
        }
        finally {}
    }
    else {
        errorValue = String(err);
    }
    if (config.consoleLog) {
        console.log(errorValue);
    }

    if (config.vibrate) {
        System.vibrate();
    }

    if (config.sendEmail && config.silent) {
        sendMail();
    }
    if (!config.silent) {
        var buttons = [{
            type: AlertView.Android.ButtonType.NEUTRAL,
            text: global.lang.ok || "OK"
        }];
        if (config.sendEmail) {
            buttons.push({
                type: AlertView.Android.ButtonType.POSITIVE,
                text: global.lang.sendEmail || "Send Email",
                onClick: sendMail
            });
        }
        var alertOptions = {
            title: global.lang.applicationError || "There has been an unhandled application error, please inform developers",
            buttons: buttons
        };
        if (config.displayErrorDetails)
            alertOptions.message = err.message +
            "\n\n•" + err.sourceURL +
            "\n•" + err.line +
            "\n•" + err.stack;
        else
            alertOptions.message = err.message;
        alert(alertOptions);
    }

    function sendMail() {
        const attachments = [];
        const to = config.mailTo || "";
        const subject = config.mailSubject || Application.smartfaceAppName + " " + (global.lang.error || "error");
        var imageFile, date = new Date(),
            stream, imageBlob, screenShot;
        if (config.screenCapture) {
            screenShot = Screen.capture();
            imageFile = new File({
                path: Path.DataDirectory + "/error " +
                    date.toISOString().replace(":", "-") + ".png"
            });
            stream = imageFile.openStream(FileStream.StreamType.WRITE, FileStream.ContentMode.BINARY);
            imageBlob = screenShot.compress(Image.Format.PNG, 80);
            stream.write(imageBlob);
            stream.close();
            attachments.push(imageFile);
        }
        var bodyLines = [];
        bodyLines.push("• Application Name:\t" + Application.smartfaceAppName);
        bodyLines.push("• Application id:\t" + Application.packageName);
        bodyLines.push("• Version:\t\t" + Application.version);
        config.screenCapture && bodyLines.push("• Screenshot attached");
        bodyLines.push();
        bodyLines.push();
        bodyLines.push(errorValue);

        sendMail({
            to: to,
            subject: subject,
            attachments: attachments,
            body: bodyLines.join("\n"),
            isHTML: false
        });
    }
}