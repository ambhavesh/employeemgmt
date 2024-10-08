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

entity VENDOR {
    key vendor_id   : Integer;  
    name            : String(100);  
    contact_email   : String(100);  
    contact_phone   : String(15);   
    address         : String(200);  
    city            : String(50);   
    country         : String(50);   
}

entity HRMS {
    key employee_id  : Integer;    
    name             : String(100);  
    email            : String(100);  
    phone            : String(15);  
    department       : String(50);   
    position         : String(50);   
    salary           : Decimal(10, 2);  
    hire_date        : Date;  
}
