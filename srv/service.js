const cds = require("@sap/cds");
const { getTileData, validateEmployee, validateAdmin, sendEmail } = require('../srv/utils/external');
const nodemailer = require('nodemailer');

module.exports = (srv => {
    let { EMPLOYEE, ADMIN, TILE } = srv.entities;

    srv.before("CREATE", EMPLOYEE, async (req) => {
        let db = await cds.connect.to('db');
        let tx = db.tx(req);
        try {
            let sQuery = `SELECT MAX(EMP_ID) AS COUNT FROM ${EMPLOYEE}`;
            let employeeTable = await tx.run(sQuery);
            employeeTable[0].COUNT = employeeTable[0].COUNT + 1;
            req.data.EMP_ID = employeeTable[0].COUNT;
        } catch (error) {
            console.log(error);
        }
    });

    srv.before("CREATE", ADMIN, async (req) => {
        let db = await cds.connect.to('db');
        let tx = db.tx(req);
        try {
            let sQuery = `SELECT MAX(ADMIN_ID) AS COUNT FROM ${ADMIN}`;
            let adminTable = await tx.run(sQuery);
            adminTable[0].COUNT = adminTable[0].COUNT + 1;
            req.data.ADMIN_ID = adminTable[0].COUNT;
        } catch (error) {
            console.log(error);
        }
    });

    // srv.on("loginEmployee", async (req) => {
    //     let { EMP_NAME, PASSWORD } = req.data;
    //     let target = EMPLOYEE;
    //     let tileData = await getTileData(srv, target, req);
    //     const validateUser = await validateEmployee(req, target);
    //     const aEmployee = await SELECT.from(EMPLOYEE).columns('EMP_ID', 'EMP_NAME', 'EMAIL', 'MODULE', 'PHONE_NO','EMP_COUNTRY', 'EMP_STATUS').where({ EMP_NAME, PASSWORD });
    //     if (aEmployee.length === 0) {
    //         var errCode = 404,
    //             errMsg = 'User not found';
    //         if (validateUser.IsUserValid === false) {
    //             errMsg = 'Username is incorrect, please enter correct username';
    //             errCode = 400;
    //         }
    //         if (validateUser.IsPasswordValid === false) {
    //             errMsg = `Password is incorrect, please enter correct password`;
    //             errCode = 400;
    //         }
    //         if (validateUser.IsUserValid === false && validateUser.IsPasswordValid === false) {
    //             errMsg = 'User not found';
    //             errCode = 404;
    //         }
    //         req.error(errCode, errMsg);
    //         return;
    //     } else if (aEmployee[0].EMP_STATUS === false) {
    //         errMsg = `User is not active`;
    //         req.error(403, errMsg);
    //         return;
    //     } else {
    //         aEmployee[0].TILE = tileData;
    //         var oEmployee = {
    //             "status": 200,
    //             "message": "Login successfully!!",
    //             "results": aEmployee
    //         };
    //         let { res } = req.http;
    //         res.send(oEmployee);
    //     }
    // });




    // Email Verify
    srv.on("loginEmployee", async (req) => {
        let { EMP_NAME, PASSWORD } = req.data;
        let target = EMPLOYEE;
        let tileData = await getTileData(srv, target, req);
        const validateUser = await validateEmployee(req, target);
        const aEmployee = await SELECT.from(EMPLOYEE).columns('EMP_ID', 'EMP_NAME', 'EMAIL', 'MODULE', 'PHONE_NO', 'EMP_COUNTRY', 'EMP_STATUS').where({ EMP_NAME, PASSWORD });
        if (aEmployee.length === 0) {
            var errCode = 404,
                errMsg = 'User not found';
            if (validateUser.IsUserValid === false) {
                errMsg = 'Username is incorrect, please enter correct username';
                errCode = 400;
            }
            if (validateUser.IsPasswordValid === false) {
                errMsg = `Password is incorrect, please enter correct password`;
                errCode = 400;
            }
            if (validateUser.IsUserValid === false && validateUser.IsPasswordValid === false) {
                errMsg = 'User not found';
                errCode = 404;
            }
            req.error(errCode, errMsg);
            return;
        } else if (aEmployee[0].EMP_STATUS === false) {
            errMsg = `User is not active`;
            req.error(403, errMsg);
            return;
        } else {
            await sendEmail(aEmployee);
            aEmployee[0].TILE = tileData;
            var oEmployee = {
                "status": 200,
                "message": "Login successfully!!",
                "results": aEmployee
            };
            let { res } = req.http;
            res.send(oEmployee);

        }
    });

    srv.on("loginAdmin", async (req) => {
        let { ADMIN_NAME, PASSWORD } = req.data;
        let target = ADMIN;
        const validatedAdmin = await validateAdmin(req, target);
        const aAdmin = await SELECT.from(ADMIN).columns('ADMIN_ID', 'ADMIN_NAME', 'PASSWORD').where({ ADMIN_NAME, PASSWORD });
        if (aAdmin.length === 0) {
            var errCode = 404,
                errMsg = 'User not found';
            if (validatedAdmin.IsAdminValid === false) {
                errMsg = 'Username is incorrect, please enter correct username';
                errCode = 400;
            }
            if (validatedAdmin.IsPasswordValid === false) {
                errMsg = `Password is incorrect, please enter correct password`;
                errCode = 400;
            }
            if (validatedAdmin.IsAdminValid === false && validatedAdmin.IsPasswordValid === false) {
                errMsg = 'User not found';
                errCode = 404;
            }
            req.error(errCode, errMsg);
            return;
        } else {
            var oAdmin = {
                "status": 200,
                "message": "Login successfully!!",
                "results": aAdmin
            };
            let { res } = req.http;
            res.send(oAdmin);
        }
    });

    srv.on("CHANGE_EMP_PWD", async (req) => {
        let db = await cds.connect.to('db');
        let tx = db.tx();
        try {
            let { USER_NAME, CURRENT_PWD, NEW_PWD } = req.data;
            const whereCondition = `EMP_NAME='${USER_NAME}' AND PASSWORD='${CURRENT_PWD}'`;
            const aEmployee = await SELECT.from(EMPLOYEE).columns('EMP_ID', 'EMP_NAME', 'PASSWORD').where(whereCondition);
            var oEmployee = aEmployee[0];
            if (oEmployee.EMP_NAME === USER_NAME && oEmployee.PASSWORD === CURRENT_PWD) {
                oEmployee.PASSWORD = NEW_PWD;
                const updateEmployee = await tx.update(EMPLOYEE, oEmployee.EMP_ID).with(oEmployee);
                var oUpdateUser = {
                    "status": 200,
                    "message": "Password changed successfully!!",
                    "results": updateEmployee
                };
                tx.commit();
                let { res } = req.http;
                res.send(oUpdateUser);
            } req.error(400, 'Current password is incorrect');
        } catch (error) {
            console.log(error);
        }

    });

    srv.on("MassUpdateEmployee", async (req, limit) => {
        limit = 100;
        let db = await cds.connect.to('db');
        let tx = db.tx(req);
        try {
            let { EMPLOYEES } = req.data;
            if (EMPLOYEES.length === 0) {
                req.error(400, "Please select employees to update");
            }
            else if (EMPLOYEES.length > limit) {
                req.error(429, "Maximum limit exceeded");
            }
            else {
                for (var e in EMPLOYEES) {
                    const iEmpId = EMPLOYEES[e].EMP_ID;
                    const aEmployee = await SELECT.from(EMPLOYEE).columns('EMP_STATUS', 'TILE_VISIBLITY').where(`EMP_ID=${iEmpId}`);
                    aEmployee[0].EMP_STATUS = EMPLOYEES[e].EMP_STATUS;
                    aEmployee[0].TILE_VISIBLITY = EMPLOYEES[e].TILE_VISIBLITY;
                    await tx.update(EMPLOYEE, iEmpId).with(aEmployee[0]);
                    //  tx.commit();
                }
                const updatedEmpStatus = {
                    "status": 202,
                    "message": "Employees updated successfully"
                };
                let { res } = req.http;
                res.send(updatedEmpStatus)
            }
        } catch (error) {
            await tx.rollback(error);
            console.log(error);
        }

    });
});