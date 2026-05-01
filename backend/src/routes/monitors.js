const express = require('express')
const { requireAuth, requirePermission } = require('../middleware/auth')
const monitorsController = require('../controllers/monitorsController')

const router = express.Router()

// Specific routes FIRST (before :id wildcard)
router.get('/archived', requireAuth, requirePermission('monitor:read'), monitorsController.listArchivedMonitors)
router.post('/restore/:logId', requireAuth, requirePermission('monitor:create'), monitorsController.restoreMonitor)

// Generic routes LAST (with :id wildcard)
router.get('/', requireAuth, requirePermission('monitor:read'), monitorsController.listMonitors)
router.post('/', requireAuth, requirePermission('monitor:create'), monitorsController.createMonitor)
router.patch('/:id', requireAuth, requirePermission('monitor:update'), monitorsController.updateMonitor)
router.delete('/:id', requireAuth, requirePermission('monitor:delete'), monitorsController.deleteMonitor)

module.exports = router