namespace employeemgmt.db.schema;

entity EMPLOYEE {
    key EMP_ID         : Integer;
        EMP_NAME       : String;
        PASSWORD       : String;
        MODULE         : String;
        EMAIL          : String;
        PHONE_NO       : Int64;
        EMP_COUNTRY    : String;
        EMP_STATUS     : Boolean;
        TILE_VISIBLITY : array of Integer;
};

entity ADMIN {
    key ADMIN_ID   : Integer;
        ADMIN_NAME : String;
        PASSWORD   : String;
};

entity TILE {
    key TILE_ID   : Integer;
        TILE_NAME : String;
        TILE_DESC : String;
}
