// src/services/services.services.ts

import sql from 'mssql';
import { getDbPool } from '../db/config.js';

// =============================================
// Type Definitions
// =============================================

export interface Service {
  ServiceId: number;
  CategoryId: number;
  Name: string;
  Description: string | null;
  DurationMinutes: number;
  Price: number;
  DepositAmount: number | null;
  IsActive: boolean;
  IsDeleted: boolean;
  ImageUrl: string | null;
  CategoryName?: string; // optional when joining
}

// =============================================
// Service Functions
// =============================================

/**
 * Get all active services with category information
 */
export const getAllServicesService = async (): Promise<Service[]> => {
  try {
    const pool = getDbPool();
    const request = pool.request();

    const result = await request.query<Service>(`
      SELECT 
        s.ServiceId,
        s.CategoryId,
        sc.Name AS CategoryName,
        s.Name,
        s.Description,
        s.DurationMinutes,
        s.Price,
        s.DepositAmount,
        s.IsActive,
        s.IsDeleted,
        s.ImageUrl
      FROM Services s
      INNER JOIN ServiceCategories sc ON s.CategoryId = sc.CategoryId
      WHERE s.IsDeleted = 0
        AND s.IsActive = 1
      ORDER BY sc.DisplayOrder, s.Name
    `);

    return result.recordset;
  } catch (error) {
    console.error('Database error in getAllServicesService:', error);
    throw error;
  }
};

/**
 * Get a single service by ID
 */
