import Multer from 'multer';
import util from 'util';

const processFile = Multer({
  storage: Multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
}).single('image_small');

const processFileMiddleware = util.promisify(processFile);

export default processFileMiddleware;