const credentials = require("./config/mysql_credentials.js");

module.exports = {

    development: {
      client: 'mysql2',
      connection: {
        host:     credentials.host,
        database: credentials.database,
        user:     credentials.user,
        password: credentials.password
      }
    }
  };