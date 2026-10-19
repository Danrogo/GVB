import { type Context } from 'hono';
import * as reviewServices from './reviews.services.js';

export const getAllReviews = async (c: Context) => {
    try {
        const result = await reviewServices.getAllReviewsService();
        if (result.length === 0) {
            return c.json({ message: 'No reviews found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching reviews:', error.message);
        return c.json({ error: 'Failed to fetch reviews' }, 500);
    }
};

export const getReviewById = async (c: Context) => {
    const reviewId = c.req.param('reviewId');
    try {
        const result = await reviewServices.getReviewByIdService(reviewId);
        if (result === null) {
            return c.json({ error: 'Review not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching review:', error);
        return c.json({ error: 'Failed to fetch review' }, 500);
    }
};

export const getReviewsByService = async (c: Context) => {
    const serviceId = c.req.param('serviceId');
    try {
        const result = await reviewServices.getReviewsByServiceService(serviceId);
        if (result.length === 0) {
            return c.json({ message: 'No reviews found for this service' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return c.json({ error: 'Failed to fetch reviews' }, 500);
    }
};

export const getReviewsByStaff = async (c: Context) => {
    const staffId = c.req.param('staffId');
    try {
        const result = await reviewServices.getReviewsByStaffService(staffId);
        if (result.length === 0) {
            return c.json({ message: 'No reviews found for this staff member' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return c.json({ error: 'Failed to fetch reviews' }, 500);
    }
};

export const createReview = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.bookingId || !body.customerId || !body.serviceId || !body.rating) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['bookingId', 'customerId', 'serviceId', 'rating'] 
            }, 400);
        }

        if (body.rating < 1 || body.rating > 5) {
            return c.json({ error: 'Rating must be between 1 and 5' }, 400);
        }

        const result = await reviewServices.createReviewService(
            body.bookingId,
            body.customerId,
            body.staffId || null,
            body.serviceId,
            body.rating,
            body.comment || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to create review' }, 500);
        }

        return c.json({ 
            message: 'Review created successfully', 
            review: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating review:', error.message);
        return c.json({ error: 'Failed to create review' }, 500);
    }
};

export const approveReview = async (c: Context) => {
    const reviewId = c.req.param('reviewId');
    try {
        const result = await reviewServices.approveReviewService(reviewId);
        if (result === null) {
            return c.json({ error: 'Failed to approve review' }, 404);
        }
        return c.json({ message: 'Review approved successfully', review: result }, 200);
    } catch (error) {
        console.error('Error approving review:', error);
        return c.json({ error: 'Failed to approve review' }, 500);
    }
};

export const deleteReview = async (c: Context) => {
    const reviewId = c.req.param('reviewId');
    try {
        const result = await reviewServices.deleteReviewService(reviewId);
        if (result === null) {
            return c.json({ error: 'Failed to delete review' }, 404);
        }
        return c.json({ message: 'Review deleted successfully' }, 200);
    } catch (error) {
        console.error('Error deleting review:', error);
        return c.json({ error: 'Failed to delete review' }, 500);
    }
};
