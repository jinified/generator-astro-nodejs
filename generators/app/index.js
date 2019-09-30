const Generator = require('yeoman-generator');
const urlJoin = require('url-join');
const yosay = require('yosay');
const path = require('path');
const mkdirp = require('mkdirp');
const fs = require('fs');

module.exports = class extends Generator {
  constructor(args, opts) {
    super(args, opts);

    // Process argument
    this.props = {};

    console.log(yosay('Welcome to Astro NodeJS generator!'));
  }

  propmting() {
    const done = this.async();
    const that = this;

    this.prompt([
      {
        type: 'list',
        name: 'kind',
        message: 'What kind of project do you want to create?',
        choices: [
          { name: 'Service (ExpressJS)', value: 'service' }
        ],
        default: that.config.get('service') || 'service'
      },
      {
        type: 'input',
        name: 'name',
        message: 'What is your project name?',
        default: that.config.get('name') || 'astro',
        validate: value => value !== undefined && value !== ''
      },
      {
        type: 'list',
        name: 'sequelize',
        message: 'You want to use sequelize?',
        choices: [
          { name: 'yes', value: 'y' },
          { name: 'no', value: 'n' }
        ],
        default: that.config.get('sequelize') || 'n'
      },
      {
        type: 'input',
        name: 'apibase',
        message: 'Your API base path?',
        default: that.config.get('apibase') || 'api',
        validate: value => value !== undefined && value !== ''
      },
      {
        type: 'input',
        name: 'apiversion',
        message: 'Your API version?',
        default: that.config.get('apiversion') || 'v1',
        validate: value => value !== undefined && value !== ''
      },
      {
        type: 'input',
        name: 'port',
        message: 'Your service port?',
        default: that.config.get('port') || '5000',
        validate: (value) => {
          const regex = new RegExp(/[0-9]/g);
          return regex.test(value);
        }
      },
      {
        type: 'input',
        name: 'version',
        message: 'Version number',
        default: that.config.get('version') || '1.0.0',
        validate: value => value !== undefined && value !== ''
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        default: that.config.get('description') || 'This project generated using Astro NodeJS Generator'
      },
      {
        type: 'input',
        name: 'author',
        message: `Author's name`,
        default: that.config.get('author') || 'Jin'
      },
      {
        type: 'input',
        name: 'license',
        message: `License`,
        default: 'MIT'
      }
    ]).then((answers) => {
      this.props = answers;
      done();
    });
  }

  writing() {
    const { props } = this;
    const copy = this.fs.copy.bind(this.fs);
    const copyTpl = this.fs.copyTpl.bind(this.fs);
    const tPath = this.templatePath.bind(this);
    const dPath = this.destinationPath.bind(this);

    this.destinationRoot(props.name);
    props.src = props.kind === 'fullstack' ? 'src/server' : 'src';
    props.root = 'src';
    props.apiPath = urlJoin(props.src, props.apibase);
    [, props.servicename] = props.name.split('-');

    /**
     * Etc
     */
    copy(tPath('_.gitignore'), dPath('.gitignore'));
    copyTpl(tPath('_.eslintrc.ejs'), dPath('.eslintrc'), props);
    copyTpl(tPath('_README.md'), dPath('README.md'), props);
    copyTpl(tPath('_.env.example'), dPath('.env.example'), props);
    copyTpl(tPath('_.env.example'), dPath('.env'), props);
    copyTpl(tPath('jest.json'), dPath('jest.json'), props);
    copyTpl(tPath('jsconfig.json.ejs'), dPath('jsconfig.json'), props);

    /**
     * License
     */
    if (props.license === 'MIT') {
      copyTpl(tPath('_LICENSE'), dPath('LICENSE'), props);
    }

    /**
     * index.js
     */
    copyTpl(tPath('src/index.ejs'), dPath(urlJoin(props.src, 'index.js')), props);

    /**
     * boot folder
     */
    copy(tPath('src/boot/startup'), dPath(urlJoin(props.src, 'boot/startup')));
    copyTpl(tPath('src/boot/index.ejs'), dPath(urlJoin(props.src, 'boot/index.js')), props);

    /**
     * api folder
     */
    mkdirp.sync(path.join(this.destinationPath(), urlJoin(props.src, props.apibase)));
    copyTpl(tPath(`src/api/_index.ejs`), dPath(urlJoin(props.apiPath, 'index.js')), props);
    copy(tPath(`src/api/apiversion/index.js`), dPath(urlJoin(props.apiPath, props.apiversion, 'index.js')));

    /**
     * config folder
     */
    copyTpl(tPath('src/config/_express.ejs'), dPath(urlJoin(props.src, 'config', 'express.js')), props);
    copyTpl(tPath('src/config/vars.js'), dPath(urlJoin(props.src, 'config', 'vars.js')), props);


    /**
     * utils
     */
    copy(tPath('src/utils/APIError'), dPath(urlJoin(props.src, 'utils', 'APIError')));
    copy(tPath('src/utils/logger'), dPath(urlJoin(props.src, 'utils', 'logger')));
    copy(tPath('src/utils/helper'), dPath(urlJoin(props.src, 'utils', 'helper')));

    /**
     * middlewares
     */
    copy(tPath('src/middlewares/auth'), dPath(urlJoin(props.src, 'middlewares', 'auth')));
    copy(tPath('src/middlewares/error'), dPath(urlJoin(props.src, 'middlewares', 'error')));
    copy(tPath('src/middlewares/monitoring'), dPath(urlJoin(props.src, 'middlewares', 'monitoring')));


    /**
     * services
     */
    copy(tPath('src/services'), dPath(urlJoin(props.src, 'services')));

    copyTpl(tPath('_package.json.ejs'), dPath('package.json'), props);

    /**
     * Bitbucket
     */
    copyTpl(tPath('_bitbucket-pipelines.yml'), dPath('bitbucket-pipelines.yml'), props);

    /**
     * Docker
     */
    copyTpl(tPath('Dockerfile'), dPath('Dockerfile'), props);
    copyTpl(tPath('_docker-compose.yml'), dPath('docker-compose.yml'), props);
    copyTpl(tPath('_docker-compose.dev.yml'), dPath('docker-compose.dev.yml'), props);
    copyTpl(tPath('_docker-compose.test.yml'), dPath('docker-compose.test.yml'), props);
    copyTpl(tPath('_docker-compose.prod.yml'), dPath('docker-compose.prod.yml'), props);

    /**
     * Helm
     */
    mkdirp.sync(path.join(this.destinationPath(), urlJoin('helm', props.name, 'templates')));
    copyTpl(tPath('helm/_prod.yaml'), dPath('helm/prod.yaml'), props);
    copyTpl(tPath('helm/_dev.yaml'), dPath('helm/dev.yaml'), props);
    copyTpl(tPath('helm/_staging.yaml'), dPath('helm/staging.yaml'), props);
    copyTpl(tPath(urlJoin('helm', 'service/_Chart.yaml')), dPath(urlJoin('helm', props.name, 'Chart.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/_values.yaml')), dPath(urlJoin('helm', props.name, 'values.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/templates/_controller-hpa.yaml')), dPath(urlJoin('helm', props.name, 'templates/controller-hpa.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/templates/_deployment.yaml')), dPath(urlJoin('helm', props.name, 'templates/deployment.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/templates/_ingress.yaml')), dPath(urlJoin('helm', props.name, 'templates/ingress.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/templates/_service.yaml')), dPath(urlJoin('helm', props.name, 'templates/service.yaml')), props);
    copyTpl(tPath(urlJoin('helm', 'service/templates/__helpers.tpl')), dPath(urlJoin('helm', props.name, 'templates/_helpers.yaml')), props);


    if (props.sequelize === 'y') {
      mkdirp.sync(path.join(this.destinationPath(), urlJoin(props.src, 'database', 'migrations')));
      mkdirp.sync(path.join(this.destinationPath(), urlJoin(props.src, 'database', 'seeders')));
      copyTpl(tPath('.sequelizerc'), dPath('.sequelizerc'), props);
      copyTpl(tPath('src/config/database.js'), dPath(urlJoin(props.src, 'config', 'database.js')), props);
      copyTpl(tPath('src/models/index.js'), dPath(urlJoin(props.src, 'models', 'index.js')), props);
    }

    this.config.save();

    this.on('end', () => {
      this.config.set('name', props.name);
      this.config.set('apibase', props.apibase);
      this.config.set('apiversion', props.apiversion);
      this.config.set('version', props.version);
      this.config.set('description', props.description);
      this.config.set('author', props.author);
      this.config.set('src', props.src);
      this.config.set('kind', props.kind);
      this.config.set('servicename', props.servicename);
    });
  }

  install() {
    this.installDependencies({ bower: false });
  }
};
