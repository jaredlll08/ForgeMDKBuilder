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
            regex: "{{forgeloader}}",
            replacement: data.forgeVersion.split("-")[1].split("\.")[0],
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
            regex: "{{group}}",
            replacement: data.group,
            paths: [`${dir}/${key}`],
            recursive: true,
            silent: true,
        });
        replace({
            regex: "{{archiveName}}",
            replacement: data.archiveName,
            paths: [`${dir}/${key}`],
            recursive: true,
            silent: true,
        });
        replace({
            regex: "{{vendor}}",
            replacement: `${data.vendor}`,
            paths: [`${dir}/${key}`],
            recursive: true,
            silent: true,
        });
        if (data.maven === "true") {

            replace({
                regex: "{{mavenplugin}}",
                replacement: `\napply plugin: 'maven-publish'`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{mavenversion}}",
                replacement: `\nif (System.getenv('BUILD_NUMBER') != null) {\nversion += "." + System.getenv('BUILD_NUMBER');\n}`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{mavenblock}}",
                replacement: `\n${await fs.readFileSync(`./templates/maven_${templateStr}.gradle`, `utf8`)}`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });

        } else {
            replace({
                regex: "{{mavenplugin}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{mavenversion}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
            replace({
                regex: "{{mavenblock}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        }
        if (data.loggingMarkers === "true") {
            replace({
                regex: "{{loggingmarkers}}",
                replacement: `\n            property 'forge.logging.markers', 'SCAN,REGISTRIES,REGISTRYDUMP'`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        } else {
            replace({
                regex: "{{loggingmarkers}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        }
        if (data.debugLogging === "true") {
            replace({
                regex: "{{debuglogging}}",
                replacement: `\n            property 'forge.logging.console.level', 'debug'`,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        } else {
            replace({
                regex: "{{debuglogging}}",
                replacement: ``,
                paths: [`${dir}/${key}`],
                recursive: true,
                silent: true,
            });
        }
        replace({
            regex: "{{description}}",
            replacement: `${data.description}`,
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
        res.setHeader('Content-disposition', `attachment; filename=${data.modid}-${data.mcVersion}-MDK.zip`);

        archive.pipe(res);
        archive.directory(`${dir}/${key}`, false);
        archive.finalize();
    }
}