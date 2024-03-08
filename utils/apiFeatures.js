class APIFeatures{
    constructor(query,queryParam){
        this.query = query;
        this.queryParam = queryParam;
    }
    filter(){
        //BUILD QUERY
        //1A) Filtering
        let queryObj = {...this.queryParam};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])


        //1B)Advanced Filtering
        //convert the query object to a string and convert gte and the likes to $gte
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        queryObj = JSON.parse(queryStr);


        this.query= this.query.find(queryObj);
        return this;
    }
    sort(){
        //2)Sorting
        if (this.queryParam.sort) {
            const sortBy = this.queryParam.sort.split(',').join(' ');
            console.log(sortBy);
            this.query.sort(sortBy);
        } else {
            this.query.sort('-createdAt');
        }
        return this;
    }


    limit(){
        //3)Field Limiting
        if (this.queryParam.fields) {
            const fields = this.queryParam.fields.split(',').join(' ');
            this.query.select(fields);
        } else {
            this.query.select('-__v')
        }
        return this;
    }
    pagination(){
        //4)Pagination
        const page = this.queryParam.page * 1 || 1;
        const limit = this.queryParam.limit * 1 || 10;
        const skip = (page - 1) * limit;
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }

}

module.exports = APIFeatures