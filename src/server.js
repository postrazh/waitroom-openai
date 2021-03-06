const express = require('express');
const logger = require('morgan');

const APIController = require('./controllers/api');
const OpenAIService = require('./services/oai-service');

class Server {
  app = null;
  openaiService = null;

  constructor() {
    this.configureServer();
  }

  configureServer() {
    this.app = express();

    this.app.use(logger('dev'))
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    this.app.get('/', async (req, res) => {
      res.send('OK');
    })

    // Create OpenAIService
    this.openaiService = new OpenAIService();

    // Configure API controllers
    this.configureControllers();

    // error handler
    this.app.use(function (err, req, res, next) {
      // set locals, only providing error in development
      res.locals.message = err.message
      res.locals.error = req.app.get('env') === 'development' ? err : {}

      // render the error page
      res.status(err.status || 500)
      res.send({
        error: err.toString()
      })
    })
  }

  configureControllers() {
    this.app.use('/api', new APIController(this.openaiService).router);
  }
}

module.exports = Server;