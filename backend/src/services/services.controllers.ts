import { type Context } from 'hono';
import * as serviceServices from './services.services.js';

export const getAllServices = async (c: Context) => {
    try {
        const result = await serviceServices.getAllServicesService();
        if (result.length === 0) {
            return c.json({ message: 'No services found' }, 404);
        }
        return c.json(result);
    } catch (error: any) {
        console.error('Error fetching services:', error.message);
        return c.json({ error: 'Failed to fetch services' }, 500);
    }
};

export const getServiceById = async (c: Context) => {
    const serviceId = c.req.param('serviceId');
    try {
        const result = await serviceServices.getServiceByIdService(serviceId);
        if (result === null) {
            return c.json({ error: 'Service not found' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching service:', error);
        return c.json({ error: 'Failed to fetch service' }, 500);
    }
};

export const getServicesByCategory = async (c: Context) => {
    const categoryId = c.req.param('categoryId');
    try {
        const result = await serviceServices.getServicesByCategoryService(categoryId);
        if (result.length === 0) {
            return c.json({ message: 'No services found for this category' }, 404);
        }
        return c.json(result);
    } catch (error) {
        console.error('Error fetching services:', error);
        return c.json({ error: 'Failed to fetch services' }, 500);
    }
};

export const createService = async (c: Context) => {
    try {
        const body = await c.req.json();
        
        if (!body.categoryId || !body.name || !body.durationMinutes || !body.price) {
            return c.json({ 
                error: 'Missing required fields', 
                required: ['categoryId', 'name', 'durationMinutes', 'price'] 
            }, 400);
        }

        const result = await serviceServices.createServiceService(
            body.categoryId,
            body.name,
            body.description || null,
            body.durationMinutes,
            body.price,
            body.depositAmount || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to create service' }, 500);
        }

        return c.json({ 
            message: 'Service created successfully', 
            service: result 
        }, 201);
    } catch (error: any) {
        console.error('Error creating service:', error.message);
        return c.json({ error: 'Failed to create service' }, 500);
    }
};

export const updateService = async (c: Context) => {
    try {
        const serviceId = c.req.param('serviceId');
        const body = await c.req.json();

        const checkExists = await serviceServices.getServiceByIdService(serviceId);
        if (checkExists === null) {
            return c.json({ error: 'Service not found' }, 404);
        }

        const result = await serviceServices.updateServiceService(
            serviceId,
            body.name,
            body.description || null,
            body.durationMinutes,
            body.price,
            body.depositAmount || null
        );

        if (result === null) {
            return c.json({ error: 'Failed to update service' }, 404);
        }

        return c.json({ message: 'Service updated successfully', service: result }, 200);
    } catch (error) {
        console.error('Error updating service:', error);
        return c.json({ error: 'Failed to update service' }, 500);
    }
};

export const deleteService = async (c: Context) => {
    const serviceId = c.req.param('serviceId');
    try {
        const check = await serviceServices.getServiceByIdService(serviceId);
        if (check === null) {
            return c.json({ error: 'Service not found' }, 404);
        }

        const result = await serviceServices.deleteServiceService(serviceId);
        if (result === null) {
            return c.json({ error: 'Failed to delete service' }, 404);
        }

        return c.json({ message: 'Service deleted successfully' }, 200);
    } catch (error) {
        console.error('Error deleting service:', error);
        return c.json({ error: 'Failed to delete service' }, 500);
    }
};
