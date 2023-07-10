import Multer from "multer";
import util from "util";

let processFile = Multer({
    storage: Multer.memoryStorage(),
    limits: {fileSize: 5 * 1024 * 1024}
  }).single("file");
  
let processFileMiddleware = util.promisify(processFile);

export default processFileMiddleware;