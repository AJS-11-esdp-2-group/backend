"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const jet_validator_1 = require("jet-validator");
const inserturlparams_1 = __importDefault(require("inserturlparams"));
const server_1 = __importDefault(require("@src/server"));
const UserRepo_1 = __importDefault(require("@src/repos/UserRepo"));
const User_1 = __importDefault(require("@src/models/User"));
const HttpStatusCodes_1 = __importDefault(require("@src/constants/HttpStatusCodes"));
const UserService_1 = require("@src/services/UserService");
const FullPaths_1 = __importDefault(require("@src/routes/constants/FullPaths"));
// **** Variables **** //
// Paths
const { Get, Add, Update, Delete, } = FullPaths_1.default.Users;
// StatusCodes
const { OK, CREATED, NOT_FOUND, BAD_REQUEST, } = HttpStatusCodes_1.default;
// Dummy users for GET req
const DummyGetAllUsers = [
    User_1.default.new('Sean Maxwell', 'sean.maxwell@gmail.com'),
    User_1.default.new('John Smith', 'john.smith@gmail.com'),
    User_1.default.new('Gordan Freeman', 'gordan.freeman@gmail.com'),
];
// Dummy update user
const DummyUserData = {
    user: User_1.default.new('Gordan Freeman', 'gordan.freeman@gmail.com'),
};
// **** Tests **** //
describe('UserRouter', () => {
    let agent;
    // Run before all tests
    beforeAll((done) => {
        agent = supertest_1.default.agent(server_1.default);
        done();
    });
    // ** Get all users ** //
    describe(`"GET:${Get}"`, () => {
        const callApi = () => agent.get(Get);
        // Success
        it('should return a JSON object with all the users and a status code ' +
            `of "${OK}" if the request was successful.`, (done) => {
            // Add spy
            spyOn(UserRepo_1.default, 'getAll').and.resolveTo([...DummyGetAllUsers]);
            // Call API
            callApi()
                .end((_, res) => {
                expect(res.status).toBe(OK);
                for (let i = 0; i < res.body.users.length; i++) {
                    const user = res.body.users[i];
                    expect(user).toEqual(DummyGetAllUsers[i]);
                }
                done();
            });
        });
    });
    // Test add user
    describe(`"POST:${Add}"`, () => {
        const callApi = (reqBody) => agent
            .post(Add)
            .type('form').send(reqBody);
        // Test add user success
        it(`should return a status code of "${CREATED}" if the request was ` +
            'successful.', (done) => {
            // Spy
            spyOn(UserRepo_1.default, 'add').and.resolveTo();
            // Call api
            callApi(DummyUserData)
                .end((_, res) => {
                expect(res.status).toBe(CREATED);
                expect(res.body.error).toBeUndefined();
                done();
            });
        });
        // Missing param
        it('should return a JSON object with an error message of ' +
            `"${jet_validator_1.defaultErrMsg}" and a status code of "${BAD_REQUEST}" if the user ` +
            'param was missing.', (done) => {
            // Call api
            callApi({})
                .end((_, res) => {
                expect(res.status).toBe(BAD_REQUEST);
                expect(res.body.error).toBe(jet_validator_1.defaultErrMsg);
                done();
            });
        });
    });
    // ** Update users ** //
    describe(`"PUT:${Update}"`, () => {
        const callApi = (reqBody) => agent
            .put(Update)
            .type('form').send(reqBody);
        // Success
        it(`should return a status code of "${OK}" if the request was successful.`, (done) => {
            // Setup spies
            spyOn(UserRepo_1.default, 'update').and.resolveTo();
            spyOn(UserRepo_1.default, 'persists').and.resolveTo(true);
            // Call api
            callApi(DummyUserData)
                .end((_, res) => {
                expect(res.status).toBe(OK);
                expect(res.body.error).toBeUndefined();
                done();
            });
        });
        // Param missing
        it('should return a JSON object with an error message of ' +
            `"${jet_validator_1.defaultErrMsg}" and a status code of "${BAD_REQUEST}" if the user ` +
            'param was missing.', (done) => {
            // Call api
            callApi({})
                .end((_, res) => {
                expect(res.status).toBe(BAD_REQUEST);
                expect(res.body.error).toBe(jet_validator_1.defaultErrMsg);
                done();
            });
        });
        // User not found
        it('should return a JSON object with the error message of ' +
            `"${UserService_1.USER_NOT_FOUND_ERR}" and a status code of "${NOT_FOUND}" if the id ` +
            'was not found.', (done) => {
            // Call api
            callApi(DummyUserData)
                .end((_, res) => {
                expect(res.status).toBe(NOT_FOUND);
                expect(res.body.error).toBe(UserService_1.USER_NOT_FOUND_ERR);
                done();
            });
        });
    });
    // ** Delete user ** //
    describe(`"DELETE:${Delete}"`, () => {
        const callApi = (id) => agent
            .delete((0, inserturlparams_1.default)(Delete, { id }));
        // Success
        it(`should return a status code of "${OK}" if the request was successful.`, (done) => {
            // Setup spies
            spyOn(UserRepo_1.default, 'delete').and.resolveTo();
            spyOn(UserRepo_1.default, 'persists').and.resolveTo(true);
            // Call api
            callApi(5)
                .end((_, res) => {
                expect(res.status).toBe(OK);
                expect(res.body.error).toBeUndefined();
                done();
            });
        });
        // User not found
        it('should return a JSON object with the error message of ' +
            `"${UserService_1.USER_NOT_FOUND_ERR}" and a status code of "${NOT_FOUND}" if the id ` +
            'was not found.', (done) => {
            callApi(-1)
                .end((_, res) => {
                expect(res.status).toBe(NOT_FOUND);
                expect(res.body.error).toBe(UserService_1.USER_NOT_FOUND_ERR);
                done();
            });
        });
        // Invalid param
        it(`should return a status code of "${BAD_REQUEST}" and return an error ` +
            `message of "${jet_validator_1.defaultErrMsg}" if the id was not a valid number`, (done) => {
            callApi('horse')
                .end((_, res) => {
                expect(res.status).toBe(BAD_REQUEST);
                expect(res.body.error).toBe(jet_validator_1.defaultErrMsg);
                done();
            });
        });
    });
});
