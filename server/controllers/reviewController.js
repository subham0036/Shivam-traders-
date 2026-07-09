import Review from '../models/Review.js';
import Product from '../models/Product.js';

// @desc    Get product reviews
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  const reviews = await Review.find({ product: req.params.productId, isApproved: true })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });
  res.json({ success: true, data: reviews });
};

// @desc    Create review
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  const { productId, rating, title, comment } = req.body;
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return res.status(400).json({ success: false, message: 'Already reviewed this product' });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    name: req.user.name,
    rating,
    title,
    comment,
    isVerified: true,
  });

  const reviews = await Review.find({ product: productId, isApproved: true });
  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
  await Product.findByIdAndUpdate(productId, { rating: avgRating, numReviews: reviews.length });

  res.status(201).json({ success: true, data: review });
};

// @desc    Add product question
// @route   POST /api/reviews/questions
export const addQuestion = async (req, res) => {
  const product = await Product.findById(req.body.productId);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

  product.questions.push({
    user: req.user?._id,
    name: req.body.name || req.user?.name || 'Guest',
    question: req.body.question,
  });
  await product.save();
  res.status(201).json({ success: true, data: product.questions });
};

// @desc    Answer question (admin)
// @route   PUT /api/reviews/questions/:productId/:questionId
export const answerQuestion = async (req, res) => {
  const product = await Product.findById(req.params.productId);
  const question = product.questions.id(req.params.questionId);
  if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

  question.answer = req.body.answer;
  question.answeredBy = req.user._id;
  question.answeredAt = new Date();
  await product.save();
  res.json({ success: true, data: question });
};
