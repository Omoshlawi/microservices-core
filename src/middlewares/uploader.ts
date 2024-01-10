import slugify from "slugify";
import multer from "multer";
import path from "path";
import fs from "fs";
import { Configuration } from "../types";

const uploader = (config: Configuration) => {
  const ensureFolderExists = (folderPath: string) => {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  };
  const diskFile = ({ dest }: { dest: string }) => {
    const storage = multer.diskStorage({
      destination: (req: any, file: any, cb: any) => {
        const destinationFolder = path.join(config.media?.root, dest);
        ensureFolderExists(destinationFolder);
        cb(null, destinationFolder);
      },
      filename: (req: any, file: any, cb: any) => {
        cb(
          null,
          slugify(config.name) +
            "-" +
            slugify(config.version) +
            "-" +
            Date.now() +
            "-" +
            slugify(file.originalname, { lower: true, trim: true })
        );
      },
    });

    return multer({ storage });
  };

  const memoryFile = () => {
    const storage = multer.memoryStorage();
    return multer({ storage });
  };

  return {
    diskFile,
    memoryFile,
  };
};

export default uploader;
