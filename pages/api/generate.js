import fs from 'fs-extra';
import archiver from 'archiver';
import replace from 'replace';

export default async (req, res) => {
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
        await fs.copy(`./templates/${templateStr}`, `${dir}/${key}`);

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
        replace({
            regex: "{{modid}}",
            replacement: data.modid,
            paths: [`${dir}/${key}`],
            recursive: true,
            silent: true,
        });
        replace({
            regex: "{{displayname}}",
            replacement: data.displayName,
            paths: [`${dir}/${key}`],
            recursive: true,
            silent: true,
        });
        if (data.credits.trim()) {
            replace({
                regex: "{{credits}}",
                replacement: `\ncredits="${data.credits}"`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        } else {
            replace({
                regex: "{{credits}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        }
        if (data.authors.trim()) {
            replace({
                regex: "{{authors}}",
                replacement: `\nauthors="${data.authors}"`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        } else {
            replace({
                regex: "{{authors}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        }

        replace({
            regex: "{{displayname}}",
            replacement: data.displayName,
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
        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-disposition', 'attachment; filename=FMDKB.zip');

        archive.pipe(res);
        archive.directory(`${dir}/${key}`, false);
        archive.finalize();
    }
}