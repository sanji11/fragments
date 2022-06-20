// src/routes/api/getById.js
const logger = require('../../logger');
//node path module: https://nodejs.org/api/path.html
const path = require('node:path');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Gets an authenticated user's fragment data (i.e., raw binary data) with the given id
 * Only supporting 'text/plain' type
 */
module.exports = async (req, res) => {
  //Get the id of the fragment
  var fullId = req.params.id;
  //look for extension if given with the id and remove it to get the id
  var extension = path.extname(fullId);
  logger.debug({ extension }, 'Got extension');
  if (extension) {
    fullId = fullId.substr(0, fullId.indexOf('.'));
  }
  logger.debug({ fullId }, 'Got ID');

  //Get the fragment if there's no extension or if the extension exits, it is .txt since the only supporting type now is 'text/plain'
  if (!extension || extension === '.txt') {
    try {
      const fragment = await Fragment.byId(req.user, fullId);
      logger.info({ fragment }, 'Got fragment');
      const fragmentData = await fragment.getData();
      logger.info({ fragmentData }, 'Got fragment data');
      res.setHeader('Content-type', fragment.type);
      res.status(200).send(fragmentData);
    } catch (error) {
      //If the id does not represent a known fragment, returns an HTTP 404 with an appropriate error message.
      logger.error({ error }, `Fragment with ${fullId} does not exist`);
      res.status(404).json(createErrorResponse(404, `Fragment with ${fullId} does not exist`));
    }
  } else {
    //If unsupported type of extension, returns an HTTP 415 with an appropriate error message.
    logger.error({ extension }, `Unsupported fragment type`);
    res
      .status(415)
      .json(createErrorResponse(415, `unsupported fragment type; got extension=${extension}`));
  }
};
