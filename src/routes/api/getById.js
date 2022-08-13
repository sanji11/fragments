// src/routes/api/getById.js
const logger = require('../../logger');
//node path module: https://nodejs.org/api/path.html
const path = require('node:path');
// node.js, the same, but with sugar: https://github.com/markdown-it/markdown-it
const md = require('markdown-it')();
// https://github.com/stiang/remove-markdown
const removeMd = require('remove-markdown');
// https://github.com/html-to-text/node-html-to-text
const { htmlToText } = require('html-to-text');
// javascript content-type utility: https://www.npmjs.com/package/mime-types
const mime = require('mime-types');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');
// const fs = require('fs');

function successfulConversionResponse(fragmentData, fragmentType, extensionType, res) {
  //Update fragment type
  fragmentType = extensionType;
  logger.info({ fragmentType }, 'Final fragment type');
  //Set the header
  res.setHeader('Content-type', fragmentType);
  //Send successful response
  res.status(200).send(fragmentData);
}

/**
 * Gets an authenticated user's fragment data (i.e., raw binary data) with the given id
 * Only supporting 'text/*' and 'application/json' type
 */
module.exports = async (req, res) => {
  //Get the id of the fragment
  let fullId = req.params.id;
  //look for extension if given with the id and remove it to get the id
  let extension = path.extname(fullId);
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
      const fragment = new Fragment(await Fragment.byId(req.user, fullId));
      logger.info({ fragment }, 'Got fragment');
      let fragmentData = await fragment.getData();
      logger.info({ fragmentData }, 'Got fragment data');
      let fragmentType = fragment.type;

      /******************************* Markdown Conversion **************************/
      /** covert markdown to html*/
      //check if fragment.type is 'text/markdown' type and extension type is 'text/html'
      if (fragmentType === 'text/markdown' && extensionType === 'text/html') {
        fragmentData = md.render(fragmentData.toString());
        logger.info({ fragmentData }, 'Converted fragment data');
        successfulConversionResponse(fragmentData, fragmentType, extensionType, res);
      }
      /** covert markdown to plain*/
      //check if fragment.type is 'text/markdown' type and extension type is 'text/plain'
      else if (fragmentType === 'text/markdown' && extensionType === 'text/plain') {
        //fragmentType = extensionType;
        fragmentData = removeMd(fragmentData.toString());
        successfulConversionResponse(fragmentData, fragmentType, extensionType, res);
      }

      /******************************* HTML Conversion **************************/
      /** covert html to plain */
      //check if fragment.type is 'text/html' type and extension type is 'text/plain'
      else if (fragmentType === 'text/html' && extensionType === 'text/plain') {
        fragmentData = htmlToText(fragmentData.toString(), {
          wordwrap: 130,
          // By default, headings (<h1>, <h2>, etc) are upper cased; Set this to false to leave headings as they are.
          selectors: [
            { selector: 'h1', options: { uppercase: false } },
            { selector: 'h2', options: { uppercase: false } },
            { selector: 'h3', options: { uppercase: false } },
            { selector: 'h4', options: { uppercase: false } },
            { selector: 'h5', options: { uppercase: false } },
            { selector: 'h6', options: { uppercase: false } },
          ],
        });
        //fragmentData = fragmentData.toString().replace(/<[^>]*>/g, '');
        successfulConversionResponse(fragmentData, fragmentType, extensionType, res);
      }

      /******************************* Application/json Conversion **************************/
      /** covert application/json to plain */
      //check if fragment.type is 'application/json' type and extension type is 'text/plain'
      else if (fragmentType === 'application/json' && extensionType === 'text/plain') {
        fragmentData = fragmentData.toString();
        successfulConversionResponse(fragmentData, fragmentType, extensionType, res);
      } else {
        // if there is no extension or extension is same as fragment type
        if (!extension || fragmentType == extensionType) {
          logger.info({ fragmentType }, 'Final fragment type');
          res.setHeader('Content-type', fragmentType);
          if (fragmentType.startsWith('image/')) {
            console.log('********************************');
            console.log(fragmentData.toString('base64'));
            const b64 = fragmentData.toString('base64');
            // CHANGE THIS IF THE IMAGE YOU ARE WORKING WITH IS .jpg OR WHATEVER
            //const mimeType = 'image/png'; // e.g., image/png
            res.status(200).send(`<img src="data:${fragmentType};base64,${b64}" />`);
          } else {
            res.status(200).send(fragmentData);
          }
          /*let filename = 'tests/images/test.jpg';
          fs.writeFile(filename, fragmentData, 'binary', (err) => {
            if (!err) console.log(`${filename} created successfully!`);
          });*/
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
