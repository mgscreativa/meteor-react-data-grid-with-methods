import SimpleSchema from 'simpl-schema';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import Documents from './documents';
import rateLimit from '../../modules/rate-limit.js';

export const findDocument = new ValidatedMethod({
  name: 'documents.find',
  validate: new SimpleSchema({
    perPage: { type: SimpleSchema.Integer, optional: false },
    filters: { type: Object, optional: false },
    'filters.title': { type: Object, optional: true },
    'filters.title.$regex': { type: String, optional: true },
    'filters.title.$options': { type: String, optional: true },
    'filters.body': { type: Object, optional: true },
    'filters.body.$regex': { type: String, optional: true },
    'filters.body.$options': { type: String, optional: true },
    sort: { type: Object, optional: false },
    'sort._id': { type: SimpleSchema.Integer, optional: true },
    'sort.title': { type: SimpleSchema.Integer, optional: true },
  }).validator(),
  run(options) {
    const query = {
      filters: {},
      options: {},
    };

    if (Object.keys(options.filters).length > 0) {
      query.filters.$or = [
        { title: options.filters.title },
        { body: options.filters.body },
      ];
    }

    query.options = {
      // fields: this.fields(),
      sort: options.sort,
      // skip: (this.currentPage() - 1) * this.perPage(),
      limit: options.perPage,
      $explain: 1,
    };

    console.log(
      'findDocument',
      'find',
      JSON.stringify(query.filters),
      'options',
      JSON.stringify(query.options)
    );

    return {
      totalItems: Documents.find().count(),
      documents: Documents.find(query.filters, query.options).fetch(),
    };
  },
});

export const upsertDocument = new ValidatedMethod({
  name: 'documents.upsert',
  validate: new SimpleSchema({
    _id: { type: String, optional: true },
    title: { type: String, optional: true },
    body: { type: String, optional: true },
  }).validator(),
  run(document) {
    return Documents.upsert({ _id: document._id }, { $set: document });
  },
});

export const removeDocument = new ValidatedMethod({
  name: 'documents.remove',
  validate: new SimpleSchema({
    _id: { type: String },
  }).validator(),
  run({ _id }) {
    Documents.remove(_id);
  },
});

rateLimit({
  methods: [
    upsertDocument,
    removeDocument,
  ],
  limit: 5,
  timeRange: 1000,
});
