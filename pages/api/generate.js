import fs from 'fs';
import ncp from 'ncp';
import archiver from 'archiver';
import replace from 'replace';


ncp.limit = 16;

export default (req, res) => {
    if (req.method === 'POST') {
        let data = req.body;
        let key = data.id;
        let dir = "./tmp";
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        if (!fs.existsSync(`${dir}/${key}`)) {
            fs.mkdirSync(`${dir}/${key}`);
        }
        let mcVersions = data.mcVersion.split(".");
        let templateStr = mcVersions[0] + "." + mcVersions[1];
        ncp(`./templates/${templateStr}`, `${dir}/${key}`, function (err) {
            if (err) {
                return console.error(err);
            }
            replace({
                regex: "{{mcpversiontype}}",
                replacement: data.mcpVersionType,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{mcpversion}}",
                replacement: data.mcpVersion,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{forgeversion}}",
                replacement: data.forgeVersion,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            let archive = archiver('zip', {
                zlib: {level: 9}
            });

            archive.on('error', function (err) {
                throw err;
            });

            archive.directory(`${dir}/${key}`, false);
            res.setHeader('Content-Type', 'application/zip')
            archive.pipe(res);
            archive.finalize();
        });


    }
}