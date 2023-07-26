"use strict";
/**
 * Remove old files, copy front-end ones.
 */
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
const fs_extra_1 = __importDefault(require("fs-extra"));
const jet_logger_1 = __importDefault(require("jet-logger"));
const child_process_1 = __importDefault(require("child_process"));
/**
 * Start
 */
(() => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Remove current build
        yield remove('./dist/');
        // Copy front-end files
        yield copy('./src/public', './dist/public');
        yield copy('./src/views', './dist/views');
        // Copy back-end files
        yield exec('tsc --build tsconfig.prod.json', './');
    }
    catch (err) {
        jet_logger_1.default.err(err);
    }
}))();
/**
 * Remove file
 */
function remove(loc) {
    return new Promise((res, rej) => {
        return fs_extra_1.default.remove(loc, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}
/**
 * Copy file.
 */
function copy(src, dest) {
    return new Promise((res, rej) => {
        return fs_extra_1.default.copy(src, dest, (err) => {
            return (!!err ? rej(err) : res());
        });
    });
}
/**
 * Do command line command.
 */
function exec(cmd, loc) {
    return new Promise((res, rej) => {
        return child_process_1.default.exec(cmd, { cwd: loc }, (err, stdout, stderr) => {
            if (!!stdout) {
                jet_logger_1.default.info(stdout);
            }
            if (!!stderr) {
                jet_logger_1.default.warn(stderr);
            }
            return (!!err ? rej(err) : res());
        });
    });
}
