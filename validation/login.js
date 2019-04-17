const Validator = require('validator');
const isEmpty = require('./is-empty');

module.exports = function validateLoginInput(data) {
    let errors = {};

    data.email = !isEmpty(data.email) ? data.email : '';
    data.password = !isEmpty(data.password) ? data.password : '';

    if (Validator.isEmpty(data.email)) {
        errors.email = "Email must NOT be empty";
    }
    if (!Validator.isEmail(data.email)) {
        errors.email = "Email is INVALID";
    }
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password must NOT be empty";
    }

    return {
        errors: errors,
        isValid: isEmpty(errors)
    }
}