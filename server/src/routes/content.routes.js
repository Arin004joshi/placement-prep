const express = require("express");
const {
  createResource,
  deleteResource,
  getResource,
  listResource,
  updateResource
} = require("../controllers/content.controller");
const { protect, restrictTo } = require("../middleware/auth.middleware");
const { sanitizeBody, validateObjectId } = require("../middleware/validate.middleware");

const router = express.Router();

const registerCrudRoutes = (path, resource, filters) => {
  router
    .route(path)
    .get(listResource(resource, filters))
    .post(protect, restrictTo("admin"), sanitizeBody, createResource(resource));

  router
    .route(`${path}/:id`)
    .get(validateObjectId("id"), getResource(resource))
    .patch(
      protect,
      restrictTo("admin"),
      validateObjectId("id"),
      sanitizeBody,
      updateResource(resource)
    )
    .delete(protect, restrictTo("admin"), validateObjectId("id"), deleteResource(resource));
};

registerCrudRoutes("/subjects", "subjects", ["isPublished"]);
registerCrudRoutes("/topics", "topics", ["subjectId", "isPublished"]);
registerCrudRoutes("/subtopics", "subtopics", ["subjectId", "topicId", "isPublished"]);
registerCrudRoutes("/questions", "questions", [
  "subjectId",
  "topicId",
  "subtopicId",
  "difficulty",
  "type",
  "isPublished"
]);

module.exports = router;
