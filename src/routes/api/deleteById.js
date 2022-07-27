// src/routes/api/deleteById.js
const logger = require('../../logger');
// Success response function
const { createSuccessResponse } = require('../../../src/response');
// Error response function
const { createErrorResponse } = require('../../response');
const { Fragment } = require('../../model/fragment');

/**
 * Allows the authenticated user to delete one of their existing fragments with the given id
 */
module.exports = async (req, res) => {
  //Get the id of the fragment
  var Id = req.params.id;
  logger.debug({ Id }, 'Got ID');

  try {
    await Fragment.delete(req.user, Id);
    logger.info({ Id }, 'Fragment is deleted');
    res.status(200).send(createSuccessResponse());
  } catch (error) {
    //If the id does not exist, returns an HTTP 404 with an appropriate error message.
    logger.error({ error }, `Fragment with ${Id} does not exist`);
    res.status(404).json(createErrorResponse(404, `Fragment with ${Id} does not exist`));
  }
};
