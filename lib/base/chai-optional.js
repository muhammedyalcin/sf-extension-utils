// based on
// https://stackoverflow.com/questions/25767676/how-to-test-an-optional-member-of-an-object

const chai = require('chai');
chai.use(function(chai, utils) {
    var Assertion = chai.Assertion,
        flag = utils.flag;

    var OPTIONAL_FLAG = 'chai-optional/option';
    Assertion.addProperty('optional', function() {
        flag(this, OPTIONAL_FLAG, true);
        return this;
    });

    Assertion.overwriteMethod('property', function(_super) {
        return function assertProperty(propertyName) {
            if (flag(this, OPTIONAL_FLAG)) {
                flag(this, OPTIONAL_FLAG, false);

                var obj = this._obj;
                var isPropertyPresent = (obj[propertyName]) ? true : false;

                if (isPropertyPresent) {
                    return _super.apply(this, arguments);
                }
            }
            else {
                _super.apply(this, arguments);
            }
        };
    });

    Assertion.addProperty('would', function() {
        return this;
    });
});
