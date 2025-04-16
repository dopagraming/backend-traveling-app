class apiFeatuer {
    constructor(mongooseQuery, queryString) {
        this.mongooseQuery = mongooseQuery;
        this.queryString = queryString
    }
    filter() {
        const queryStringObj = { ...this.queryString };
        const excludesFields = ["sort", 'limit', 'page', 'field']
        excludesFields.forEach((field) => delete queryStringObj[field]);
        let queryStr = JSON.stringify(queryStringObj)
        queryStr = queryStr
            .replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`)
        this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr))
        return this;
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ")
            this.mongooseQuery = this.mongooseQuery.sort(sortBy)
        } else {
            this.mongooseQuery = this.mongooseQuery.sort("-createAt")
        }
        return this
    }
    limitFields() {
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ")
            this.mongooseQuery = this.mongooseQuery.select(fields)
        } else {
            this.mongooseQuery = this.mongooseQuery.select("-__v")
        }
        return this
    }
    // Red
    search() {
        if (this.queryString.keywords) {
            const query = {}
            query.$or = [
                { title: { $regex: this.queryString.keywords, $options: "i" } },
                { description: { $regex: this.queryString.keywords, $options: "i" } },
            ]
        }
        return this
    }
    paginate(documnetCount) {
        const page = this.queryString.page * 1 || 1;
        const limit = this.queryString.limit * 1 || 10;
        const skip = (page - 1) * limit;
        const endIndex = page * limit // 1 10 10

        const pagination = {}
        pagination.page = page
        pagination.limit = limit
        pagination.numberOfPages = documnetCount / limit
        if (endIndex < documnetCount) { // 10 < 20
            pagination.next = page + 1
        }
        if (skip > 0) {
            pagination.prev = page - 1
        }
        this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit)
        this.paginationResult = pagination
        return this
    }
}

module.exports = apiFeatuer