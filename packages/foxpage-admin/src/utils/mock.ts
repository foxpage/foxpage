export const mergeSchemas = (target, source) => {
  const originSchemas = [...target];

  source.forEach((schema) => {
    const hasOrigin = originSchemas.find((item) => item.id === schema.id);
    // merge/push with status hasOrigin
    if (!!hasOrigin) {
      const newSchema = Object.assign({}, hasOrigin, schema);
      if (newSchema) {
        const originIdx = originSchemas.findIndex((item) => item.id === schema.id);
        originSchemas.splice(originIdx, 1, newSchema);
      }
    } else {
      originSchemas.push(schema);
    }
  });

  return originSchemas;
};
