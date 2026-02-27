
export class QueryBuilder<T> {
  // প্রিজমার জন্য কুয়েরি অবজেক্ট (ডিফল্ট ভ্যালুসহ)
  public query: any = {
    where: {},
    include: {},
    orderBy: { createdAt: 'desc' },
    skip: 0,
    take: 10,
  };

  constructor(
    private model: any, // Prisma model (e.g., prisma.doctor)
    private queryParams: Record<string, any> // req.query
  ) {}

  /**
   * SEARCH: মেথডের ভেতরেই ফিল্ড লিস্ট পাঠিয়ে দিলে সার্চ কাজ করবে।
   */
  search(searchableFields: string[]) {
    const { searchQuery } = this.queryParams // FROM url like example.com?searchQuery=habib
    if (searchQuery && searchableFields.length) {
      this.query.where.OR = searchableFields.map((field) => 
        this.buildNestedConditions(field, {
          contains: searchQuery,
          mode: 'insensitive',
        })
      );
    }
    return this;
  }

  /**
   * FILTER: এলাউড ফিল্ড লিস্ট দিলে শুধু সেগুলোই ফিল্টার হবে।
   */
  filter(filterableFields: string[]) {
    const filters = { ...this.queryParams };
    const excludedFields = ['searchQuery', 'page', 'limit', 'sortBy', 'sortOrder', 'fields'];

    excludedFields.forEach((f) => delete filters[f]);

  
    

    Object.keys(filters).forEach((key) => {
      if (filterableFields.includes(key)) {
        const value = filters[key];
        // ডাটাবেস কোয়েরি বিল্ড করা (সাপোর্টস নেস্টেড ফিল্ড)
        const condition = this.buildNestedConditions(key, value);
    
        this.query.where = { ...this.query.where, ...condition };
      }
    });
    console.log(this.query);
    
    return this;
  }

  /**
   * PAGINATION: পেজ এবং লিমিট ক্যালকুলেশন।
   */
  paginate() {
    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;
    this.query.skip = (page - 1) * limit;
    this.query.take = limit;
    return this;
  }
  /**
   * INCLUDE : পেজ এবং লিমিট ক্যালকুলেশন।
   */
 include(includeConfig?: Record<string, any>) {
    if (includeConfig) {
      this.query.include = includeConfig;
    } else if (this.queryParams.includes) {
      // যদি URL থেকে স্ট্রিং আসে তবে সেটা পার্স করা লাগতে পারে
      this.query.include = this.queryParams.includes;
    }
    return this;
  }

  /**
   * SORT: ডাইনামিক সর্টিং।
   */
  sort() {
    const sortBy = this.queryParams.sortBy || 'createdAt';
    const sortOrder = this.queryParams.sortOrder || 'desc';
    this.query.orderBy = { [sortBy]: sortOrder };
    return this;
  }

  /**
   * EXECUTE: ডাটা এবং টোটাল কাউন্ট একবারে নিয়ে আসে (Optimized with Promise.all)।
   */
  async execute() {
    const [data, total] = await Promise.all([
      this.model.findMany(this.query),
      this.model.count({ where: this.query.where }),
    ]);

    const page = Number(this.queryParams.page) || 1;
    const limit = Number(this.queryParams.limit) || 10;

    return {
      meta: {
        page,
        limit,
        total,
        totalPage: Math.ceil(total / limit),
      },
      data:data
    };
  }

  /**
   * PRIVATE HELPER: 'user.name' কে { user: { name: value } } এ রূপান্তর করে।
   */
  private buildNestedConditions(fieldPath: string, value: any) {
    const parts = fieldPath.split('.');
    const condition: any = {};
    let current = condition;

    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = value;
      } else {
        current[part] = {};
        current = current[part];
      }
    });
    return condition;
  }
}