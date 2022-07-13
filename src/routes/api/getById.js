// src/routes/api/getById.js
const logger = require('../../logger');
//node path module: https://nodejs.org/api/path.html
const path = require('node:path');
// node.js, the same, but with sugar: https://github.com/markdown-it/markdown-it
const md = require('markdown-it')();
// javascript content-type utility: https://www.npmjs.com/package/mime-types
const mime = require('mime-types');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Gets an authenticated user's fragment data (i.e., raw binary data) with the given id
 * Only supporting 'text/*' and 'application/json' type
 */
module.exports = async (req, res) => {
  //Get the id of the fragment
  var fullId = req.params.id;
  //look for extension if given with the id and remove it to get the id
  var extension = path.extname(fullId);
  logger.debug({ extension }, 'Got extension');
  if (extension) {
    var extensionType = mime.lookup(extension);
    fullId = fullId.substr(0, fullId.indexOf('.'));
  }
  logger.debug({ extensionType }, 'Got extension type');
  logger.debug({ fullId }, 'Got ID');

  //Get the fragment if there's no extension or if the extension exits, it is supported types (text/*, application/json)
  if (!extension || Fragment.isSupportedType(extensionType)) {
    try {
      const fragment = await Fragment.byId(req.user, fullId);
      logger.info({ fragment }, 'Got fragment');
      var fragmentData = await fragment.getData();
      logger.info({ fragmentData }, 'Got fragment data');
      var fragmentType = fragment.type;

      /** covert markdown to html (only supported conversion at this moment)*/
      //check if fragment.type is 'text/markdown' type and extension type is 'text/html'
      if (fragmentType === 'text/markdown' && extensionType === 'text/html') {
        fragmentType = extensionType;
        fragmentData = md.render(fragmentData.toString());
        logger.info({ fragmentData }, 'Converted fragment data');
        logger.info({ fragmentType }, 'Final fragment type');
        res.setHeader('Content-type', fragmentType);
        res.status(200).send(fragmentData);
      } else {
        // if there is no extension or extension is same as fragment type
        if (!extension || fragmentType == extensionType) {
          logger.info({ fragmentType }, 'Final fragment type');
          res.setHeader('Content-type', fragmentType);
          res.status(200).send(fragmentData);
        } else {
          //If the fragment cannot be converted to the requested type, returns an HTTP 415 with an appropriate error message.
          logger.error({ extensionType }, `Unable to convert fragment`);
          res
            .status(415)
            .json(
              createErrorResponse(
                415,
                `Unable to convert fragment; got extension type=${extensionType} and fragment original type=${fragment.type}`
              )
            );
        }
      }
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
