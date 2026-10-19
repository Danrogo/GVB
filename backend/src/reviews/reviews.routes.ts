import { Hono } from 'hono';
import * as reviewControllers from './reviews.controllers.js';

const reviewRoutes = new Hono();

reviewRoutes.get('/reviews', reviewControllers.getAllReviews);
reviewRoutes.get('/reviews/:reviewId', reviewControllers.getReviewById);
reviewRoutes.get('/reviews/service/:serviceId', reviewControllers.getReviewsByService);
reviewRoutes.get('/reviews/staff/:staffId', reviewControllers.getReviewsByStaff);
reviewRoutes.post('/reviews', reviewControllers.createReview);
reviewRoutes.put('/reviews/:reviewId/approve', reviewControllers.approveReview);
reviewRoutes.delete('/reviews/:reviewId', reviewControllers.deleteReview);

export default reviewRoutes;