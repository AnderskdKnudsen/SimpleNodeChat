
exports.up = function(knex, Promise) {
    return knex.schema
      .alterTable("users", table =>{
          table.string("email").unique();
      });
  };
  
  exports.down = function(knex, Promise) {
      return knex.schema
          .alterTable("users", table => {
              table.dropColumn("email");
          });
  };
  