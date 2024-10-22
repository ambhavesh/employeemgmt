const cds = require("@sap/cds");
const cors = require('cors');
const cov2ap = require("@cap-js-community/odata-v2-adapter");
cds.on("bootstrap", function (app) {
    app.use([cors(), cov2ap()]);
});
module.exports = cds.server;