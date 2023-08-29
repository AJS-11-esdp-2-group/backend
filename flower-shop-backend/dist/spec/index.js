"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const find_1 = __importDefault(require("find"));
const jasmine_1 = __importDefault(require("jasmine"));
const ts_command_line_args_1 = require("ts-command-line-args");
const jet_logger_1 = __importDefault(require("jet-logger"));
// **** Setup **** //
// ** Init ** //
// NOTE: MUST BE FIRST!! Load env vars
const result2 = dotenv_1.default.config({
    path: './env/test.env',
});
if (result2.error) {
    throw result2.error;
}
// Setup command line options. 
const args = (0, ts_command_line_args_1.parse)({
    testFile: {
        type: String,
        defaultValue: '',
    },
});
// ** Start Jasmine ** //
// Init Jasmine
const jasmine = new jasmine_1.default();
jasmine.exitOnCompletion = false;
// Set location of test files
jasmine.loadConfig({
    random: true,
    spec_dir: 'spec',
    spec_files: [
        './tests/**/*.spec.ts',
    ],
    stopSpecOnExpectationFailure: false,
});
// Run all or a single unit-test
let execResp;
if (args.testFile) {
    const testFile = args.testFile;
    find_1.default.file(testFile + '.spec.ts', './spec', (files) => {
        if (files.length === 1) {
            jasmine.execute([files[0]]);
        }
        else {
            jet_logger_1.default.err('Test file not found!');
        }
    });
}
else {
    execResp = jasmine.execute();
}
// Wait for tests to finish
(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!!execResp) {
        const info = yield execResp;
        if (info.overallStatus === 'passed') {
            jet_logger_1.default.info('All tests have passed :)');
        }
        else {
            jet_logger_1.default.err('At least one test has failed :(');
        }
    }
}))();
