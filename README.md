[![GitHub license](https://img.shields.io/github/license/andremaravilha/miplib2017-info-downloader)](https://github.com/andremaravilha/miplib2017-info-downloader/blob/master/LICENSE) 
![Lines of code](https://img.shields.io/tokei/lines/github/andremaravilha/miplib2017-info-downloader) 
![GitHub repo size](https://img.shields.io/github/repo-size/andremaravilha/miplib2017-info-downloader) 

# MIPLIB 2017 Info Downloader
A tiny app (and library) to obtain information from [MIPLIB 2017](https://miplib.zib.de/) instances in an easy way.

MIPLIB 2017 is a standard test set used to compare the performance of mixed integer optimizers


## Features
- Download MIPLIB 2017 instance files.
- Export instance data to JSON and CSV files.
- Get instance data in JavaScript/Node.js programs.

## Quick Start

### Using as a command line app

The quickest way to use MIPLIB 2017 Info Downloader is to utilize the executable to export MIPLIB 2017 instances to JSON and CSV files and to download the instance files.

Before installing, download and install Node.js. Then, install the executable (administrator or super-user privileges may be required):

```console
npm install -g @andre.maravilha/miplib2017-info-downloader
```

To export the instance data to JSON (`miplib2017.json`) and CSV (`miplib2017.csv`) files, run the command:

```console
miplib2017-downloader
```

To export to only one of the formats, the parameters `--json-only` or `--csv-only` can be used. For example:

```console
miplib2017-downloader --json-only
```

To download the instance files, use the parameter `--download <PATH>`. For example:

```console
miplib2017-downloader --json-only --download files
```

### Using as a Node.js library

Install the MIPLIB 2017 Info Downloader as a dependency on your project:

```console
npm install --save @andre.maravilha/miplib2017-info-downloader
```

Import and use the library in your project:

```js
const MIPLIB2017Info = require('@andre.maravilha/miplib2017-info-downloader');

for (let instance of MIPLIB2017Info.instances) {
    MIPLIB2017Info.getInstanceInfo(instance)
        .then((info) => {
            let name = info.name;
            let nVarOrig = info.size.variables.original;
            let nVarPre = info.size.variables.presolved;
            let nConstrOrig = info.size.constraints.original;
            let nConstrPre = info.size.constraints.presolved;
            
            console.log(`Instance: ${name}`);
            console.log(`Variables: ${nVarOrig} (original), ${nVarPre} (presolved)`);
            console.log(`Constraints: ${nConstrOrig} (original), ${nConstrPre} (presolved)`);
            console.log('');

        }).catch((e) => {
            const message = `Failed to get information from instance "${name}."\nError: ${e.message}`;
            console.log(message);
        });
}
```


## License

MIT