export const getServiceByIdService = async (serviceId: string | number): Promise<Service | null> => {
  try {
    const id = Number(serviceId);
    if (isNaN(id)) return null;

    const pool = getDbPool();
    const request = pool.request();
    request.input('serviceId', sql.Int, id);

    const result = await request.query<Service>(`
      SELECT 
        s.ServiceId,
        s.CategoryId,
        sc.Name AS CategoryName,
        s.Name,
        s.Description,
        s.DurationMinutes,
        s.Price,
        s.DepositAmount,
        s.IsActive,
        s.IsDeleted,
        s.ImageUrl
      FROM Services s
      INNER JOIN ServiceCategories sc ON s.CategoryId = sc.CategoryId
      WHERE s.ServiceId = @serviceId
        AND s.IsDeleted = 0
    `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error('Database error in getServiceByIdService:', error);
    throw error;
  }
};

/**
 * Get all services by category ID
 */
export const getServicesByCategoryService = async (categoryId: string | number): Promise<Service[]> => {
  try {
    const id = Number(categoryId);
    if (isNaN(id)) return [];

    const pool = getDbPool();
    const request = pool.request();
    request.input('categoryId', sql.Int, id);

    const result = await request.query<Service>(`
      SELECT 
        s.ServiceId,
        s.CategoryId,
        sc.Name AS CategoryName,
        s.Name,
        s.Description,
        s.DurationMinutes,
        s.Price,
        s.DepositAmount,
        s.IsActive,
        s.IsDeleted,
        s.ImageUrl
      FROM Services s
      INNER JOIN ServiceCategories sc ON s.CategoryId = sc.CategoryId
      WHERE s.CategoryId = @categoryId
        AND s.IsDeleted = 0
        AND s.IsActive = 1
      ORDER BY s.Name
    `);

    return result.recordset;
  } catch (error) {
    console.error('Database error in getServicesByCategoryService:', error);
    throw error;
  }
};

/**
 * Create a new service
 */
export const createServiceService = async (
  categoryId: number,
  name: string,
  description: string | null,
  durationMinutes: number,
  price: number,
  depositAmount: number | null = null
): Promise<Service | null> => {
  try {
    const pool = getDbPool();
    const request = pool.request();

    request.input('categoryId', sql.Int, categoryId);
    request.input('name', sql.NVarChar(120), name);
    request.input('description', sql.NVarChar(1000), description);
    request.input('durationMinutes', sql.Int, durationMinutes);
    request.input('price', sql.Decimal(12, 2), price);
    request.input('depositAmount', sql.Decimal(12, 2), depositAmount);

    const result = await request.query<Service>(`
      INSERT INTO Services (
        CategoryId, Name, Description, DurationMinutes, 
        Price, DepositAmount, IsActive, IsDeleted
      )
      OUTPUT 
        INSERTED.ServiceId,
        INSERTED.CategoryId,
        INSERTED.Name,
        INSERTED.Description,
        INSERTED.DurationMinutes,
        INSERTED.Price,
        INSERTED.DepositAmount,
        INSERTED.IsActive,
        INSERTED.IsDeleted,
        INSERTED.ImageUrl
      VALUES (
        @categoryId, @name, @description, @durationMinutes,
        @price, @depositAmount, 1, 0
      )
    `);

    if (result.recordset.length === 0) return null;

    // Get category name for complete response
    const categoryResult = await pool.request()
      .input('catId', sql.Int, categoryId)
      .query(`SELECT Name AS CategoryName FROM ServiceCategories WHERE CategoryId = @catId`);

    const service = result.recordset[0];
    if (categoryResult.recordset.length > 0) {
      service.CategoryName = categoryResult.recordset[0].CategoryName;
    }

    return service;
  } catch (error) {
    console.error('Database error in createServiceService:', error);
    throw error;
  }
};

/**
 * Update an existing service
 */
export const updateServiceService = async (
  serviceId: string | number,
  name?: string,
  description?: string | null,
  durationMinutes?: number,
  price?: number,
  depositAmount?: number | null
): Promise<Service | null> => {
  try {
    const id = Number(serviceId);
    if (isNaN(id)) return null;

    const pool = getDbPool();
    const request = pool.request();
    request.input('serviceId', sql.Int, id);

    // Build dynamic SET clause
    const fields: string[] = [];

    if (name !== undefined) {
      fields.push('Name = @name');
      request.input('name', sql.NVarChar(120), name);
    }
    if (description !== undefined) {
      fields.push('Description = @description');
      request.input('description', sql.NVarChar(1000), description);
    }
    if (durationMinutes !== undefined) {
      fields.push('DurationMinutes = @durationMinutes');
      request.input('durationMinutes', sql.Int, durationMinutes);
    }
    if (price !== undefined) {
      fields.push('Price = @price');
      request.input('price', sql.Decimal(12, 2), price);
    }
    if (depositAmount !== undefined) {
      fields.push('DepositAmount = @depositAmount');
      request.input('depositAmount', sql.Decimal(12, 2), depositAmount);
    }

    if (fields.length === 0) return null; // nothing to update

    const query = `
      UPDATE Services
      SET ${fields.join(', ')}
      OUTPUT 
        INSERTED.ServiceId,
        INSERTED.CategoryId,
        INSERTED.Name,
        INSERTED.Description,
        INSERTED.DurationMinutes,
        INSERTED.Price,
        INSERTED.DepositAmount,
        INSERTED.IsActive,
        INSERTED.IsDeleted,
        INSERTED.ImageUrl
      WHERE ServiceId = @serviceId
        AND IsDeleted = 0
    `;

    const result = await request.query<Service>(query);

    if (result.recordset.length === 0) return null;

    const service = result.recordset[0];

    // Add category name
    const catResult = await pool.request()
      .input('catId', sql.Int, service.CategoryId)
      .query(`SELECT Name AS CategoryName FROM ServiceCategories WHERE CategoryId = @catId`);

    if (catResult.recordset.length > 0) {
      service.CategoryName = catResult.recordset[0].CategoryName;
    }

    return service;
  } catch (error) {
    console.error('Database error in updateServiceService:', error);
    throw error;
  }
};

/**
 * Soft delete a service (marks as deleted)
 */
export const deleteServiceService = async (serviceId: string | number): Promise<Service | null> => {
  try {
    const id = Number(serviceId);
    if (isNaN(id)) return null;

    const pool = getDbPool();
    const request = pool.request();
    request.input('serviceId', sql.Int, id);

    const result = await request.query<Service>(`
      UPDATE Services
      SET IsDeleted = 1,
          IsActive = 0
      OUTPUT 
        INSERTED.ServiceId,
        INSERTED.CategoryId,
        INSERTED.Name,
        INSERTED.Description,
        INSERTED.DurationMinutes,
        INSERTED.Price,
        INSERTED.DepositAmount,
        INSERTED.IsActive,
        INSERTED.IsDeleted,
        INSERTED.ImageUrl
      WHERE ServiceId = @serviceId
        AND IsDeleted = 0
    `);

    return result.recordset.length > 0 ? result.recordset[0] : null;
  } catch (error) {
    console.error('Database error in deleteServiceService:', error);
    throw error;
  }
};
