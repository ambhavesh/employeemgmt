const cds = require("@sap/cds");
const nodemailer = require('nodemailer');

const getTileData = async (srv, target, req) => {
    let aTile = [];
    let { EMP_NAME, PASSWORD } = req.data;
    const aTiles = await SELECT.from(target).where({ EMP_NAME, PASSWORD });
    if (aTiles.length === 0) {
        return aTile;
    } else {
        var aVisibleTile = aTiles[0].TILE_VISIBLITY;
        for (var t in aVisibleTile) {
            let tileId = aVisibleTile[t];
            let tile = await SELECT.from(srv.entities.TILE).where(`TILE_ID=${tileId}`);
            let oTileObj = tile[tile.length - 1];
            aTile.push(oTileObj);
        }
        return aTile;
    }
}

const getEmployeeData = async (target, value) => {
    let db = await cds.connect.to('db');
    let tx = db.tx();
    try {
        return await tx.run(SELECT.from(target).columns('EMP_NAME', 'PASSWORD').where(`EMP_NAME='${value}'`));
    } catch (error) {
        console.log(error);
    }
}

const validateEmployee = async (req, target) => {
    var bCorrectUser,
        bCorrectPassword;
    let { EMP_NAME, PASSWORD } = req.data;
    let aUserDetails = await getEmployeeData(target, EMP_NAME);
    if (aUserDetails.length === 0) {
        bCorrectUser = false;
    } else {
        bCorrectUser = aUserDetails[0].EMP_NAME === EMP_NAME ? true : false;
        bCorrectPassword = aUserDetails[0].PASSWORD === PASSWORD ? true : false;
    }
    var oValidatedEmployee = {
        "IsUserValid": bCorrectUser,
        "IsPasswordValid": bCorrectPassword
    };
    return oValidatedEmployee
}

const getAdminData = async (target, value) => {
    let db = await cds.connect.to('db');
    let tx = db.tx();
    try {
        return await tx.run(SELECT.from(target).columns('ADMIN_NAME', 'PASSWORD').where(`ADMIN_NAME='${value}'`));
    } catch (error) {
        console.log(error);
    }
}

const validateAdmin = async (req, target) => {
    var bCorrectUser,
        bCorrectPassword;
    let { ADMIN_NAME, PASSWORD } = req.data;
    let aUserDetails = await getAdminData(target, ADMIN_NAME);
    if (aUserDetails.length === 0) {
        bCorrectUser = false;
    } else {
        bCorrectUser = aUserDetails[0].ADMIN_NAME === req.data.ADMIN_NAME ? true : false;
        bCorrectPassword = aUserDetails[0].PASSWORD === PASSWORD ? true : false;
    }
    var oValidatedAdmin = {
        "IsAdminValid": bCorrectUser,
        "IsPasswordValid": bCorrectPassword
    };
    return oValidatedAdmin
}

const sendEmail = async (aEmployee) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER,    // Email address
            pass: 'xokr mmyq zvmm sbgt'     // Email password or app-specific password
        }
    });


    const mailInfo = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: 'patelkurvesh8866@gmail.com',
        cc: 'sonalsarkar799@gmail.com',
        subject: `Logged in user verification.`,
        text: `Thank you for logging in, you are an authorized user ${aEmployee[0].EMP_NAME}`,
        html: `<p>Thank you for logging in, you are an authorized user <b>${aEmployee[0].EMP_NAME}</b>.</p>`,
        attachments: [{
            filename: 'Bhavesh_SAP_5+.pdf',
            path: '/home/user/projects/employeemgmt/files/Bhavesh_SAP_5+.pdf'

        }]
    });
    console.log(`Mail sent`, mailInfo.messageId);
}

exports.getTileData = getTileData;
exports.validateEmployee = validateEmployee;
exports.validateAdmin = validateAdmin;
exports.sendEmail = sendEmail;