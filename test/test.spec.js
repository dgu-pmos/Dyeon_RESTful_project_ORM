var assert = require('assert');

var chai = require('chai');
var chaiHttp = require('chai-http');
var expect = chai.expect;
chai.use(chaiHttp);

const missParameter = require('../module/utils/missParameter');
const utils = require('../module/utils/utils');

const url = 'http://localhost:3000'


describe('module/missParameter Test', function () {
    it('missParameter function', function () {
        const test_string = missParameter({ title : undefined, content: undefined });
        assert.strictEqual('title,content', test_string);
    });
});

describe('module/utils Test', function () {
    it('successTrue function', function () {
        const test_string = utils.successTrue('test success', 'ok');
        assert.strictEqual(true, test_string.success);
    });
    it('successFalse function', function () {
        const test_string = utils.successFalse('test false');
        assert.strictEqual(false, test_string.success);
    });
});

describe('routes/auth/signup Test', function () {
    it('/local/signup success', function (done) {
        const data = {
            name : "mocha_user_1",
            email : "mocha_email_1",
            password : "mocha_password_1"
        };

        chai.request(url)
        .post('/auth/local/signup')
        .send(data)
        .end((err, res) => {
            expect(err).to.be.null;
            expect(res).to.have.status(200);
            done();
        });
    });

    it('/local/signup fail 1 (null)', function (done) {
        const data = {
            name : "mocha_email_1",
            email : "mocha_email_1"
        };

        chai.request(url)
        .post('/auth/local/signup')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('/local/signup fail 2 (already)', function (done) {
        const data = {
            name : "mocha_email_1",
            email : "mocha_email_1",
            password : "mocha_password_1"
        };

        chai.request(url)
        .post('/auth/local/signup')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });
});

describe('routes/auth/local/signin Test', function () {
    it('/local/signin fail 1 (incorrect id)', function (done) {
        const data = {
            email : "mocha_email_2",
            password : "mocha_password_1"
        };

        chai.request(url)
        .post('/auth/local/signin')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('/local/signin fail 2 (incorrect pw)', function (done) {
        const data = {
            email : "mocha_email_1",
            password : "mocha_password_2"
        };

        chai.request(url)
        .post('/auth/local/signin')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('/local/signin fail 3 (null)', function (done) {
        const data = {
            email : "mocha_email_1",
            password : "mocha_password_2"
        };

        chai.request(url)
        .post('/auth/local/signin')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });

    it('/local/signin success', function (done) {
        const data = {
            email : "mocha_email_1",
            password : "mocha_password_1"
        };

        chai.request(url)
        .post('/auth/local/signin')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(200);
            done();
        });
    });

    it('/local/signin fail 4 (already)', function (done) {
        const data = {
            email : "mocha_email_1",
            password : "mocha_password_1"
        };

        chai.request(url)
        .post('/auth/local/signin')
        .send(data)
        .end((err, res) => {
            expect(res).to.have.status(400);
            done();
        });
    });
});


