'use strict';

const { models, sequelize } = require('../../../models');
const AppError = require('../../../utils/AppError');
const { success, created, noContent } = require('../../../utils/response');

async function listCatalog(req, res) {
  const rows = await models.SoftwareCatalogItem.findAll({
    where: { organization_id: req.user.organizationId },
    order: [['name', 'ASC']],
  });
  return success(res, rows);
}

async function getCatalogItem(req, res) {
  const row = await models.SoftwareCatalogItem.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
    include: [{ model: models.DeviceSoftware, as: 'installs' }],
  });
  if (!row) throw AppError.notFound('Software item not found');
  return success(res, row);
}

async function createCatalogItem(req, res) {
  const row = await models.SoftwareCatalogItem.create({
    ...req.body,
    organization_id: req.user.organizationId,
  });
  return created(res, row);
}

async function updateCatalogItem(req, res) {
  const row = await models.SoftwareCatalogItem.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Software item not found');
  await row.update(req.body);
  return success(res, row);
}

async function removeCatalogItem(req, res) {
  const row = await models.SoftwareCatalogItem.findOne({
    where: { id: req.params.id, organization_id: req.user.organizationId },
  });
  if (!row) throw AppError.notFound('Software item not found');
  await row.destroy();
  return noContent(res);
}

async function assignToDevice(req, res) {
  const { deviceId } = req.params;
  const { software_catalog_item_id: softwareId, version, status, license_reference: license } = req.body;
  return sequelize.transaction(async (transaction) => {
    const device = await models.Device.findOne({
      where: { id: deviceId, organization_id: req.user.organizationId },
      transaction,
    });
    if (!device) throw AppError.notFound('Device not found');

    const software = await models.SoftwareCatalogItem.findOne({
      where: { id: softwareId, organization_id: req.user.organizationId },
      transaction,
    });
    if (!software) throw AppError.notFound('Software item not found');

    if (
      software.total_seats !== null &&
      software.total_seats !== undefined &&
      Number(software.seats_allocated || 0) >= Number(software.total_seats)
    ) {
      throw AppError.conflict('No seats available for this software');
    }

    const [row, wasCreated] = await models.DeviceSoftware.findOrCreate({
      where: { device_id: deviceId, software_catalog_item_id: softwareId },
      defaults: {
        device_id: deviceId,
        software_catalog_item_id: softwareId,
        installed_at: new Date(),
        version: version || software.version || null,
        status: status || 'installed',
        license_reference: license || null,
        installed_by: req.user.id,
      },
      transaction,
    });

    if (wasCreated) {
      software.seats_allocated = Number(software.seats_allocated || 0) + 1;
      await software.save({ transaction });
    } else {
      if (version) row.version = version;
      if (status) row.status = status;
      if (license !== undefined) row.license_reference = license;
      await row.save({ transaction });
    }

    return created(res, row);
  });
}

async function unassignFromDevice(req, res) {
  const { deviceId, id } = req.params;
  return sequelize.transaction(async (transaction) => {
    const row = await models.DeviceSoftware.findOne({
      where: { id, device_id: deviceId },
      include: [{ model: models.SoftwareCatalogItem, as: 'software', required: true }],
      transaction,
    });
    if (!row || row.software.organization_id !== req.user.organizationId) {
      throw AppError.notFound('Install not found');
    }
    const software = row.software;
    await row.destroy({ transaction });
    software.seats_allocated = Math.max(0, Number(software.seats_allocated || 0) - 1);
    await software.save({ transaction });
    return noContent(res);
  });
}

async function listForDevice(req, res) {
  const rows = await models.DeviceSoftware.findAll({
    where: { device_id: req.params.deviceId },
    include: [
      { model: models.SoftwareCatalogItem, as: 'software', required: true, where: { organization_id: req.user.organizationId } },
    ],
    order: [[{ model: models.SoftwareCatalogItem, as: 'software' }, 'name', 'ASC']],
  });
  return success(res, rows);
}

module.exports = {
  listCatalog,
  getCatalogItem,
  createCatalogItem,
  updateCatalogItem,
  removeCatalogItem,
  assignToDevice,
  unassignFromDevice,
  listForDevice,
};
