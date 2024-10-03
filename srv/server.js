const cds = require("@sap/cds");
const cors = require('cors');
const cov2ap = require("@cap-js-community/odata-v2-adapter");
cds.on("bootstrap", function(app){
    app.use(cov2ap());
    app.use(cors());
});
module.exports = cds.server;