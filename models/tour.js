const mongoose = require('mongoose');
const slugify = require('slugify');
const tourSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Tour Name is required'],
        unique: true,
        trim: true,
        maxlength: [40, 'Max Length of Name is 40'],
        minlength: [10, 'Min Length of Name is 10']

    },
    slug: {
        type: String
    },
    duration: {
        type: Number,
        required: [true, 'Tour Duration is required']
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'Tour Max Group Size is required']
    },
    difficulty: {
        type: String,
        required: [true, 'Tour Difficulty is required'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: ""
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'Tour Summary is required']
    },

    price: {
        type: Number,
        required: [true, 'Tour Price is required']
    },
    priceDiscount: {
        type: Number,

        validate:{
            validator:function (value) {
                return value < this.price

            },
        message: 'Price Discount should be less than Price ({VALUE})'
        }

    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'Tour Image Cover is required']
    },
    images: {
        type: [String],
    },

    startDates: {
        type: [Date],

    },
    secretTour: {
        type: Boolean
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
}, {
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
})

tourSchema.virtual('durationWeeks').get(function () {
    return this.duration / 7
})


tourSchema.pre('save', function (next) {
    this.slug = slugify(this.name, {lower: true});
    //output niggers
    //output "nigger"
    next();
})

tourSchema.post('save', function (doc, next) {
    console.log(doc);
    next();

})

//all finds
tourSchema.pre(/^find/, function (next) {
    this.find({secretTour: {$ne: true}});
    this.start = Date.now();
    next();
})

tourSchema.post(/^find/, function (docs, next) {
    console.log(`Query took ${Date.now() - this.start} milliseconds`);
    next();
})

//aggregate
tourSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}});
    next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
