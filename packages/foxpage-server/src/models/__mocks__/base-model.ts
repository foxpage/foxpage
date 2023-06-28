export class BaseModel {
  constructor() {}

  async exec() {
    return { status: true };
  }

  getList() {
    return [];
  }

  getById() {
    return {};
  }

  getCountDocuments() {
    return 1;
  }

  find() {
    return [];
  }

  findOne() {
    return {};
  }

  getDetailByIds() {
    return [];
  }

  addDetail() {
    return [];
  }

  updateDetail() {
    return {};
  }

  setDeleteStatus() {
    return {};
  }

  aggregate() {
    return {};
  }
}
