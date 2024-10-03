const cds = require("@sap/cds");
const { getTileData, validateEmployee, validateAdmin } = require('../srv/utils/external');

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

    srv.on("loginEmployee", async (req) => {
        let { EMP_NAME, PASSWORD } = req.data;
        let target = EMPLOYEE;
        let tileData = await getTileData(srv, target, req);
        const validateUser = await validateEmployee(req, target);
        const aEmployee = await SELECT.from(EMPLOYEE).columns('EMP_ID', 'EMP_NAME', 'EMP_STATUS').where({ EMP_NAME, PASSWORD });
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

});