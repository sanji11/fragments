// src/routes/api/putById.js
const logger = require('../../logger');
// Success response function
const { createSuccessResponse } = require('../../../src/response');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Allows the authenticated user to update (i.e., replace) the data for their existing fragment with the specified id
 */
module.exports = async (req, res) => {
  try {
    //Get the type user requested for the fragment
    const type = req.get('content-type');
    logger.debug({ type }, 'Got requested content type');
    // Get the requested fragment
    const fragment = await Fragment.byId(req.user, req.params.id);
    if (fragment.type == type) {
      //The entire request body is used to update the fragment's data, replacing the original value
      await fragment.setData(req.body);
      logger.info({ fragment }, `Fragment (data and metadata) has been updated`);
      //The successful response includes an HTTP 200 as well as updated fragment metadata
      //let updatedFragment = fragment;
      //updatedFragment.formats = fragment.formats;
      let successResponse = createSuccessResponse({
        fragment: fragment,
        formats: fragment.formats,
      });
      res.status(200).json(successResponse);
    } else {
      //If the Content-Type of the request does not match the existing fragment's type, returns an HTTP 400 with an appropriate error message.
      logger.error(
        { type },
        `Requested type ${type} does not match with original content type ${fragment.type} of fragment`
      );
      res
        .status(400)
        .json(createErrorResponse(400, `Requested type does not match with fragment's type`));
    }
  } catch (error) {
    //If no such fragment exists with the given id, returns an HTTP 404 with an appropriate error message
    logger.error({ error }, `Fragment with ${req.params.id} does not exist`);
    res.status(404).json(createErrorResponse(404, `Fragment with ${req.params.id} does not exist`));
  }
};
