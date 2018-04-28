const Model = require("objection").Model;

class User extends Model {
    static get tableName() {
        return "users";
    }

    static get jsonSchema() {
        return {
            type: "object",
            required: ["username", "password"],

            properties: {
                id: {type: 'integer'},
                username: {type: 'string', minLength: 1, maxLength: 255},
                password: {type: 'string', minLength: 1, maxLength: 255},
                email: {type: 'string', minlength: 1, maxLength: 255}
            }
        }
    }
}

module.exports = User;