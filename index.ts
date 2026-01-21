import * as OTPAuth from "otpauth";
import QRCode from "qrcode";

let totp = new OTPAuth.TOTP({
    label: "OTP Testing",
    issuer: "MyTestingProject",
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: new OTPAuth.Secret()
});

let qr = "";

const displayQRCode = async (otp: OTPAuth.TOTP) => {
    const key = otp.toString();
    qr = await QRCode.toString(key, { type: 'terminal', small: true });
}

await displayQRCode(totp);

let currentCode = totp.generate();

const update = () => {
    currentCode = totp.generate();
    console.clear();
    const remaining = totp.period - Math.floor((Date.now() / 1000) % totp.period);
    console.log("Current OTP code:", currentCode);
    console.log(`New code in: ${remaining} seconds`);
    console.log("[" + "=".repeat(remaining) + "-".repeat(totp.period - remaining) + "]");
    console.log("\n-------------------------------\n");
    console.log("Scan this QR code with your authenticator app:");
    console.log(qr);
}

update();

setInterval(() => {
    update();
    if (totp.validate({
        token: currentCode,
        window: 1
    }) === null) {
        throw new Error("OTP code validation failed!");
    }
}, 1000);

process.on('SIGINT', () => {
    console.clear();
    console.log("Exiting OTP generator. Goodbye!");
    process.exit();
})
