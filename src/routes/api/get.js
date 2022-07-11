// src/routes/api/get.js

const logger = require('../../logger');
const { Fragment } = require('../../../src/model/fragment');

// Success response function
const { createSuccessResponse } = require('../../../src/response');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  var expand = false;
  /* Check if the user requested expanded version of 
  fragments (include a full representations of the fragments' metadata) or just fragments' id*/
  if (req.query.expand === '1') {
    expand = true;
  }
  logger.debug({ expand }, 'Requested expanded version');
  // Get fragments for current user
  const listOfFragments = await Fragment.byUser(req.user, expand);
  logger.info({ listOfFragments }, 'Got all the fragments created by current user');
  const data = { fragments: listOfFragments };
  const successResponse = createSuccessResponse(data);
  res.status(200).json(successResponse);
};
