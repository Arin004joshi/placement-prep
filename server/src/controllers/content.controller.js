const mongoose = require("mongoose");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const Subtopic = require("../models/Subtopic");
const Topic = require("../models/Topic");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");
const { buildPaginationMeta, getPagination } = require("../utils/pagination");

const modelMap = {
  subjects: Subject,
  topics: Topic,
  subtopics: Subtopic,
  questions: Question
};

const allowedSortFields = new Set([
  "createdAt",
  "updatedAt",
  "displayOrder",
  "title",
  "name",
  "difficulty",
  "type"
]);

const getModel = (resource) => {
  const Model = modelMap[resource];

  if (!Model) {
    throw new AppError(`Unsupported resource: ${resource}`, 500);
  }

  return Model;
};

const parseSort = (sort = "createdAt") => {
  const direction = sort.startsWith("-") ? -1 : 1;
  const field = sort.replace(/^-/, "");

  if (!allowedSortFields.has(field)) {
    return { createdAt: -1 };
  }

  return { [field]: direction };
};

const buildFilter = (query, allowedFilters) => {
  const filter = {};

  for (const field of allowedFilters) {
    if (query[field] === undefined) {
      continue;
    }

    if (field.endsWith("Id")) {
      if (!mongoose.isValidObjectId(query[field])) {
        throw new AppError(`Invalid ${field}`, 400);
      }
      filter[field] = query[field];
    } else if (field === "isPublished") {
      filter[field] = query[field] === "true";
    } else {
      filter[field] = query[field];
    }
  }

  return filter;
};

const listResource = (resource, allowedFilters = []) =>
  asyncHandler(async (req, res) => {
    const Model = getModel(resource);
    const { page, limit, skip } = getPagination(req.query);
    const filter = buildFilter(req.query, allowedFilters);
    const sort = parseSort(req.query.sort);

    const [data, total] = await Promise.all([
      Model.find(filter).sort(sort).skip(skip).limit(limit),
      Model.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data,
      message: data.length ? undefined : "No published content is available yet.",
      pagination: buildPaginationMeta({ page, limit, total })
    });
  });

const getResource = (resource) =>
  asyncHandler(async (req, res) => {
    const Model = getModel(resource);
    const item = await Model.findById(req.params.id);

    if (!item) {
      throw new AppError("Resource not found", 404);
    }

    res.json({
      success: true,
      data: item
    });
  });

const createResource = (resource) =>
  asyncHandler(async (req, res) => {
    const Model = getModel(resource);
    const payload = { ...req.body };

    if (resource === "questions" && req.user) {
      payload.createdBy = req.user.id;
      payload.updatedBy = req.user.id;
    }

    const item = await Model.create(payload);

    res.status(201).json({
      success: true,
      data: item
    });
  });

const updateResource = (resource) =>
  asyncHandler(async (req, res) => {
    const Model = getModel(resource);
    const payload = { ...req.body };

    if (resource === "questions" && req.user) {
      payload.updatedBy = req.user.id;
    }

    const item = await Model.findById(req.params.id);

    if (!item) {
      throw new AppError("Resource not found", 404);
    }

    Object.assign(item, payload);
    await item.save();

    res.json({
      success: true,
      data: item
    });
  });

const deleteResource = (resource) =>
  asyncHandler(async (req, res) => {
    const Model = getModel(resource);
    const item = await Model.findById(req.params.id);

    if (!item) {
      throw new AppError("Resource not found", 404);
    }

    await item.deleteOne();

    res.status(204).send();
  });

module.exports = {
  listResource,
  getResource,
  createResource,
  updateResource,
  deleteResource
};
