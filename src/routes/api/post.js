// src/routes/api/post.js
const logger = require('../../logger');
// Use https://www.npmjs.com/package/content-type to create/parse Content-Type headers
const contentType = require('content-type');
const { Fragment } = require('../../../src/model/fragment');

// Error response function
const { createErrorResponse } = require('../../response');

// Success response function
const { createSuccessResponse } = require('../../response');

const apiUrl = process.env.API_URL;

/**
 * Creates a new fragment for the current (i.e., authenticated user)
 * The client posts a file (raw binary data) in the body of the request
 * and sets the Content-Type header to the desired type of the fragment.
 */
module.exports = async (req, res) => {
  //Check if the type is one of the supported types.
  const { type } = contentType.parse(req);
  const isSupported = Fragment.isSupportedType(type);
  if (isSupported) {
    //Generate a new fragment metadata record for the data,
    //const hashedEmail = crypto.createHash('sha256').update(req.user).digest('hex'); //ownerID
    const size = Number(req.headers['content-length']);

    //Store both the data and metadata.
    console.log(req.user);
    const newFragment = new Fragment({ ownerId: req.user, type: type, size: size });
    logger.info({ newFragment }, `Text fragment (data and metadata) created`);
    await newFragment.save();
    await newFragment.setData(req.body);
    const savedFragment = await Fragment.byId(newFragment.ownerId, newFragment.id);
    logger.info({ savedFragment }, `Text fragment (data and metadata) saved to database`);

    /*A successful response returns an HTTP 201.
     It includes a Location header with a full URL to use in order to access the newly created fragment. */
    let successResponse = createSuccessResponse({ fragment: savedFragment });
    const fullURL = apiUrl + '/v1/fragments/' + savedFragment.id;
    res.setHeader('location', fullURL);
    res.status(201).json(successResponse);
  } else {
    //If unsupported type, returns an HTTP 415 with an appropriate error message.*/
    logger.error({ type }, `Unsupported fragment type`);
    const errorResponse = createErrorResponse(415, `unsupported fragment type; got type=${type}`);
    res.status(415).json(errorResponse);
  }
};
