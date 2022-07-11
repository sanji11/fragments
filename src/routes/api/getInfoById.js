// src/routes/api/getInfoById.js
const logger = require('../../logger');
// Success response function
const { createSuccessResponse } = require('../../../src/response');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Get (i.e., read) the metadata of authenticated users for one of their existing fragments with the specified id
 */
module.exports = async (req, res) => {
  //Get the id of the fragment
  var Id = req.params.id;
  logger.debug({ Id }, 'Got ID');

  try {
    const fragment = await Fragment.byId(req.user, Id);
    logger.info({ fragment }, 'Got fragment');
    const successResponse = createSuccessResponse({ fragment: fragment });
    res.status(200).send(successResponse);
  } catch (error) {
    //If the id does not exist, returns an HTTP 404 with an appropriate error message.
    logger.error({ error }, `Fragment with ${Id} does not exist`);
    res.status(404).json(createErrorResponse(404, `Fragment with ${Id} does not exist`));
  }
};
