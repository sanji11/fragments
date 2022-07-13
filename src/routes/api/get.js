// src/routes/api/get.js

const logger = require('../../logger');
const { Fragment } = require('../../../src/model/fragment');

// Success response function
const { createSuccessResponse } = require('../../../src/response');
/**
 * Get a list of fragments for the current user
 */
module.exports = async (req, res) => {
  /* Get fragments for current user with expanded version of 
  fragments (include a full representations of the fragments' metadata) or just fragments' id*/
  const listOfFragments = await Fragment.byUser(req.user, req.query.expand);
  logger.info({ listOfFragments }, 'Got all the fragments created by current user');
  res.status(200).json(createSuccessResponse({ fragments: listOfFragments }));
};
