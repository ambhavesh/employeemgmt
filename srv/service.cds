namespace employeemgmt.srv.service;

using {employeemgmt.db.schema as db} from '../db/schema';


service MyService @(path: '/odata') {

    entity EMPLOYEE as projection on db.EMPLOYEE;
    entity ADMIN    as projection on db.ADMIN;
    entity TILE     as projection on db.TILE;
    entity HRMS as projection on db.HRMS;
    entity VENDOR as projection on db.VENDOR;

    @open
    type object {};

    action loginEmployee(EMP_NAME : String, PASSWORD : String)                        returns object;
    action loginAdmin(ADMIN_NAME : String, PASSWORD : String)                         returns object;
    action CHANGE_EMP_PWD(USER_NAME : String, CURRENT_PWD : String, NEW_PWD : String) returns object;

    action MassUpdateEmployee(EMPLOYEES : array of {
        EMP_ID : Integer;
        EMP_STATUS : Boolean;
        TILE_VISIBLITY : array of Integer;
    },
                              limit : Integer)                                        returns object;
}
